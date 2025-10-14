import { useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert, Stack, Divider } from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";
import { EditInCanvaPageOrigins } from "src/models";

const BrandTemplateTestPage = (): JSX.Element => {
  const { services, isAuthorized } = useAppContext();
  const [testResults, setTestResults] = useState<string[]>([]);

  const add = (msg: string) => setTestResults((p) => [...p, `${new Date().toLocaleTimeString()}: ${msg}`]);

  const run = async () => {
    try {
      add("开始测试 Brand Template 流程...");
      add("1. 获取品牌模板列表...");
      const templates = await services.brandTemplates.listBrandTemplates();
      add(`✓ 成功获取 ${templates.length} 个模板`);
      if (!templates.length) return;

      const first = templates[0];
      add(`2. 获取模板详情: ${first.title}`);
      const detail = await services.brandTemplates.getBrandTemplate(first.id);
      add(`✓ 模板详情: ID=${detail.id}, Create URL=${detail.create_url}`);

      add("3. 构建 Return Navigation URL...");
      const correlationState = {
        originPage: EditInCanvaPageOrigins.BRAND_TEMPLATE_CREATOR,
        timestamp: Date.now(),
        selectedTemplates: [first.id],
      };
      const url = new URL(detail.create_url);
      const returnNavUrl = `${process.env.BACKEND_URL || "http://127.0.0.1:3001"}/return-nav`;
      url.searchParams.append("return_nav_url", returnNavUrl);
      url.searchParams.append("correlation_state", btoa(JSON.stringify(correlationState)));
      add("✓ Return Navigation URL 构建完成");
      add(`  - Return Nav URL: ${returnNavUrl}`);
      add(`  - 完整 URL: ${url.toString()}`);

      add("4. 测试设计副本创建流程...");
      add("✓ URL 构建成功，可以打开 Canva 编辑器");
      add("🎉 测试完成！");
    } catch (e) {
      add(`❌ 测试失败: ${e}`);
      console.error(e);
    }
  };

  const clear = () => setTestResults([]);

  if (!isAuthorized) {
    return (
      <Box padding={4}>
        <PageDescriptor title="Brand Template 流程测试" description="请先连接 Canva 以进行测试" />
        <Alert severity="info">请先点击右上角的“连接 Canva”按钮进行授权</Alert>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <PageDescriptor title="Brand Template 流程测试" description="测试 Brand Template API 的完整流程和 Return Navigation" />
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>测试说明</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              该页验证 Brand Template API 的主要步骤，不实际打开 Canva，仅验证 URL 构建。
            </Typography>
          </CardContent>
        </Card>
        <Box display="flex" gap={2}>
          <Button variant="contained" onClick={run}>开始测试</Button>
          <Button variant="outlined" onClick={clear} disabled={!testResults.length}>清除结果</Button>
        </Box>
        {testResults.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>测试结果</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ maxHeight: 400, overflow: "auto", backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
                {testResults.map((r, i) => (
                  <Typography key={i} variant="body2" component="div" sx={{ fontFamily: "monospace", mb: 0.5 }}>
                    {r}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default BrandTemplateTestPage;

