import { Box, Typography, Stack, Card, CardContent, Divider, Grid, Chip, Paper, alpha } from "@mui/material";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import IosShareOutlinedIcon from "@mui/icons-material/IosShareOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import AutoAwesomeMosaicOutlinedIcon from "@mui/icons-material/AutoAwesomeMosaicOutlined";
import UndoOutlinedIcon from "@mui/icons-material/UndoOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import WebhookOutlinedIcon from "@mui/icons-material/WebhookOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PageDescriptor } from "src/components";
import { useTheme } from "@mui/material/styles";

interface ApiFeature {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  color: string;
  capabilities: string[];
  workflow?: string;
  demoPath?: string;
  scopes?: string[];
}

const ApiOverviewPage = (): JSX.Element => {
  const theme = useTheme();

  const apis: ApiFeature[] = [
    {
      id: "auth",
      title: "认证",
      subtitle: "Auth / OAuth",
      icon: <SecurityOutlinedIcon />,
      color: "#7C3AED",
      capabilities: [
        "OAuth 2.0 授权流程",
        "获取 Access Token",
        "刷新 Token",
        "撤销 Token",
      ],
      workflow: "用户授权 → 获取 code → 交换 token → API 调用",
      demoPath: "首页 - 连接 Canva",
      scopes: ["profile:read"],
    },
    {
      id: "users",
      title: "用户",
      subtitle: "Users / Profile",
      icon: <PersonOutlineOutlinedIcon />,
      color: "#0EA5E9",
      capabilities: [
        "获取当前用户信息",
        "获取团队信息",
        "判断企业版能力",
      ],
      demoPath: "导航栏 - 用户信息",
      scopes: ["profile:read"],
    },
    {
      id: "assets",
      title: "资产",
      subtitle: "Assets / Uploads",
      icon: <CloudUploadOutlinedIcon />,
      color: "#10B981",
      capabilities: [
        "创建上传任务",
        "轮询上传状态",
        "获取资产信息",
        "读取缩略图 URL",
        "支持图片/视频/音频",
      ],
      workflow: "createAssetUploadJob → 轮询 getAssetUploadJob → 获取 asset.id/thumbnail",
      demoPath: "素材上传",
      scopes: ["asset:read", "asset:write"],
    },
    {
      id: "designs",
      title: "设计",
      subtitle: "Designs / Create & Edit",
      icon: <DesignServicesOutlinedIcon />,
      color: "#F59E0B",
      capabilities: [
        "新建空白设计（预设类型）",
        "新建自定义尺寸设计",
        "基于资产创建设计",
        "获取设计元信息",
        "获取编辑链接",
        "获取设计缩略图",
      ],
      workflow: "createDesign → 打开 edit_url（带 correlation_state/return_nav_url）→ 用户编辑 → 回跳",
      demoPath: "营销 - 单个设计 / 内容库",
      scopes: ["design:content:read", "design:content:write", "design:meta:read"],
    },
    {
      id: "exports",
      title: "导出",
      subtitle: "Exports / Download",
      icon: <IosShareOutlinedIcon />,
      color: "#EF4444",
      capabilities: [
        "创建导出任务",
        "轮询导出状态",
        "下载 PNG 文件",
        "下载 PDF 文件",
        "下载 JPG 文件",
        "下载 MP4 文件（视频设计）",
      ],
      workflow: "createDesignExportJob → 轮询直到完成 → 下载文件",
      demoPath: "内容库 - 导出 / 回跳后导出",
      scopes: ["design:content:read"],
    },
    {
      id: "brand-templates",
      title: "品牌模板",
      subtitle: "Brand Templates",
      icon: <CategoryOutlinedIcon />,
      color: "#8B5CF6",
      capabilities: [
        "列出所有品牌模板",
        "获取模板详情",
        "获取模板缩略图",
        "从模板创建设计",
        "支持占位符映射",
      ],
      workflow: "listBrandTemplates → 选择模板 → 创建设计或自动填充",
      demoPath: "品牌模板",
      scopes: ["brandtemplate:meta:read", "brandtemplate:content:read"],
    },
    {
      id: "autofill",
      title: "自动填充",
      subtitle: "Autofill / Batch Generate",
      icon: <AutoAwesomeMosaicOutlinedIcon />,
      color: "#EC4899",
      capabilities: [
        "批量生成设计",
        "数据映射到占位符",
        "支持文本/图片替换",
        "批量应用品牌模板",
        "一次创建多份设计",
      ],
      workflow: "选择模板 → 准备数据源 → 批量创建 → 获取设计列表",
      demoPath: "营销 - 批量设计",
      scopes: ["design:content:write", "brandtemplate:content:read"],
    },
    {
      id: "return-nav",
      title: "返回导航",
      subtitle: "Return Navigation",
      icon: <UndoOutlinedIcon />,
      color: "#06B6D4",
      capabilities: [
        "从 Canva 编辑器返回应用",
        "传递上下文状态",
        "获取编辑后的 design_id",
        "解析 correlation_state",
        "执行后续操作（导出/保存）",
      ],
      workflow: "打开编辑时传 return_nav_url → 用户编辑完成 → 回跳到应用 → 处理回跳逻辑",
      demoPath: "回跳页面",
    },
    {
      id: "webhooks",
      title: "Webhooks",
      subtitle: "Event Subscriptions",
      icon: <WebhookOutlinedIcon />,
      color: "#64748B",
      capabilities: [
        "订阅异步事件",
        "导出完成通知",
        "设计更新通知",
        "签名验证",
      ],
      workflow: "配置 webhook URL → 订阅事件 → 接收回调 → 验证签名",
    },
  ];

  const workflowSteps = [
    { label: "上传资产", icon: <CloudUploadOutlinedIcon fontSize="small" /> },
    { label: "新建设计", icon: <DesignServicesOutlinedIcon fontSize="small" /> },
    { label: "打开编辑", icon: <DesignServicesOutlinedIcon fontSize="small" /> },
    { label: "回跳应用", icon: <UndoOutlinedIcon fontSize="small" /> },
    { label: "导出文件", icon: <IosShareOutlinedIcon fontSize="small" /> },
  ];

  return (
    <Box padding={3}>
      <PageDescriptor
        title="Canva Connect API 概览"
        description="完整的 API 能力索引，涵盖认证、资产管理、设计创建、导出下载、品牌模板与自动填充等核心功能。"
      />

      {/* 端到端流程卡片 */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <TimelineOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            典型端到端流程
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          {workflowSteps.map((step, index) => (
            <Stack key={step.label} direction="row" alignItems="center" spacing={1}>
              <Chip
                icon={step.icon}
                label={step.label}
                size="medium"
                sx={{
                  fontWeight: 500,
                  bgcolor: "background.paper",
                }}
              />
              {index < workflowSteps.length - 1 && (
                <ArrowForwardIcon sx={{ color: "text.secondary", fontSize: 20 }} />
              )}
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* API 能力卡片 */}
      <Grid container spacing={2.5}>
        {apis.map((api) => (
          <Grid key={api.id} item xs={12} md={6} lg={4}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: theme.shadows[4],
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                {/* 头部 */}
                <Stack direction="row" spacing={1.5} alignItems="flex-start" mb={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(api.color, 0.1),
                      color: api.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {api.icon}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {api.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {api.subtitle}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* 能力列表 */}
                <Box mb={2}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                    核心能力
                  </Typography>
                  <Stack spacing={0.5}>
                    {api.capabilities.map((capability, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <CheckCircleOutlineIcon sx={{ fontSize: 16, color: api.color }} />
                        <Typography variant="body2">{capability}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* 典型流程 */}
                {api.workflow && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                      典型流程
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      {api.workflow}
                    </Typography>
                  </Box>
                )}

                {/* Demo 路径 */}
                {api.demoPath && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                      在 Demo 中
                    </Typography>
                    <Chip label={api.demoPath} size="small" color="primary" variant="outlined" />
                  </Box>
                )}

                {/* Scopes */}
                {api.scopes && api.scopes.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom color="text.secondary">
                      所需权限
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {api.scopes.map((scope) => (
                        <Chip
                          key={scope}
                          label={scope}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            height: 20,
                            bgcolor: alpha(api.color, 0.1),
                            color: api.color,
                            fontFamily: "monospace",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ApiOverviewPage;


