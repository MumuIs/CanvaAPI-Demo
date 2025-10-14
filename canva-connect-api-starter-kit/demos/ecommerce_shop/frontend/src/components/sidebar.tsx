import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CollectionsBookmarkOutlinedIcon from "@mui/icons-material/CollectionsBookmarkOutlined";
import { useAppContext } from "src/context";
import { Paths } from "src/routes";

const drawerWidth = 240;

export const SideBar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthorized } = useAppContext();

  useEffect(() => {
    if (!isAuthorized) {
      navigate(Paths.HOME);
    }
  }, [navigate, isAuthorized]);

  const sidebarItems = [
    {
      text: "首页",
      Icon: HomeOutlinedIcon,
      route: Paths.HOME,
      disabled: false,
    },
    {
      text: "商品",
      Icon: Inventory2OutlinedIcon,
      route: Paths.PRODUCTS,
      disabled: !isAuthorized,
    },
    {
      text: "营销",
      Icon: CampaignOutlinedIcon,
      route: Paths.MARKETING,
      disabled: !isAuthorized,
    },
    {
      text: "品牌模板",
      Icon: CategoryOutlinedIcon,
      route: Paths.BRAND_TEMPLATES,
      disabled: !isAuthorized,
    },
    {
      text: "素材上传",
      Icon: CloudUploadOutlinedIcon,
      route: Paths.UPLOADS,
      disabled: !isAuthorized,
    },
    {
      text: "内容库",
      Icon: CollectionsBookmarkOutlinedIcon,
      route: Paths.CONTENT_LIBRARY,
      disabled: !isAuthorized,
    },
    
  ];

  const isActive = (path: string) => location.hash.replace('#','') === path || (location.hash === '' && path === Paths.HOME);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Toolbar />
      <Box overflow="auto">
        <List>
          {sidebarItems.map(({ text, Icon, route, disabled, isDemo }) => (
            <Tooltip
              title={isDemo ? "演示占位入口，暂无功能。" : ""}
              placement="right"
              key={text}
              arrow={true}
            >
              <ListItem disablePadding={true}>
                <ListItemButton
                  disabled={disabled}
                  onClick={() => navigate(route)}
                  sx={{
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                    backgroundColor: isActive(route)
                      ? theme.palette.secondary.backgroundBase
                      : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon fontSize="medium" color={isActive(route) ? "secondary" : "primary"} />
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
