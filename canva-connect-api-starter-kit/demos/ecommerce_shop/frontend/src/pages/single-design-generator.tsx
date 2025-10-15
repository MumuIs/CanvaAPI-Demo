import confetti from "canvas-confetti";
import { useEffect, useState } from "react";
import type { Design } from "@canva/connect-api-ts/types.gen";
import { Grid, Stack, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField } from "@mui/material";
import type { DesignTypeInput } from "@canva/connect-api-ts/types.gen";
import {
  CampaignNameInput,
  CanvaIcon,
  DemoButton,
  FormPaper,
  PageDescriptor,
  PublishCampaignButtons,
  PublishDialog,
  SingleProductSelector,
} from "src/components";
import { useAppContext, useCampaignContext } from "src/context";
import { DesignResult } from "src/components/marketing/design-result";
import { EditInCanvaPageOrigins } from "src/models";

export const SingleDesignGeneratorPage = () => {
  const { campaignName } = useCampaignContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstGenerated, setIsFirstGenerated] = useState(false);
  const [preset, setPreset] = useState<"presentation" | "doc" | "whiteboard" | "custom">("presentation");
  const [customWidth, setCustomWidth] = useState<number>(1080);
  const [customHeight, setCustomHeight] = useState<number>(1080);

  const {
    addAlert,
    createdSingleDesign,
    setCreatedSingleDesign,
    selectedCampaignProduct,
    services,
  } = useAppContext();

  const onCreate = async () => {
    if (!selectedCampaignProduct) {
      return;
    }
    setIsLoading(true);
    try {
      let designType: DesignTypeInput | undefined;
      if (preset === "custom") {
        designType = { type: "custom", width: customWidth, height: customHeight };
      } else {
        designType = { type: "preset", name: preset } as DesignTypeInput;
      }
      const design = selectedCampaignProduct.id === 0
        ? await services.designs.createBlankDesign({ title: campaignName, designType })
        : await services.designs.uploadAssetAndCreateDesignFromProduct({
            campaignName,
            product: selectedCampaignProduct,
            designType,
          });
      setCreatedSingleDesign(design.design);
      setIsFirstGenerated(true);
      addAlert({
        title: `Canva design was successfully generated for '${selectedCampaignProduct.name}'.`,
        variant: "success",
        hideAfterMs: -1,
      });
    } catch {
      addAlert({
        title: "Something went wrong. Please try again later.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container={true} spacing={3}>
      <PageDescriptor
        title="单个设计"
        description="从现有商品按指定尺寸创建一个设计，或选择空白画布自定义创建"
      />
      <Grid item={true} xs={8}>
        {createdSingleDesign && selectedCampaignProduct ? (
          <SingleDesignResult
            createdDesign={createdSingleDesign}
            setCreatedDesign={setCreatedSingleDesign}
            firstGenerated={isFirstGenerated}
          />
        ) : (
          <SingleCampaignForm
            isLoading={isLoading}
            onCreate={onCreate}
            preset={preset}
            setPreset={(v) => setPreset(v)}
            customWidth={customWidth}
            setCustomWidth={setCustomWidth}
            customHeight={customHeight}
            setCustomHeight={setCustomHeight}
          />
        )}
      </Grid>
    </Grid>
  );
};

const SingleCampaignForm = ({
  isLoading,
  onCreate,
  preset,
  setPreset,
  customWidth,
  setCustomWidth,
  customHeight,
  setCustomHeight,
}: {
  isLoading: boolean;
  onCreate: () => void;
  preset: "presentation" | "doc" | "whiteboard" | "custom";
  setPreset: (v: "presentation" | "doc" | "whiteboard" | "custom") => void;
  customWidth: number;
  setCustomWidth: (v: number) => void;
  customHeight: number;
  setCustomHeight: (v: number) => void;
}) => {
  const { campaignName } = useCampaignContext();
  const { selectedCampaignProduct } = useAppContext();

  return (
    <Stack spacing={4}>
      <CampaignNameInput disabled={isLoading} />
      <FormPaper>
        <FormControl>
          <FormLabel>设计类型</FormLabel>
          <RadioGroup
            row
            value={preset}
            onChange={(e) => setPreset(e.target.value as any)}
          >
            <FormControlLabel value="presentation" control={<Radio />} label="演示文稿" />
            <FormControlLabel value="doc" control={<Radio />} label="文档" />
            <FormControlLabel value="whiteboard" control={<Radio />} label="白板" />
            <FormControlLabel value="custom" control={<Radio />} label="自定义" />
          </RadioGroup>
        </FormControl>
        {preset === "custom" && (
          <Stack direction="row" spacing={2} mt={2}>
            <TextField
              label="宽(px)"
              type="number"
              size="small"
              value={customWidth}
              onChange={(e) => setCustomWidth(Number(e.target.value))}
              inputProps={{ min: 100, step: 10 }}
            />
            <TextField
              label="高(px)"
              type="number"
              size="small"
              value={customHeight}
              onChange={(e) => setCustomHeight(Number(e.target.value))}
              inputProps={{ min: 100, step: 10 }}
            />
          </Stack>
        )}
      </FormPaper>
      <FormPaper>
        <Stack spacing={4} marginBottom={4}>
          <Typography variant="h5" marginBottom={4}>
            Select product details
          </Typography>
          <SingleProductSelector disabled={isLoading} />
        </Stack>

        <DemoButton
          demoVariant="primary"
          loading={isLoading}
          onClick={onCreate}
          disabled={!selectedCampaignProduct}
          fullWidth={true}
          startIcon={<CanvaIcon />}
        >
          CREATE DESIGN IN CANVA
        </DemoButton>
      </FormPaper>
    </Stack>
  );
};

const SingleDesignResult = ({
  createdDesign,
  setCreatedDesign,
  firstGenerated = false,
}: {
  createdDesign: Design;
  setCreatedDesign: (design: Design | undefined) => void;
  firstGenerated?: boolean;
}) => {
  const { selectedCampaignProduct } = useAppContext();
  const { campaignName } = useCampaignContext();
  const [publishDialogIsOpen, setPublishDialogIsOpen] = useState(false);
  useEffect(() => {
    // Only trigger confetti animation when the designs are first generated
    // otherwise not when returning from 'Edit in Canva'.
    if (!firstGenerated) {
      return;
    }
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { x: 0.55, y: 0.5 },
    });
  }, [firstGenerated]);

  return (
    <Stack spacing={4}>
      <FormPaper>
        <Typography variant="h6" gutterBottom={true}>
          {createdDesign.title}
        </Typography>
        <Stack spacing={2}>
          <DesignResult
            design={createdDesign}
            correlationStateOnNavigateToCanva={{
              originPage: EditInCanvaPageOrigins.MARKETING_SINGLE,
              originProductId: selectedCampaignProduct?.id,
            }}
          />
        </Stack>
      </FormPaper>
      <PublishCampaignButtons
        onCancel={() => setCreatedDesign(undefined)}
        onPublish={() => {
          if (campaignName) {
            setPublishDialogIsOpen(true);
          }
        }}
        publishDisabled={!campaignName}
      />
      <PublishDialog
        isOpen={publishDialogIsOpen}
        onOpenChange={setPublishDialogIsOpen}
      />
    </Stack>
  );
};
