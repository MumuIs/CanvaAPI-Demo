import { useEffect, useState } from "react";
import type { BrandTemplate } from "@canva/connect-api-ts/types.gen";
import { Box, Card, CardContent, CardMedia, CircularProgress, Grid, Stack, Typography, Alert, Button } from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";
import type { CorrelationState } from "src/models";

export const BrandTemplateCreatorPage = (): JSX.Element => {
  const { services, addAlert, isAuthorized } = useAppContext();
  const [brandTemplates, setBrandTemplates] = useState<BrandTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Read-only browsing of Brand Templates

  useEffect(() => {
    if (isAuthorized) {
      loadBrandTemplates();
    }
  }, [isAuthorized]);

  const loadBrandTemplates = async () => {
    try {
      setIsLoading(true);
      const templates = await services.brandTemplates.listBrandTemplates();
      setBrandTemplates(templates);
    } catch (error) {
      console.error("加载 brand templates 失败:", error);
      addAlert({ title: "加载模板失败", variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed creation flows from this page per requirement – only browse & read

  if (!isAuthorized) {
    return (
      <Box padding={4}>
        <PageDescriptor title="Brand Template 创建器" description="请先连接 Canva 以使用此功能" />
        <Alert severity="info">请先点击右上角的“连接 Canva”按钮进行授权</Alert>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <PageDescriptor
        title="品牌模板"
        description="浏览并读取你组织的品牌模板：标题、缩略图、创建时间、ID 等信息。"
      />

      <Stack spacing={3}>

        {isLoading ? (
          <Box display="flex" justifyContent="center" padding={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {brandTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={template.thumbnail?.url || "https://placehold.co/400x200/000000/FFF?text=No+Image"}
                    alt={template.title}
                    sx={{ objectFit: "contain" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {template.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ID: {template.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      创建时间: {new Date(template.created_at * 1000).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <Box padding={2} pt={0} display="flex" gap={1}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={async () => {
                        try {
                          await services.brandTemplates.openTemplateCreateUrl(template.id);
                        } catch (e) {
                          console.error(e);
                          addAlert({ title: "打开模板失败", variant: "error" });
                        }
                      }}
                    >
                      用此模板创建
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {brandTemplates.length === 0 && !isLoading && (
          <Alert severity="info">没有找到任何 brand templates。请确保你的 Canva 账户中有可用的品牌模板。</Alert>
        )}
      </Stack>
      {/* 不提供 create_url 或 API 创建路径的界面入口 */}
    </Box>
  );
};

export default BrandTemplateCreatorPage;

