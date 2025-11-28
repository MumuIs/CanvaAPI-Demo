import { useEffect, useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import { Grid, Stack, Typography } from "@mui/material";
import {
  AutofillResults,
  GeneratingDesignsDialog,
  MultipleDesignsCampaignForm,
  PageDescriptor,
  PublishCampaignButtons,
  PublishDialog,
} from "src/components";
import { useAppContext, useCampaignContext } from "src/context";
import { saveDesignToContentLibrary } from "src/utils/content-library";
import type { FieldMapping } from "src/services/autofill";

export const MultipleDesignsGeneratorPage = () => {
  const {
    addAlert,
    selectedCampaignProduct,
    marketingMultiDesignResults,
    setMarketingMultiDesignResults,
    services,
  } = useAppContext();
  const {
    campaignName,
    selectedDiscount,
    selectedBrandTemplates,
    setSelectedBrandTemplates,
  } = useCampaignContext();
  const [brandTemplates, setBrandTemplates] = useState<BrandTemplate[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [progress, setProgress] = useState<number>();
  const [loadingModalIsOpen, setLoadingModalIsOpen] = useState(false);
  const [publishDialogIsOpen, setPublishDialogIsOpen] = useState(false);
  const [isFirstGenerated, setIsFirstGenerated] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        // 默认只显示支持自动填充的模板（有 dataset 的模板）
        const items = await services.autofill.listBrandTemplates({
          query: searchQuery || undefined,
          datasetFilter: "non_empty",
        });
        setBrandTemplates(items);
      } catch {
        addAlert({
          title: "获取品牌模板失败",
          variant: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };
    
    // 防抖搜索
    const timeoutId = setTimeout(() => {
      fetchData();
    }, searchQuery ? 300 : 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    setSelectedBrandTemplates([]);
  }, []);

  const onCreate = async () => {
    const numberOfTemplates = selectedBrandTemplates.length;
    const baseEstimatedTime = 8000; // base time regardless of number of templates
    const additionalTimePerTemplate = 2000; // additional time per template
    const estimatedTotalTime =
      baseEstimatedTime + additionalTimePerTemplate * numberOfTemplates;

    setLoadingModalIsOpen(true);
    setProgress(0);

    const startTime = Date.now();
    let completedTasks = 0;

    // 创建一个进度更新函数，基于实际完成的任务数
    const updateProgress = (completed: number) => {
      completedTasks = completed;
      // 结合实际完成数和估算时间来计算进度
      const actualProgress = (completed / numberOfTemplates) * 90; // 90% 基于实际完成
      const timeProgress = Math.min(
        ((Date.now() - startTime) / estimatedTotalTime) * 10,
        10
      ); // 10% 基于时间
      setProgress(Math.min(100, actualProgress + timeProgress));
    };

    // 定期更新进度（基于时间）
    const intervalId = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const timeProgress = Math.min((elapsedTime / estimatedTotalTime) * 100, 95);
      const actualProgress = (completedTasks / numberOfTemplates) * 90;
      setProgress(Math.min(100, actualProgress + Math.min(timeProgress * 0.1, 5)));
    }, 200);

    try {
      // 修改 autofillSelectedBrandTemplates 以支持进度回调
      await autofillSelectedBrandTemplatesWithProgress(updateProgress);
    } catch (error) {
      console.error(error);
      addAlert({
        title: "批量创建设计时出错",
        variant: "error",
      });
    } finally {
      clearInterval(intervalId);
      setProgress(100); // 确保进度条到达 100%
      // 短暂延迟后关闭对话框，让用户看到完成状态
      setTimeout(() => {
        setLoadingModalIsOpen(false);
        setProgress(undefined);
      }, 500);
    }
  };

  const autofillSelectedBrandTemplatesWithProgress = async (
    onProgress?: (completed: number) => void
  ) => {
    try {
      if (!selectedCampaignProduct) {
        addAlert({ title: "未选择商品", variant: "error" });
        return;
      }

      const selectedTemplate = selectedBrandTemplates[0];
      if (!selectedTemplate) {
        addAlert({
          title: "未选择品牌模板",
          variant: "error",
        });
        return;
      }

      if (fieldMappings.length === 0) {
        addAlert({
          title: "请配置字段映射",
          variant: "error",
        });
        return;
      }

      // 使用自定义字段映射
      const result = await services.autofill.autoFillTemplateWithMappings({
        brandTemplateId: selectedTemplate.id,
        fieldMappings,
      });

      // 处理结果
      const processedDesigns: typeof marketingMultiDesignResults = [];
      let completedCount = 0;

      try {
        if (result.job.result?.design.id) {
          const response = await services.designs.getDesign(
            result.job.result.design.id,
          );
          const designWithThumb = {
            ...response.design,
            thumbnail:
              response.design.thumbnail ??
              result.job.result?.design.thumbnail,
          };
          processedDesigns.push(designWithThumb);
          saveDesignToContentLibrary(designWithThumb);
        }
        completedCount = 1;
        onProgress?.(completedCount);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        addAlert({
          title: `获取设计详情失败: ${errorMsg}`,
          variant: "error",
        });
        completedCount = 1;
        onProgress?.(completedCount);
      }


      // 批量更新状态
      if (processedDesigns.length > 0) {
        setMarketingMultiDesignResults((currentDesigns) => [
          ...currentDesigns,
          ...processedDesigns,
        ]);
      }

      setIsFirstGenerated(true);

      // 显示成功/失败消息
      if (processedDesigns.length === 0) {
        addAlert({
          title: "设计创建失败，请检查错误信息",
          variant: "error",
          hideAfterMs: -1,
        });
      } else {
        addAlert({
          title: "Canva 设计已生成",
          variant: "success",
          hideAfterMs: -1,
        });
      }
    } catch (error) {
      console.error("Unexpected error in autofill:", error);
      addAlert({
        title: `意外错误: ${error instanceof Error ? error.message : String(error)}`,
        variant: "error",
      });
    }
  };

  if (!isFetching && !brandTemplates?.length) {
    return (
      <Typography variant="h4" gutterBottom={true}>
        Looks like you don't have any brand templates!
      </Typography>
    );
  }

  return (
    <Grid container={true} spacing={3} marginBottom={4}>
      <PageDescriptor
        title="自动填充"
        description="选择支持自动填充的品牌模板，将商品信息填充到模板中，批量生成设计"
      />
      <Grid item={true} xs={8}>
        {marketingMultiDesignResults.length ? (
          <Stack spacing={4}>
            <AutofillResults
              designResults={marketingMultiDesignResults}
              firstGenerated={isFirstGenerated}
            />
            <PublishCampaignButtons
              onCancel={() => setMarketingMultiDesignResults([])}
              onPublish={() => {
                if (campaignName) {
                  setPublishDialogIsOpen(true);
                }
              }}
              publishDisabled={!campaignName}
            />
          </Stack>
        ) : (
          <MultipleDesignsCampaignForm
            isLoading={loadingModalIsOpen}
            brandTemplates={brandTemplates}
            isFetching={isFetching}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            fieldMappings={fieldMappings}
            onFieldMappingsChange={setFieldMappings}
            onCreate={onCreate}
          />
        )}
      </Grid>
      <GeneratingDesignsDialog
        isOpen={loadingModalIsOpen}
        progress={progress}
      />
      <PublishDialog
        isOpen={publishDialogIsOpen}
        onOpenChange={setPublishDialogIsOpen}
      />
    </Grid>
  );
};
