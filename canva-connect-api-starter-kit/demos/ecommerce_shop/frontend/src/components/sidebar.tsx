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
import HomeIcon from "@mui/icons-material/Home";
import InboxIcon from "@mui/icons-material/Inbox";
import SendIcon from "@mui/icons-material/Send";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import UploadFileIcon from "@mui/icons-material/UploadFile";
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
      Icon: HomeIcon,
      route: Paths.HOME,
      disabled: false,
    },
    {
      text: "商品",
      Icon: ShoppingCartIcon,
      route: Paths.PRODUCTS,
      disabled: !isAuthorized,
    },
    {
      text: "市场营销",
      Icon: SendIcon,
      route: Paths.MARKETING,
      disabled: !isAuthorized,
    },
    {
      text: "品牌模板",
      Icon: SendIcon,
      route: Paths.BRAND_TEMPLATES,
      disabled: !isAuthorized,
    },
    {
      text: "模板测试",
      Icon: SendIcon,
      route: Paths.BRAND_TEMPLATES_TEST,
      disabled: !isAuthorized,
      isDemo: true,
    },
    {
      text: "上传",
      Icon: UploadFileIcon,
      route: Paths.HOME,
      disabled: true,
      isDemo: true,
    },
    {
      text: "订单",
      Icon: InboxIcon,
      route: Paths.HOME,
      disabled: true,
      isDemo: true,
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
                  <ListItemIcon>
                    <Icon color={isActive(route) ? "secondary" : "primary"} />
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
