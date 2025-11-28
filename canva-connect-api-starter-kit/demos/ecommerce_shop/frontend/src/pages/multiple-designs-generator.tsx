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
  const [progress, setProgress] = useState<number>();
  const [loadingModalIsOpen, setLoadingModalIsOpen] = useState(false);
  const [publishDialogIsOpen, setPublishDialogIsOpen] = useState(false);
  const [isFirstGenerated, setIsFirstGenerated] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const items = await services.autofill.listBrandTemplates();
        setBrandTemplates(items);
      } catch {
        addAlert({
          title: "Something went wrong fetching your brand templates.",
          variant: "error",
        });
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
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

      if (!selectedBrandTemplates.length) {
        addAlert({
          title: "未选择品牌模板",
          variant: "error",
        });
        return;
      }

      const autoFillPromises = selectedBrandTemplates.map((brandTemplate) =>
        services.autofill.autoFillTemplateWithProduct({
          brandTemplateId: brandTemplate.id,
          product: selectedCampaignProduct,
          discount: selectedDiscount,
        }),
      );

      const results = await Promise.allSettled(autoFillPromises);

      // 处理所有结果，等待所有异步操作完成
      const processedDesigns: typeof marketingMultiDesignResults = [];
      const errors: string[] = [];
      let completedCount = 0;

      await Promise.all(
        results.map(async (result, index) => {
          const template = selectedBrandTemplates[index];
          const templateName = template?.title || template?.id || `模板 ${index + 1}`;
          
          if (result.status === "rejected") {
            const errorMsg = result.reason instanceof Error 
              ? result.reason.message 
              : String(result.reason);
            const fullErrorMsg = `"${templateName}" 创建失败: ${errorMsg}`;
            errors.push(fullErrorMsg);
            addAlert({
              title: fullErrorMsg,
              variant: "error",
            });
            completedCount++;
            onProgress?.(completedCount);
          } else if (result.status === "fulfilled") {
            try {
              if (result.value.job.result?.design.id) {
                const response = await services.designs.getDesign(
                  result.value.job.result.design.id,
                );
                const designWithThumb = {
                  ...response.design,
                  /**
                   * A design created from an autoFill request doesn't have a design.thumbnail,
                   * whereas the auto-fill job result does.  Falling back to the job result
                   * thumbnail where design thumbnail is undefined
                   */
                  thumbnail:
                    response.design.thumbnail ??
                    result.value.job.result?.design.thumbnail,
                };
                processedDesigns.push(designWithThumb);
                
                // 保存到内容库
                saveDesignToContentLibrary(designWithThumb);
              }
              completedCount++;
              onProgress?.(completedCount);
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              errors.push(`获取设计详情失败: ${errorMsg}`);
              console.error("Error getting design:", error);
              completedCount++;
              onProgress?.(completedCount);
            }
          }
        })
      );

      // 批量更新状态
      if (processedDesigns.length > 0) {
        setMarketingMultiDesignResults((currentDesigns) => [
          ...currentDesigns,
          ...processedDesigns,
        ]);
      }

      setIsFirstGenerated(true);

      // 显示成功/失败消息
      const successCount = processedDesigns.length;
      const totalCount = selectedBrandTemplates.length;
      
      if (successCount === 0) {
        addAlert({
          title: "所有设计创建失败，请检查错误信息",
          variant: "error",
          hideAfterMs: -1,
        });
      } else if (successCount === totalCount) {
        addAlert({
          title:
            successCount === 1
              ? "1 个 Canva 设计已生成"
              : `${successCount} 个 Canva 设计已生成`,
          variant: "success",
          hideAfterMs: -1,
        });
      } else {
        addAlert({
          title: `成功生成 ${successCount}/${totalCount} 个设计，${totalCount - successCount} 个失败`,
          variant: "warning",
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
        title="批量设计"
        description="将商品添加到品牌模板，一次性创建多个设计"
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
