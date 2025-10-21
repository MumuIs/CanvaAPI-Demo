import { useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert, Stack, Grid, Avatar, Divider } from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";
import { createNavigateToCanvaUrl } from "src/services/canva-return";
import { EditInCanvaPageOrigins } from "src/models";
import { saveDesignToContentLibrary } from "src/utils/content-library";

const UploadsPage = (): JSX.Element => {
  const { isAuthorized, services, addAlert } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [recentAssets, setRecentAssets] = useState<Array<{ id: string; name: string; createdAt: number; thumb?: string }>>(() => {
    try {
      const raw = localStorage.getItem("recent_assets");
      return raw ? (JSON.parse(raw) as Array<{ id: string; name: string; createdAt: number; thumb?: string }>) : [];
    } catch {
      return [];
    }
  });

  const saveRecentAssets = (assets: Array<{ id: string; name: string; createdAt: number; thumb?: string }>) => {
    setRecentAssets(assets);
    try {
      localStorage.setItem("recent_assets", JSON.stringify(assets.slice(0, 20)));
    } catch {}
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const asset = await services.assets.uploadAssetBlob({ name: file.name, file });
      const thumb = asset.thumbnail?.url;
      saveRecentAssets([{ id: asset.id, name: file.name, createdAt: Date.now(), thumb }, ...recentAssets]);
      addAlert({ title: "素材上传成功", body: `Asset ID: ${asset.id}`, variant: "success", hideAfterMs: 5000 });
    } catch (e) {
      console.error(e);
      addAlert({ title: "素材上传失败", variant: "error" });
    } finally {
      setUploading(false);
    }
  };

  const onCreateDesignFromAsset = async (assetId: string, title?: string) => {
    try {
      const { design } = await services.designs.createDesignFromAsset({ assetId, title });
      const navigateToCanvaUrl = createNavigateToCanvaUrl({
        editUrl: design.urls.edit_url,
        correlationState: { originPage: EditInCanvaPageOrigins.MARKETING_SINGLE },
      });
      window.open(navigateToCanvaUrl.toString(), "_blank");
      addAlert({ title: "已基于素材创建设计并打开编辑", variant: "success" });

      // 保存到内容库
      saveDesignToContentLibrary(design);
    } catch (e) {
      console.error(e);
      addAlert({ title: "创建设计失败", variant: "error" });
    }
  };

  if (!isAuthorized) {
    return (
      <Box padding={4}>
        <PageDescriptor title="素材上传" description="请先连接 Canva 以使用上传与创建设计功能" />
        <Alert severity="info">请先在首页右侧“连接 Canva”。</Alert>
      </Box>
    );
  }

  return (
    <Box padding={4}>
      <PageDescriptor
        title="素材上传"
        description="选择本地图片上传为 Canva 资产，随后可通过 API 基于该资产创建设计并前往编辑。"
      />

      <Stack spacing={3}>
        <Card>
          <CardContent>
            <input type="file" accept="image/*" onChange={onFileChange} />
            <Box mt={2}>
              <Button variant="contained" disabled={!file || isUploading} onClick={onUpload}>
                {isUploading ? "上传中..." : "上传素材"}
              </Button>
            </Box>
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                说明：本页演示 Connect API 的 Assets 能力（上传/轮询完成）。上传成功后，可基于素材一键创建设计并打开编辑。
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom={true}>最近上传</Typography>
            {recentAssets.length === 0 ? (
              <Typography variant="body2" color="text.secondary">暂无记录</Typography>
            ) : (
              <Grid container={true} spacing={2}>
                {recentAssets.map((a) => (
                  <Grid item={true} xs={12} md={6} lg={4} key={a.id}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
                      {a.thumb ? (
                        <img src={a.thumb} alt={a.name} style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
                      ) : (
                        <Avatar sx={{ bgcolor: "primary.main" }}>{a.name.slice(0,1).toUpperCase()}</Avatar>
                      )}
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box>
                          <Typography>{a.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            上传时间：{new Date(a.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Button size="small" variant="outlined" onClick={() => onCreateDesignFromAsset(a.id, a.name)}>
                        基于素材创建设计
                      </Button>
                    </Box>
                    <Divider sx={{ mt: 2 }} />
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default UploadsPage;


