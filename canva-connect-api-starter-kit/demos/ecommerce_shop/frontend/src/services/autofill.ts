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

export class Autofill {
  private static requiredPromoAutofillData = ["name", "image", "price"];

  constructor(
    private client: Client,
    private assets: Assets,
  ) {}

  async listBrandTemplates(): Promise<BrandTemplate[]> {
    const result = await BrandTemplateService.listBrandTemplates({
      client: this.client,
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
   * Auto-fills a brand template with product data.
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
        throw new Error(
          `品牌模板缺少必要的数据字段，无法用于创建促销设计。缺少的字段：${missingFields.join(", ")}。必需字段：${Autofill.requiredPromoAutofillData.join(", ")}。`,
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
    autofillData: ProductAutofillDataset,
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
