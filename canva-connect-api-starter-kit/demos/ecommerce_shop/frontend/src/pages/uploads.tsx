import { useState } from "react";
import { Box, Button, Card, CardContent, Typography, Alert, Stack } from "@mui/material";
import { useAppContext } from "src/context";
import { PageDescriptor } from "src/components";

const UploadsPage = (): JSX.Element => {
  const { isAuthorized, services, addAlert } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setUploading] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
  };

  const onUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const asset = await services.assets.uploadAssetBlob({ name: file.name, file });
      addAlert({ title: "素材上传成功", body: `Asset ID: ${asset.id}`, variant: "success", hideAfterMs: 5000 });
    } catch (e) {
      console.error(e);
      addAlert({ title: "素材上传失败", variant: "error" });
    } finally {
      setUploading(false);
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
                说明：本页演示 Connect API 的 Assets 能力（上传/轮询完成）。上传成功后，可在“商品”或“品牌模板”流程中将素材用于设计创建。
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default UploadsPage;


