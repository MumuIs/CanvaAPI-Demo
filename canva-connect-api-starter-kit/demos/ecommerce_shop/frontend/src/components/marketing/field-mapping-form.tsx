import { useEffect, useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import {
  Box,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Alert,
  Divider,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { FormPaper } from "src/components";
import { useAppContext } from "src/context";
import type { FieldMapping } from "src/services/autofill";

type FieldMappingFormData = {
  templateFieldName: string;
  fieldType: "text" | "image" | "chart";
  source: "product" | "discount" | "custom";
  productField?: "name" | "price" | "image";
  customValue?: string;
};

export const FieldMappingForm = ({
  brandTemplate,
  fieldMappings,
  onFieldMappingsChange,
  discount,
}: {
  brandTemplate: BrandTemplate | null;
  fieldMappings: FieldMapping[];
  onFieldMappingsChange: (mappings: FieldMapping[]) => void;
  discount: string;
}) => {
  const { services, selectedCampaignProduct, addAlert } = useAppContext();
  const [templateFields, setTemplateFields] = useState<
    Array<{ fieldName: string; fieldType: string }>
  >([]);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [formData, setFormData] = useState<Record<string, FieldMappingFormData>>({});

  useEffect(() => {
    if (!brandTemplate) {
      setTemplateFields([]);
      setFormData({});
      onFieldMappingsChange([]);
      return;
    }

    const loadTemplateFields = async () => {
      try {
        setIsLoadingFields(true);
        const fields = await services.autofill.getBrandTemplateFields(brandTemplate.id);
        setTemplateFields(fields);

        // 初始化表单数据，尝试自动映射
        const initialFormData: Record<string, FieldMappingFormData> = {};
        fields.forEach((field) => {
          // 尝试自动匹配字段名
          let source: "product" | "discount" | "custom" = "custom";
          let productField: "name" | "price" | "image" | undefined = undefined;

          const fieldNameLower = field.fieldName.toLowerCase();
          if (fieldNameLower.includes("name") || fieldNameLower.includes("title")) {
            source = "product";
            productField = "name";
          } else if (fieldNameLower.includes("price") || fieldNameLower.includes("cost")) {
            source = "product";
            productField = "price";
          } else if (fieldNameLower.includes("image") || fieldNameLower.includes("photo") || fieldNameLower.includes("picture")) {
            source = "product";
            productField = "image";
          } else if (fieldNameLower.includes("discount") || fieldNameLower.includes("sale")) {
            source = "discount";
          }

          initialFormData[field.fieldName] = {
            templateFieldName: field.fieldName,
            fieldType: field.fieldType as "text" | "image" | "chart",
            source,
            productField,
            customValue: "",
          };
        });

        setFormData(initialFormData);
        // 延迟更新映射，确保 formData 已设置
        setTimeout(() => {
          updateFieldMappings(initialFormData);
        }, 0);
      } catch (error) {
        console.error("Error loading template fields:", error);
        addAlert({
          title: "获取模板字段失败",
          variant: "error",
        });
      } finally {
        setIsLoadingFields(false);
      }
    };

    loadTemplateFields();
  }, [brandTemplate]);

  const updateFieldMappings = async (data: Record<string, FieldMappingFormData>) => {
    const mappings: FieldMapping[] = [];

    for (const [fieldName, fieldData] of Object.entries(data)) {
      let value: string | { asset_id: string } | undefined = undefined;

      if (fieldData.source === "product" && selectedCampaignProduct) {
        if (fieldData.productField === "name") {
          value = selectedCampaignProduct.name;
        } else if (fieldData.productField === "price") {
          value = `$${selectedCampaignProduct.price.toFixed(2)}`;
        } else if (fieldData.productField === "image") {
          // 图片需要先上传资产
          try {
            const asset = await services.assets.uploadAsset({
              name: selectedCampaignProduct.name,
              imageUrl: selectedCampaignProduct.imageUrl,
            });
            value = { asset_id: asset.id };
          } catch (error) {
            console.error("Error uploading asset:", error);
            addAlert({
              title: `上传图片失败: ${fieldName}`,
              variant: "error",
            });
            continue;
          }
        }
      } else if (fieldData.source === "discount") {
        value = `Save ${discount}`;
      } else if (fieldData.source === "custom") {
        value = fieldData.customValue || "";
      }

      if (value !== undefined) {
        mappings.push({
          templateFieldName: fieldName,
          fieldType: fieldData.fieldType,
          value,
          source: fieldData.source,
          productField: fieldData.productField,
        });
      }
    }

    onFieldMappingsChange(mappings);
  };

  const handleSourceChange = (fieldName: string, source: "product" | "discount" | "custom") => {
    const newFormData = {
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        source,
        productField: source === "product" ? formData[fieldName].productField : undefined,
        customValue: source === "custom" ? formData[fieldName].customValue : "",
      },
    };
    setFormData(newFormData);
    updateFieldMappings(newFormData);
  };

  const handleProductFieldChange = (fieldName: string, productField: "name" | "price" | "image") => {
    const newFormData = {
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        productField,
      },
    };
    setFormData(newFormData);
    updateFieldMappings(newFormData);
  };

  const handleCustomValueChange = (fieldName: string, value: string) => {
    const newFormData = {
      ...formData,
      [fieldName]: {
        ...formData[fieldName],
        customValue: value,
      },
    };
    setFormData(newFormData);
    updateFieldMappings(newFormData);
  };

  if (!brandTemplate) {
    return (
      <FormPaper>
        <Typography variant="body2" color="text.secondary">
          请先选择一个品牌模板
        </Typography>
      </FormPaper>
    );
  }

  if (isLoadingFields) {
    return (
      <FormPaper>
        <Typography variant="body2">加载模板字段中...</Typography>
      </FormPaper>
    );
  }

  if (templateFields.length === 0) {
    return (
      <FormPaper>
        <Alert severity="warning">
          该模板没有可自动填充的字段。请选择其他模板。
        </Alert>
      </FormPaper>
    );
  }

  const textFields = templateFields.filter((f) => f.fieldType === "text");
  const imageFields = templateFields.filter((f) => f.fieldType === "image");
  const chartFields = templateFields.filter((f) => f.fieldType === "chart");

  return (
    <FormPaper>
      <Typography variant="h6" gutterBottom>
        字段映射配置
      </Typography>
      <Typography variant="body2" color="text.secondary" marginBottom={3}>
        为模板的每个字段选择数据源。模板：<strong>{brandTemplate.title}</strong>
      </Typography>

      {textFields.length > 0 && (
        <Box marginBottom={3}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            文本字段
          </Typography>
          <Stack spacing={2}>
            {textFields.map((field) => (
              <Box key={field.fieldName}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{field.fieldName}</InputLabel>
                  <Select
                    value={formData[field.fieldName]?.source || "custom"}
                    onChange={(e: SelectChangeEvent) =>
                      handleSourceChange(field.fieldName, e.target.value as "product" | "discount" | "custom")
                    }
                    label={field.fieldName}
                  >
                    <MenuItem value="product">使用商品信息</MenuItem>
                    <MenuItem value="discount">使用折扣信息</MenuItem>
                    <MenuItem value="custom">自定义文本</MenuItem>
                  </Select>
                </FormControl>

                {formData[field.fieldName]?.source === "product" && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>选择商品字段</InputLabel>
                    <Select
                      value={formData[field.fieldName]?.productField || "name"}
                      onChange={(e: SelectChangeEvent) =>
                        handleProductFieldChange(field.fieldName, e.target.value as "name" | "price" | "image")
                      }
                      label="选择商品字段"
                    >
                      <MenuItem value="name">商品名称</MenuItem>
                      <MenuItem value="price">商品价格</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {formData[field.fieldName]?.source === "custom" && (
                  <TextField
                    fullWidth
                    margin="normal"
                    label="自定义文本"
                    value={formData[field.fieldName]?.customValue || ""}
                    onChange={(e) => handleCustomValueChange(field.fieldName, e.target.value)}
                    placeholder="输入文本内容"
                  />
                )}

                {formData[field.fieldName]?.source === "discount" && (
                  <Box marginTop={1}>
                    <Chip label={`Save ${discount}`} color="primary" size="small" />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {imageFields.length > 0 && (
        <Box marginBottom={3}>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            图片字段
          </Typography>
          <Stack spacing={2}>
            {imageFields.map((field) => (
              <Box key={field.fieldName}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>{field.fieldName}</InputLabel>
                  <Select
                    value={formData[field.fieldName]?.source || "product"}
                    onChange={(e: SelectChangeEvent) =>
                      handleSourceChange(field.fieldName, e.target.value as "product" | "custom")
                    }
                    label={field.fieldName}
                  >
                    <MenuItem value="product">使用商品图片</MenuItem>
                    <MenuItem value="custom" disabled>
                      自定义图片（暂不支持）
                    </MenuItem>
                  </Select>
                </FormControl>
                {formData[field.fieldName]?.source === "product" && selectedCampaignProduct && (
                  <Box marginTop={1}>
                    <Chip
                      label={`将使用商品图片: ${selectedCampaignProduct.name}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {chartFields.length > 0 && (
        <Box marginBottom={3}>
          <Divider sx={{ marginY: 2 }} />
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            图表字段
          </Typography>
          <Alert severity="info">
            图表类型字段暂不支持自动填充。
          </Alert>
        </Box>
      )}

      {fieldMappings.length > 0 && (
        <Box marginTop={3}>
          <Alert severity="success">
            已配置 {fieldMappings.length} 个字段映射
          </Alert>
        </Box>
      )}
    </FormPaper>
  );
};

