import { useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import { Stack, Typography, TextField, InputAdornment, Box, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  BrandTemplateSelectionModal,
  CampaignNameInput,
  CanvaIcon,
  DemoButton,
  DiscountSelector,
  FormPaper,
  SingleProductSelector,
  FieldMappingForm,
} from "src/components";
import { useAppContext, useCampaignContext } from "src/context";
import type { FieldMapping } from "src/services/autofill";

export const MultipleDesignsCampaignForm = ({
  isLoading,
  brandTemplates,
  isFetching,
  searchQuery,
  onSearchChange,
  fieldMappings,
  onFieldMappingsChange,
  onCreate,
}: {
  isLoading: boolean;
  brandTemplates: BrandTemplate[];
  isFetching?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  fieldMappings: FieldMapping[];
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  onCreate: () => void;
}) => {
  const { selectedCampaignProduct } = useAppContext();
  const { campaignName, selectedBrandTemplates, selectedDiscount, setSelectedBrandTemplates } = useCampaignContext();
  const [isOpen, setIsOpen] = useState(false);
  
  // 单选模板，只取第一个
  const selectedTemplate = selectedBrandTemplates[0] || null;

  return (
    <Stack spacing={4}>
      <CampaignNameInput disabled={isLoading} />
      <FormPaper>
        <Stack spacing={4} marginBottom={4}>
          <Typography variant="h5" marginBottom={4}>
            选择商品信息
          </Typography>
          <SingleProductSelector disabled={isLoading} />
          <DiscountSelector disabled={isLoading} />
        </Stack>
      </FormPaper>
      <FormPaper>
        <Typography variant="h5">选择品牌模板</Typography>
        <Typography variant="body2" marginBottom={2}>
          选择一个支持自动填充的模板。选择后，您可以为每个字段配置数据源。
        </Typography>
        {onSearchChange && (
          <TextField
            fullWidth
            placeholder="搜索模板..."
            value={searchQuery || ""}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={isLoading || isFetching}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ marginBottom: 2 }}
          />
        )}
        {selectedTemplate ? (
          <Box marginBottom={2}>
            <Chip
              label={selectedTemplate.title}
              onDelete={() => setSelectedBrandTemplates([])}
              color="primary"
              sx={{ marginBottom: 2 }}
            />
            <DemoButton
              demoVariant="secondary"
              startIcon={<CanvaIcon />}
              onClick={() => setIsOpen(true)}
              disabled={isLoading || isFetching}
              fullWidth={true}
            >
              更换模板
            </DemoButton>
          </Box>
        ) : (
          <DemoButton
            demoVariant="secondary"
            startIcon={<CanvaIcon />}
            onClick={() => setIsOpen(true)}
            disabled={!selectedCampaignProduct || isFetching}
            loading={isFetching}
            fullWidth={true}
          >
            选择模板
          </DemoButton>
        )}
      </FormPaper>
      
      {selectedTemplate && (
        <FieldMappingForm
          brandTemplate={selectedTemplate}
          fieldMappings={fieldMappings}
          onFieldMappingsChange={onFieldMappingsChange}
          discount={selectedDiscount}
        />
      )}
      
      {selectedTemplate && fieldMappings.length > 0 && (
        <FormPaper>
          <DemoButton
            demoVariant="primary"
            onClick={onCreate}
            disabled={!selectedCampaignProduct || !campaignName || fieldMappings.length === 0}
            loading={isLoading}
            startIcon={<CanvaIcon />}
            fullWidth={true}
          >
            生成 Canva 设计
          </DemoButton>
        </FormPaper>
      )}
      <BrandTemplateSelectionModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        brandTemplates={brandTemplates}
        singleSelect={true}
      />
    </Stack>
  );
};
