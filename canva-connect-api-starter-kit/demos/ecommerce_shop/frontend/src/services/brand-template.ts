import type { BrandTemplate, Design, GetDesignAutofillJobResponse } from "@canva/connect-api-ts/types.gen";
import type { Client } from "@hey-api/client-fetch";
import { BrandTemplateService as CanvaBrandTemplateService, AutofillService } from "@canva/connect-api-ts";
import { createNavigateToCanvaUrl } from "./canva-return";
import type { CorrelationState } from "src/models";
import { poll } from "../../../../common/utils/poll";

export class BrandTemplates {
  constructor(private client: Client) {}

  async listBrandTemplates(): Promise<BrandTemplate[]> {
    const result = await CanvaBrandTemplateService.listBrandTemplates({ client: this.client });
    if (result.error) throw new Error(result.error.message);

    let items = result.data.items;
    let continuation = result.data.continuation;
    while (continuation) {
      const next = await CanvaBrandTemplateService.listBrandTemplates({ client: this.client, query: { continuation } });
      if (next.error) throw new Error(next.error.message);
      items = items.concat(next.data.items);
      continuation = next.data.continuation;
    }
    return items;
  }

  /**
   * 直接使用品牌模板的 create_url 打开（不保留 return_nav）。
   */
  async openTemplateCreateUrl(brandTemplateId: string): Promise<void> {
    const tpl = await this.getBrandTemplate(brandTemplateId);
    if (!tpl.create_url) {
      throw new Error("该品牌模板缺少 create_url，无法直接打开。");
    }
    window.open(tpl.create_url, "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");
  }

  async getBrandTemplate(brandTemplateId: string): Promise<BrandTemplate> {
    const result = await CanvaBrandTemplateService.getBrandTemplate({
      client: this.client,
      path: { brandTemplateId },
    });
    if (result.error) throw new Error(result.error.message);
    return result.data.brand_template;
  }

  private buildReturnNavUrl(): string {
    return `${process.env.BACKEND_URL || "http://127.0.0.1:3001"}/return-nav`;
  }

  private createUrlWithReturnNav(urlStr: string, correlationState: CorrelationState): URL {
    const url = new URL(urlStr);
    url.searchParams.append("return_nav_url", this.buildReturnNavUrl());
    // 使用现有 createNavigateToCanvaUrl 的编码方式保持一致
    const encoded = btoa(JSON.stringify(correlationState));
    url.searchParams.append("correlation_state", encoded);
    return url;
  }

  async createDesignFromTemplateViaAPI(
    brandTemplateId: string,
    correlationState: CorrelationState,
  ): Promise<{ design: Design; navigateUrl: string }> {
    // 使用 Autofill API 基于品牌模板创建新设计（可传空数据集）
    const start = await AutofillService.createDesignAutofillJob({
      client: this.client,
      path: { brandTemplateId },
      body: {
        brand_template_id: brandTemplateId,
        // 可选：title 不传则沿用模板标题
        // title: `Brand Template Design - ${brandTemplateId}`
        data: {},
      },
    });
    if (start.error) throw new Error(start.error.message);

    const job = await poll(async (): Promise<GetDesignAutofillJobResponse> => {
      const r = await AutofillService.getDesignAutofillJob({
        client: this.client,
        path: { jobId: start.data.job.id },
      });
      if (r.error) throw new Error(r.error.message);
      return r.data;
    }, 1000, 30_000);

    if (job.job.status !== "success" || job.result?.type !== "create_design") {
      throw new Error("Autofill job did not succeed.");
    }

    const design = job.result.design as Design;
    const url = this.createUrlWithReturnNav(design.urls.edit_url, correlationState);
    window.open(url.toString(), "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");
    return { design, navigateUrl: url.toString() };
  }

  async createMultipleDesignsFromTemplates(
    brandTemplateIds: string[],
    correlationState: CorrelationState,
  ): Promise<{ designs: Array<{ brandTemplateId: string; navigateUrl: string }> }> {
    const results = await Promise.allSettled(
      brandTemplateIds.map(async (id) => {
        const tpl = await this.getBrandTemplate(id);
        const url = this.createUrlWithReturnNav(tpl.create_url, correlationState);
        window.open(url.toString(), "_blank", "width=1200,height=800,scrollbars=yes,resizable=yes");
        return { brandTemplateId: id, navigateUrl: url.toString() };
      }),
    );

    const designs = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((x): x is NonNullable<typeof x> => x !== null);
    return { designs };
  }
}


