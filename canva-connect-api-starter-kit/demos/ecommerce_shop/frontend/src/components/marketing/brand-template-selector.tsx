import { useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import {
  Box,
  CardMedia,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { DemoButton, DeveloperNote } from "src/components";
import { useCampaignContext } from "src/context";

export const BrandTemplateSelector = ({
  onClose,
  brandTemplates,
  singleSelect = false,
}: {
  onClose: () => void;
  brandTemplates: BrandTemplate[];
  singleSelect?: boolean;
}) => {
  const { selectedBrandTemplates, setSelectedBrandTemplates } =
    useCampaignContext();
  const [brandTemplateSet, setBrandTemplateSet] = useState<Set<BrandTemplate>>(
    new Set(selectedBrandTemplates),
  );
  const [selectedSingleTemplate, setSelectedSingleTemplate] = useState<BrandTemplate | null>(
    singleSelect ? (selectedBrandTemplates[0] || null) : null
  );

  const handleSelectBrandTemplate = (brandTemplate: BrandTemplate) => {
    if (singleSelect) {
      // 单选模式：如果点击已选中的模板，则取消选择；否则选择新模板
      if (selectedSingleTemplate?.id === brandTemplate.id) {
        setSelectedSingleTemplate(null);
      } else {
        setSelectedSingleTemplate(brandTemplate);
      }
    } else {
      // 多选模式
      setBrandTemplateSet((prevSelected) => {
        const currentlySelected = new Set(prevSelected);
        if (currentlySelected.has(brandTemplate)) {
          currentlySelected.delete(brandTemplate);
        } else {
          currentlySelected.add(brandTemplate);
        }
        return currentlySelected;
      });
    }
  };

  const handleUseTemplates = () => {
    if (singleSelect) {
      setSelectedBrandTemplates(selectedSingleTemplate ? [selectedSingleTemplate] : []);
    } else {
      setSelectedBrandTemplates(Array.from(brandTemplateSet));
    }
    onClose();
  };

  return (
    <Box
      margin={2}
      paddingY={2}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      <Grid container={true} spacing={3} overflow="auto">
        <Grid item={true} xs={12}>
          <Grid container={true} spacing={2}>
            <Grid item={true} xs={12} sm={7} md={9}>
              <Typography variant="h5">Select Brand Template</Typography>
            </Grid>
            <Grid item={true} xs={12} sm={5} md={3}>
              <DeveloperNote info="提示：品牌模板功能仅对 Canva 企业版用户开放。" />
            </Grid>
          </Grid>
        </Grid>
        <Grid item={true} xs={12}>
          <Paper
            variant="outlined"
            sx={{ padding: 2, bgcolor: "background.default" }}
          >
            <Typography variant="body2" color="text.secondary">
              Need sample Brand Templates? Install them from{" "}
              <Link
                href="https://www.canva.com/design/DAGGkcb61HQ/OJhMIQrmz2daIoxo8u3T2g/view"
                target="_blank"
                rel="noopener noreferrer"
              >
                this Brand Template deck
              </Link>
              .
            </Typography>
          </Paper>
        </Grid>
        {!brandTemplates.length ? (
          <EmptyState onClose={onClose} />
        ) : (
          brandTemplates.map((brandTemplate) => (
            <BrandTemplateCard
              key={brandTemplate.id}
              brandTemplate={brandTemplate}
              brandTemplateSet={brandTemplateSet}
              selectedSingleTemplate={selectedSingleTemplate}
              singleSelect={singleSelect}
              handleSelectBrandTemplate={handleSelectBrandTemplate}
            />
          ))
        )}
      </Grid>
      {brandTemplates.length > 0 && (
        <Box
          position="sticky"
          bottom={0}
          padding={2}
          bgcolor="background.paper"
          zIndex={1}
        >
          <Stack direction="row" spacing={2}>
            <DemoButton
              demoVariant="destructive"
              fullWidth={true}
              onClick={onClose}
            >
              CANCEL
            </DemoButton>
            <DemoButton
              demoVariant="primary"
              fullWidth={true}
              onClick={handleUseTemplates}
              disabled={singleSelect ? !selectedSingleTemplate : brandTemplateSet.size === 0}
            >
              {singleSelect 
                ? "使用模板"
                : `USE TEMPLATE` + (brandTemplateSet.size > 1 ? "S" : "")}
            </DemoButton>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

const EmptyState = ({ onClose }: { onClose: () => void }) => (
  <Grid item={true} xs={12}>
    <Box
      padding={8}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      gap={3}
    >
      <Stack spacing={2}>
        <Typography variant="h6">Don’t see any Brand Templates?</Typography>
        <Typography variant="body1">
          Check the help section above for instructions on installing sample
          templates.
        </Typography>
        <Box>
          <DemoButton
            demoVariant="destructive"
            onClick={onClose}
            sx={{ marginTop: 2 }}
          >
            CANCEL
          </DemoButton>
        </Box>
      </Stack>
    </Box>
  </Grid>
);

const BrandTemplateCard = ({
  brandTemplate,
  brandTemplateSet,
  selectedSingleTemplate,
  singleSelect,
  handleSelectBrandTemplate,
}: {
  brandTemplate: BrandTemplate;
  brandTemplateSet: Set<BrandTemplate>;
  selectedSingleTemplate: BrandTemplate | null;
  singleSelect: boolean;
  handleSelectBrandTemplate: (brandTemplate: BrandTemplate) => void;
}) => {
  const isSelected = singleSelect 
    ? selectedSingleTemplate?.id === brandTemplate.id
    : brandTemplateSet.has(brandTemplate);
  
  return (
    <Grid item={true} xs={12} sm={6} md={4} lg={4}>
      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          borderRadius: 1,
          paddingX: 2,
          paddingTop: 6,
          bgcolor: "black",
          border: (theme) =>
            isSelected
              ? `2px solid ${theme.palette.success.main}`
              : "2px solid transparent",
          "&:hover": {
            opacity: 0.8,
            cursor: "pointer",
          },
        }}
        onClick={() => handleSelectBrandTemplate(brandTemplate)}
      >
        <Stack spacing={2}>
          <CardMedia
            component="img"
            image={
              brandTemplate.thumbnail?.url ||
              "https://placehold.co/200x200/000000/FFF"
            }
            alt={`${brandTemplate.title}-image`}
            height="200"
            sx={{ objectFit: "contain", bgColor: "black" }}
          />
          <Typography variant="h6">{brandTemplate.title}</Typography>
        </Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              sx={{ position: "absolute", top: 8, left: 8 }}
            />
          }
          label=""
        />
      </Paper>
    </Grid>
  );
};
