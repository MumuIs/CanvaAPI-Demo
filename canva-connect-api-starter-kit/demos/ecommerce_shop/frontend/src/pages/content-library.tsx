import { useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Stack, Typography, Button, CircularProgress } from "@mui/material";
import { PageDescriptor } from "src/components";
import { useAppContext } from "src/context";
import { createNavigateToCanvaUrl } from "src/services/canva-return";
import { EditInCanvaPageOrigins } from "src/models";
import { type SavedDesign, loadDesignsFromContentLibrary, clearContentLibrary } from "src/utils/content-library";

const ContentLibraryPage = (): JSX.Element => {
  const { isAuthorized, addAlert, services } = useAppContext();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setDesigns(loadDesignsFromContentLibrary());
  }, []);

  const openDesign = (d: SavedDesign) => {
    const url = createNavigateToCanvaUrl({
      editUrl: d.editUrl,
      correlationState: { originPage: EditInCanvaPageOrigins.MARKETING_SINGLE },
    });
    window.open(url.toString(), "_blank");
  };

  const clearAll = () => {
    clearContentLibrary();
    setDesigns([]);
    addAlert({ title: "已清空内容库", variant: "info" });
  };

  const syncUserDesigns = async () => {
    if (!isAuthorized) {
      addAlert({ title: "请先连接 Canva", variant: "warning" });
      return;
    }

    setIsSyncing(true);
    try {
      // 使用 listDesigns API 获取用户所有设计
      const result = await services.client.GET("/v1/designs");
      
      if (result.error) {
        throw new Error(result.error.message || "获取设计列表失败");
      }

      const userDesigns = result.data?.designs || [];
      
      // 转换为 SavedDesign 格式
      const newDesigns: SavedDesign[] = userDesigns.map(design => ({
        id: design.id,
        title: design.title || "Untitled",
        editUrl: design.urls.edit_url,
        createdAt: design.created_at * 1000, // 转换为毫秒
        thumb: design.thumbnail?.url,
      }));

      // 合并现有设计和用户设计，去重
      const existingDesigns = designs;
      const mergedDesigns = [...existingDesigns];
      
      newDesigns.forEach(newDesign => {
        if (!mergedDesigns.find(d => d.id === newDesign.id)) {
          mergedDesigns.push(newDesign);
        }
      });

      // 按创建时间排序（最新的在前）
      mergedDesigns.sort((a, b) => b.createdAt - a.createdAt);

      setDesigns(mergedDesigns);
      localStorage.setItem("content_library_designs", JSON.stringify(mergedDesigns));
      
      const addedCount = newDesigns.filter(nd => !existingDesigns.find(ed => ed.id === nd.id)).length;
      addAlert({ 
        title: `同步完成，新增 ${addedCount} 个设计`, 
        variant: "success" 
      });
    } catch (error) {
      console.error("同步设计失败:", error);
      addAlert({ title: "同步失败，请重试", variant: "error" });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Box padding={4}>
      <PageDescriptor title="内容库" description="统一展示通过 API 创建的设计，支持快速继续编辑。" />
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            共 {designs.length} 个设计
          </Typography>
          <Box display="flex" gap={1}>
            <Button 
              size="small" 
              variant="outlined"
              onClick={syncUserDesigns}
              disabled={isSyncing || !isAuthorized}
              startIcon={isSyncing ? <CircularProgress size={16} /> : undefined}
            >
              {isSyncing ? "同步中..." : "同步我的设计"}
            </Button>
            <Button size="small" onClick={clearAll} disabled={designs.length === 0}>清空</Button>
          </Box>
        </Box>
        {designs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {isAuthorized ? "暂无设计，点击上方\"同步我的设计\"获取你的所有设计" : "请先连接 Canva 以同步设计"}
          </Typography>
        ) : (
          <Grid container={true} spacing={2}>
            {designs.map((d) => (
              <Grid item={true} xs={12} md={6} lg={4} key={d.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
                      {d.thumb && (
                        <img src={d.thumb} alt={d.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8, border: "1px solid rgba(0,0,0,0.06)" }} />
                      )}
                      <Typography fontWeight={600}>{d.title || d.id}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        创建时间：{new Date(d.createdAt).toLocaleString()}
                      </Typography>
                      <Box>
                        <Button size="small" variant="outlined" onClick={() => openDesign(d)}>打开编辑</Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default ContentLibraryPage;


