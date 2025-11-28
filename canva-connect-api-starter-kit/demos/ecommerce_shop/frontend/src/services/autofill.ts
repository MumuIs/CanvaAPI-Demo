import type {
  Asset,
  BrandTemplate,
  CreateDesignAutofillJobRequest,
  Dataset,
  GetBrandTemplateDatasetResponse,
  GetDesignAutofillJobResponse,
} from "@canva/connect-api-ts/types.gen";
import type { Product, ProductAutofillDataset } from "src/models";
import { poll } from "../../../../common/utils/poll";
import type { Client } from "@hey-api/client-fetch";
import { AutofillService, BrandTemplateService } from "@canva/connect-api-ts";
import type { Assets } from "./asset";

/**
 * Field mapping configuration for autofill.
 * Maps template field names to product data or custom values.
 */
export type FieldMapping = {
  templateFieldName: string; // The field name in the template dataset
  fieldType: "text" | "image" | "chart";
  value?: string | { asset_id: string }; // For text: string, for image: { asset_id: string }
  source?: "product" | "discount" | "custom"; // Where the value comes from
  productField?: "name" | "price" | "image"; // If source is "product", which product field
};

export class Autofill {
  private static requiredPromoAutofillData = ["name", "image", "price"];

  constructor(
    private client: Client,
    private assets: Assets,
  ) {}

  /**
   * Lists brand templates with optional filtering and search.
   * @param {Object} options - The options object.
   * @param {string} options.query - Optional search query to filter templates by name.
   * @param {"any" | "non_empty"} options.datasetFilter - Filter templates by dataset presence. Defaults to "non_empty" to show only templates with autofill support.
   * @returns {Promise<BrandTemplate[]>} A promise that resolves with the list of brand templates.
   */
  async listBrandTemplates(options?: {
    query?: string;
    datasetFilter?: "any" | "non_empty";
  }): Promise<BrandTemplate[]> {
    const { query, datasetFilter = "non_empty" } = options || {};
    
    const result = await BrandTemplateService.listBrandTemplates({
      client: this.client,
      query: {
        query,
        dataset: datasetFilter,
      },
    });

    if (result.error) {
      console.error(result.error);
      throw new Error(result.error.message);
    }

    let items = result.data.items;
    let continuation = result.data.continuation;

    while (continuation) {
      const nextResult = await BrandTemplateService.listBrandTemplates({
        client: this.client,
        query: {
          query,
          dataset: datasetFilter,
          continuation,
        },
      });

      if (nextResult.error) {
        console.error(nextResult.error);
        throw new Error(nextResult.error.message);
      }

      items = items.concat(nextResult.data.items);
      continuation = nextResult.data.continuation;
    }

    return items;
  }

  /**
   * Auto-fills a brand template with custom field mappings.
   * @param {Object} options - The options object.
   * @param {string} options.brandTemplateId - The ID of the brand template to autofill.
   * @param {FieldMapping[]} options.fieldMappings - Custom field mappings for the template.
   * @returns {Promise<GetDesignAutofillJobResponse>} A promise that resolves with the autofill job response.
   */
  async autoFillTemplateWithMappings({
    brandTemplateId,
    fieldMappings,
  }: {
    brandTemplateId: string;
    fieldMappings: FieldMapping[];
  }): Promise<GetDesignAutofillJobResponse> {
    try {
      // Validate that we have mappings
      if (!fieldMappings || fieldMappings.length === 0) {
        throw new Error("至少需要一个字段映射");
      }

      // Construct autofill data from mappings
      const autofillData: Dataset = {};
      
      for (const mapping of fieldMappings) {
        if (!mapping.value) {
          throw new Error(`字段 "${mapping.templateFieldName}" 缺少值`);
        }

        if (mapping.fieldType === "image") {
          autofillData[mapping.templateFieldName] = {
            type: "image",
            asset_id: typeof mapping.value === "object" ? mapping.value.asset_id : mapping.value,
          };
        } else if (mapping.fieldType === "text") {
          autofillData[mapping.templateFieldName] = {
            type: "text",
            text: typeof mapping.value === "string" ? mapping.value : String(mapping.value),
          };
        } else if (mapping.fieldType === "chart") {
          // Chart type not supported in this demo, but structure is here for future use
          throw new Error(`图表类型字段暂不支持`);
        }
      }

      const autofillJobResponse = await this.postAutofill(
        brandTemplateId,
        autofillData,
      );

      return poll(() => this.getAutofillJobStatus(autofillJobResponse.job.id));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Auto-fills a brand template with product data (legacy method, maintains backward compatibility).
   * @param {Object} options - The options object.
   * @param {string} options.brandTemplateId - The ID of the brand template to autofill.
   * @param {Product} options.product - The product data to autofill.
   * @param {string} options.discount - The discount to autofill.
   * @returns {Promise<GetAutofillJobResponse>} A promise that resolves with the autofill job response.
   */
  async autoFillTemplateWithProduct({
    brandTemplateId,
    product,
    discount,
  }: {
    brandTemplateId: string;
    product: Product;
    discount: string;
  }): Promise<GetDesignAutofillJobResponse> {
    try {
      const response = await BrandTemplateService.getBrandTemplateDataset({
        client: this.client,
        path: {
          brandTemplateId,
        },
      });
      if (response.error) {
        console.log(response.error);
        throw new Error(response.error.message);
      }
      if (!response.data || !response.data.dataset) {
        throw new Error("Dataset for brand template is undefined.");
      }
      const dataset = response.data.dataset;

      if (!Autofill.isDataSetCompatible(dataset)) {
        const missingFields = Autofill.getMissingFields(dataset);
        const availableFields = Object.keys(dataset).map(fieldName => {
          const fieldData = dataset[fieldName];
          return `${fieldName} (${fieldData.type || "unknown"})`;
        });
        
        throw new Error(
          `品牌模板缺少必要的数据字段，无法用于创建促销设计。\n` +
          `缺少的字段：${missingFields.join(", ")}\n` +
          `必需字段：${Autofill.requiredPromoAutofillData.join(", ")}\n` +
          `模板包含的字段：${availableFields.length > 0 ? availableFields.join(", ") : "无"}`,
        );
      }

      const asset = await this.assets.uploadAsset({
        name: product.name,
        imageUrl: product.imageUrl,
      });

      const autofillData = Autofill.constructPromoAutofillData(
        product,
        discount,
        asset,
      );

      const autofillJobResponse = await this.postAutofill(
        brandTemplateId,
        autofillData,
      );

      return poll(() => this.getAutofillJobStatus(autofillJobResponse.job.id));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private static isDataSetCompatible(
    dataSet: Required<GetBrandTemplateDatasetResponse>["dataset"],
  ): boolean {
    return Autofill.requiredPromoAutofillData.every((key) => key in dataSet);
  }

  /**
   * Gets the list of missing required fields from a dataset.
   * @param {Dataset} dataSet - The dataset to check.
   * @returns {string[]} An array of missing field names.
   */
  private static getMissingFields(
    dataSet: Required<GetBrandTemplateDatasetResponse>["dataset"],
  ): string[] {
    return Autofill.requiredPromoAutofillData.filter((key) => !(key in dataSet));
  }

  /**
   * Gets the dataset fields for a brand template.
   * @param {string} brandTemplateId - The ID of the brand template.
   * @returns {Promise<{fieldName: string, fieldType: string}[]>} A promise that resolves with an array of field information.
   */
  async getBrandTemplateFields(brandTemplateId: string): Promise<Array<{fieldName: string; fieldType: string}>> {
    try {
      const response = await BrandTemplateService.getBrandTemplateDataset({
        client: this.client,
        path: {
          brandTemplateId,
        },
      });
      
      if (response.error) {
        console.error(response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.dataset) {
        return [];
      }
      
      const dataset = response.data.dataset;
      return Object.entries(dataset).map(([fieldName, fieldData]) => ({
        fieldName,
        fieldType: fieldData.type || "unknown",
      }));
    } catch (error) {
      console.error("Error getting brand template fields:", error);
      throw error;
    }
  }

  /**
   * Constructs autofill data from product, discount and asset metadata.
   * @param {Product} product - The product data.
   * @param {string} discount - The discount.
   * @param {Asset} asset - The asset.
   * @returns {ProductAutofillDataset} The constructed autofill data for a product.
   */
  private static constructPromoAutofillData(
    product: Product,
    discount: string,
    asset: Asset,
  ): ProductAutofillDataset {
    return {
      name: {
        type: "text",
        text: product.name,
      },
      image: {
        type: "image",
        asset_id: asset.id,
      },
      price: {
        type: "text",
        text: `$${product.price.toFixed(2)}`,
      },
      discount: {
        type: "text",
        text: `Save ${discount}`,
      },
    } satisfies Dataset;
  }

  private async getAutofillJobStatus(
    jobId: string,
  ): Promise<GetDesignAutofillJobResponse> {
    const result = await AutofillService.getDesignAutofillJob({
      client: this.client,
      path: {
        jobId,
      },
    });

    if (result.error) {
      console.log(result.error);
      throw new Error(result.error.message);
    }

    return result.data;
  }

  private async postAutofill(
    brandTemplateId: string,
    autofillData: Dataset | ProductAutofillDataset,
  ): Promise<GetDesignAutofillJobResponse> {
    const body: CreateDesignAutofillJobRequest = {
      data: autofillData,
      brand_template_id: brandTemplateId,
    };
    const result = await AutofillService.createDesignAutofillJob({
      client: this.client,
      path: {
        brandTemplateId,
      },
      body,
    });

    if (result.error) {
      console.log(result.error);
      throw new Error(result.error.message);
    }

    return result.data;
  }
}
