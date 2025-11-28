import { useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import { Stack, Typography, TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {
  BrandTemplateSelectionModal,
  BrandTemplatesStack,
  CampaignNameInput,
  CanvaIcon,
  DemoButton,
  DiscountSelector,
  FormPaper,
  SingleProductSelector,
} from "src/components";
import { useAppContext, useCampaignContext } from "src/context";

export const MultipleDesignsCampaignForm = ({
  isLoading,
  brandTemplates,
  isFetching,
  searchQuery,
  onSearchChange,
  onCreate,
}: {
  isLoading: boolean;
  brandTemplates: BrandTemplate[];
  isFetching?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onCreate: () => void;
}) => {
  const { selectedCampaignProduct } = useAppContext();
  const { campaignName, selectedBrandTemplates } = useCampaignContext();
  const [isOpen, setIsOpen] = useState(false);

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
          这些模板将用于创建包含商品信息的 Canva 设计。默认仅显示支持自动填充的模板。
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
        {selectedBrandTemplates.length ? (
          <Stack spacing={2}>
            <BrandTemplatesStack />
            <DemoButton
              demoVariant="secondary"
              startIcon={<CanvaIcon />}
              onClick={() => setIsOpen(true)}
              disabled={!selectedCampaignProduct || isLoading || isFetching}
              fullWidth={true}
            >
              编辑选择
            </DemoButton>
            <DemoButton
              demoVariant="primary"
              onClick={onCreate}
              disabled={!selectedCampaignProduct || !campaignName}
              loading={isLoading}
              startIcon={<CanvaIcon />}
              fullWidth={true}
            >
              生成 Canva 设计
            </DemoButton>
          </Stack>
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
      <BrandTemplateSelectionModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        brandTemplates={brandTemplates}
      />
    </Stack>
  );
};
