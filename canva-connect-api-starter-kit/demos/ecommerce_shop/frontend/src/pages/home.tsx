import { Box, Card, CardContent, Grid, Paper, Typography } from "@mui/material";
import { BarChart } from "@mui/icons-material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { ConnectButton, DemoSalesChart, DeveloperNote } from "src/components";
import { useAppContext } from "src/context";

export const HomePage = () => {
  const { displayName } = useAppContext();

  return (
    <>
      <Typography variant="h4" gutterBottom={true}>
        {displayName ? `您好，${displayName}！` : `您好！`}
      </Typography>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary" paragraph={true}>
          这是一个完整的电商平台演示，展示了如何使用 Canva Connect API 将设计能力集成到您的应用中。通过本演示，您可以体验资产上传、设计创建、品牌模板使用等核心功能。
        </Typography>
        <Typography variant="body2" color="text.secondary">
          建议先查看“API 概览”页面了解所有可用的 API 功能。
        </Typography>
      </Box>
      <HomeTiles />
    </>
  );
};

const placeholderStats: {
  icon: React.ReactNode;
  title: string;
  label: string;
  number: number;
  changePct: number;
}[] = [
  {
    icon: <ShoppingCartOutlinedIcon />,
    title: "弃单数",
    label: "本周",
    number: 20,
    changePct: 0.1,
  },
  {
    icon: <PeopleAltOutlinedIcon />,
    title: "活跃客户",
    label: "本周",
    number: 1250,
    changePct: 0.15,
  },
  {
    icon: <ShoppingBagOutlinedIcon />,
    title: "订单总数",
    label: "本周",
    number: 10,
    changePct: -0.1,
  },
];

const HomeTiles = () => (
  <Grid
    container={true}
    spacing={2}
    alignItems="stretch"
    direction="row"
    justifyContent="stretch"
  >
    {placeholderStats.map(({ icon, title, label, number, changePct }) => (
      <Grid key={title} item={true} xs={4}>
        <InfoPaper
          title={title}
          label={label}
          icon={icon}
          Content={<Stat number={number} changePct={changePct} />}
        />
      </Grid>
    ))}
    <Grid item={true} xs={8}>
      <InfoPaper
        icon={<BarChart />}
        label="今年"
        title="销售汇总"
        Content={<DemoSalesChart />}
      />
    </Grid>
    <Grid item={true} xs={4} display="flex">
      <ConnectToCanvaCta />
    </Grid>
  </Grid>
);

const toFormattedPercentage = (decimal: number) => {
  const percentage = decimal * 100;

  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage}%`;
};

const InfoPaper = ({
  icon,
  title,
  label,
  Content,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  Content: React.ReactNode;
}) => (
  <Paper
    sx={{
      paddingX: 4,
      paddingY: 2,
      flexGrow: 1,
      height: "100%",
      borderRadius: 2,
      border: (t) => `1px solid ${t.palette.divider}`,
      boxShadow: (t) => `0 1px 2px rgba(16,24,40,0.04)`,
      backgroundColor: (t) => t.palette.background.paper,
    }}
  >
    <Box display="flex" justifyContent="space-between" marginBottom={3}>
      {icon}
      <Box display="flex" gap={1}>
        <Typography>{label}</Typography>
      </Box>
    </Box>
    <Typography variant="h6" marginBottom={3}>
      {title}
    </Typography>
    {Content}
  </Paper>
);

const Stat = ({ number, changePct }: { number: number; changePct: number }) => {
  return (
    <Box display="flex" flexDirection="row" gap={1}>
      <Typography variant="subtitle2">{number}</Typography>
      <Typography
        variant="subtitle2"
        color={changePct >= 0 ? "primary" : "error"}
      >
        ({toFormattedPercentage(changePct)})
      </Typography>
    </Box>
  );
};

export const ConnectToCanvaCta = () => {
  return (
    <Card sx={{ minWidth: 275, paddingX: 5, paddingY: 2 }}>
      <CardContent
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom={true} fontWeight={700}>
          连接 Canva
        </Typography>
        <Box paddingY={6}>
          <Typography
            variant="caption"
            align="center"
            paragraph={true}
            gutterBottom={true}
          >
          连接 Canva 企业版集成，便捷管理现有素材、编辑商品图片，并批量创建设计。
          </Typography>
          <Box display="flex" justifyContent="center">
            <ConnectButton />
          </Box>
        </Box>
        <Box display="flex" justifyContent="center">
          <DeveloperNote info="Set up an integration in the developer portal before connecting to Canva" />
        </Box>
      </CardContent>
    </Card>
  );
};
