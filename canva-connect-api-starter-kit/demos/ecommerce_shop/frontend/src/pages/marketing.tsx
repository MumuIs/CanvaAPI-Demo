import { useNavigate } from "react-router-dom";
import { Box, Grid, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DeveloperNote } from "src/components";
import { Paths } from "src/routes";

export const MarketingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <Typography variant="h4" gutterBottom={true}>
        市场营销
      </Typography>
      <Grid container={true} spacing={2}>
        <Grid item={true} xs={4}>
          <CallToActionPaper
            devNoteText="单个设计通过“创建设计”API 生成，适用于所有 Canva 订阅层级。"
            callToActionText="单个设计"
            callToActionDescription="从现有商品按指定尺寸创建一个设计"
            onClick={() => navigate(Paths.SINGLE_DESIGN_GENERATOR)}
          />
        </Grid>
        <Grid item={true} xs={4}>
          <CallToActionPaper
            devNoteText="批量设计基于品牌模板与自动填充 API，仅对 Canva Enterprise 开放。"
            callToActionText="批量设计"
            callToActionDescription="将商品添加到品牌模板，一次性创建多个设计"
            onClick={() => navigate(Paths.MULTIPLE_DESIGNS_GENERATOR)}
          />
        </Grid>
      </Grid>
    </>
  );
};

const CallToActionPaper = ({
  devNoteText,
  callToActionText,
  callToActionDescription,
  onClick,
}: {
  devNoteText: string;
  callToActionText: string;
  callToActionDescription: string;
  onClick: () => void;
}) => {
  return (
    <Box display="flex" flexDirection="column" height="100%">
      <DeveloperNote info={devNoteText} />
      <Paper
        variant="outlined"
        onClick={onClick}
        sx={{
          marginTop: 2,
          paddingTop: 2,
          paddingBottom: 2,
          paddingX: 4,
          borderRadius: 1,
          flex: 1,
          cursor: "pointer",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <AddIcon color="info" fontSize="large" />
          <Typography
            variant="h6"
            color={(theme) => theme.palette.success.main}
            marginY={2}
          >
            {callToActionText}
          </Typography>
          <Typography
            variant="subtitle2"
            color={(theme) => theme.palette.success.main}
            align="center"
          >
            {callToActionDescription}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
