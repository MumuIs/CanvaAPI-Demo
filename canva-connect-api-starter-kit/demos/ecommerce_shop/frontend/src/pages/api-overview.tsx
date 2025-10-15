import { Box, Typography, Stack, Card, CardContent, Divider, Grid, Chip } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AutoAwesomeMosaicOutlinedIcon from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { PageDescriptor } from "src/components";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>{title}</Typography>
      <Divider sx={{ mb: 1.5 }} />
      <Box>{children}</Box>
    </CardContent>
  </Card>
);

const ApiOverviewPage = (): JSX.Element => {
  const sections = [
    {
      id: "overview",
      title: "总览与关键概念",
      icon: <DesignServicesOutlinedIcon color="primary" />,
      body: (
        <>
          <Typography variant="body1" paragraph>
            常见端到端流程：上传资产 → 新建设计 → 打开编辑 → 回跳 →（可选）导出。
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label="Bearer Token" size="small" color="primary" variant="outlined" />
            <Chip label="correlation_state" size="small" color="secondary" variant="outlined" />
            <Chip label="return_nav_url" size="small" color="secondary" variant="outlined" />
          </Stack>
        </>
      ),
    },
    {
      id: "auth",
      title: "认证 / Auth",
      icon: <SecurityOutlinedIcon color="primary" />,
      body: <Typography variant="body2">OAuth 授权、刷新/撤销 Token。Demo：在首页“连接 Canva”。</Typography>,
    },
    {
      id: "assets",
      title: "资产 / Assets（素材上传）",
      icon: <CloudUploadOutlinedIcon color="primary" />,
      body: (
        <>
          <Typography variant="body2" paragraph>
            创建上传任务、轮询上传结果、读取资产（含缩略图）。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            典型流：createAssetUploadJob → getAssetUploadJob（轮询）→ asset.id/thumbnail。
          </Typography>
        </>
      ),
    },
    {
      id: "designs",
      title: "设计 / Designs（单个设计·内容库）",
      icon: <DesignServicesOutlinedIcon color="primary" />,
      body: (
        <>
          <Typography variant="body2" paragraph>
            新建设计（预设/自定义尺寸/基于素材）、获取设计与编辑链接。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            典型流：createDesign → 打开 edit_url（带 correlation_state/return_nav_url）→ 回跳处理。
          </Typography>
        </>
      ),
    },
    {
      id: "exports",
      title: "导出 / Exports",
      icon: <IosShareOutlinedIcon color="primary" />,
      body: <Typography variant="body2">创建导出任务、轮询完成、下载 PNG/PDF 等。</Typography>,
    },
    {
      id: "templates",
      title: "品牌模板 / Brand Templates（批量设计）",
      icon: <CategoryOutlinedIcon color="primary" />,
      body: (
        <>
          <Typography variant="body2" paragraph>
            列表/读取模板；从模板打开编辑（create_url）；或通过 API 创建设计（保留回跳）。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            场景：批量营销；可与自动填充结合。
          </Typography>
        </>
      ),
    },
    {
      id: "autofill",
      title: "自动填充 / Autofill（批量生成）",
      icon: <AutoAwesomeMosaicOutlinedIcon color="primary" />,
      body: <Typography variant="body2">将商品/数据映射到模板占位符，一次生成多份设计。</Typography>,
    },
    {
      id: "return-nav",
      title: "返回导航 / Return Navigation",
      icon: <UndoOutlinedIcon color="primary" />,
      body: (
        <>
          <Typography variant="body2" paragraph>
            关键参数：correlation_state（含来源上下文）、design_id。
          </Typography>
          <Typography variant="body2" color="text.secondary">
            步骤：解析参数 → 获取设计 →（可选）导出 → 返回来源。
          </Typography>
        </>
      ),
    },
    {
      id: "scopes",
      title: "Scope（示例）",
      icon: <PersonOutlineOutlinedIcon color="primary" />,
      body: (
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label="asset:read" size="small" />
          <Chip label="asset:write" size="small" />
          <Chip label="design:read" size="small" />
          <Chip label="design:write" size="small" />
          <Chip label="brandtemplate:meta:read" size="small" />
          <Chip label="brandtemplate:content:read" size="small" />
          <Chip label="export:write" size="small" />
          <Chip label="profile:read" size="small" />
        </Stack>
      ),
    },
  ];

  return (
    <Box padding={3}>
      <PageDescriptor
        title="API 概览"
        description="按功能模块梳理 Canva Connect API，在 Demo 中的落地与典型业务流程。"
      />
      <Grid container spacing={2} alignItems="stretch">
        {sections.map((s) => (
          <Grid key={s.id} item xs={12} sm={6} md={3}>
            <Section title={s.title}>
              <Box display="flex" alignItems="center" mb={1} sx={{ '& svg': { mr: 1 } }}>
                {s.icon}
              </Box>
              {s.body}
            </Section>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ApiOverviewPage;


