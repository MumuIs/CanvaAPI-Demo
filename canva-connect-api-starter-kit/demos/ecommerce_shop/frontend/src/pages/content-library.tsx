import { useEffect, useState } from "react";
import { Box, Card, CardContent, Grid, Stack, Typography, Button } from "@mui/material";
import { PageDescriptor } from "src/components";
import { useAppContext } from "src/context";
import { createNavigateToCanvaUrl } from "src/services/canva-return";
import { EditInCanvaPageOrigins } from "src/models";

type SavedDesign = { id: string; title: string; editUrl: string; createdAt: number };

const ContentLibraryPage = (): JSX.Element => {
  const { isAuthorized, addAlert } = useAppContext();
  const [designs, setDesigns] = useState<SavedDesign[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("content_library_designs");
      const list = raw ? (JSON.parse(raw) as SavedDesign[]) : [];
      setDesigns(list);
    } catch {
      setDesigns([]);
    }
  }, []);

  const openDesign = (d: SavedDesign) => {
    const url = createNavigateToCanvaUrl({
      editUrl: d.editUrl,
      correlationState: { originPage: EditInCanvaPageOrigins.MARKETING_SINGLE },
    });
    window.open(url.toString(), "_blank");
  };

  const clearAll = () => {
    localStorage.removeItem("content_library_designs");
    setDesigns([]);
    addAlert({ title: "已清空内容库", variant: "info" });
  };

  return (
    <Box padding={4}>
      <PageDescriptor title="内容库" description="统一展示通过 API 创建的设计，支持快速继续编辑。" />
      <Stack spacing={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            共 {designs.length} 个设计
          </Typography>
          <Button size="small" onClick={clearAll} disabled={designs.length === 0}>清空</Button>
        </Box>
        {designs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">暂无通过 API 创建的设计</Typography>
        ) : (
          <Grid container={true} spacing={2}>
            {designs.map((d) => (
              <Grid item={true} xs={12} md={6} lg={4} key={d.id}>
                <Card>
                  <CardContent>
                    <Stack spacing={1}>
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


