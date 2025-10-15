import { Box, Typography, Stack, Card, CardContent, Divider } from "@mui/material";
import { PageDescriptor } from "src/components";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card variant="outlined">
    <CardContent>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Box>{children}</Box>
    </CardContent>
  </Card>
);

const ApiOverviewPage = (): JSX.Element => {
  return (
    <Box padding={4}>
      <PageDescriptor
        title="API 概览"
        description="按功能模块梳理 Canva Connect API，在 Demo 中的落地与典型业务流程。"
      />
      <Stack spacing={3}>
        <Section title="总览与关键概念">
          <Typography variant="body1" paragraph>
            常见端到端流程：上传资产 → 新建设计 → 打开编辑 → 回跳 →（可选）导出。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            授权成功后以 Bearer Token 调用；编辑链接应携带 correlation_state 与 return_nav_url 以完成回跳。
          </Typography>
        </Section>

        <Section title="认证 / Auth">
          <Typography variant="body2">能力：OAuth 授权、刷新/撤销 Token。Demo：在首页“连接 Canva”。</Typography>
        </Section>

        <Section title="资产 / Assets（素材上传）">
          <Typography variant="body2" paragraph>
            能力：创建上传任务、轮询上传结果、读取资产（含缩略图）。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            典型流：createAssetUploadJob → getAssetUploadJob（轮询）→ asset.id/thumbnail。
          </Typography>
        </Section>

        <Section title="设计 / Designs（单个设计·内容库）">
          <Typography variant="body2" paragraph>
            能力：新建设计（预设/自定义尺寸/基于素材）、获取设计与编辑链接。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            典型流：createDesign → 打开 edit_url（带 correlation_state/return_nav_url）→ 回跳处理。
          </Typography>
        </Section>

        <Section title="导出 / Exports">
          <Typography variant="body2">能力：创建导出任务、轮询完成、下载 PNG/PDF 等。</Typography>
        </Section>

        <Section title="品牌模板 / Brand Templates（批量设计）">
          <Typography variant="body2" paragraph>
            能力：列表/读取模板；从模板打开编辑（create_url）；或通过 API 创建设计（保留回跳）。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            场景：批量营销；可与自动填充结合。
          </Typography>
        </Section>

        <Section title="自动填充 / Autofill（批量生成）">
          <Typography variant="body2">将商品/数据映射到模板占位符，一次生成多份设计。</Typography>
        </Section>

        <Section title="返回导航 / Return Navigation">
          <Typography variant="body2" paragraph>
            关键参数：correlation_state（含来源上下文）、design_id。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Demo 步骤：解析参数 → 获取设计 →（可选）导出 → 返回来源。
          </Typography>
        </Section>

        <Section title="Scope（示例）">
          <Typography variant="body2">资产：asset:read / asset:write；设计：design:read / design:write；模板：brandtemplate:meta:read / brandtemplate:content:read；导出：export:write；用户：profile:read。</Typography>
        </Section>
      </Stack>
    </Box>
  );
};

export default ApiOverviewPage;


