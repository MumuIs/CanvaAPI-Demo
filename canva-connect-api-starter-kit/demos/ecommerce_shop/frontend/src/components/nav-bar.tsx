import { AppBar, Container, Link, Toolbar, Box, Typography, Chip } from "@mui/material";
import { CanvaIcon } from "./canva-icon";

export const NavBar = () => (
  <AppBar
    position="fixed"
    sx={{
      background: (theme) => theme.palette.background.default,
      zIndex: (theme) => theme.zIndex.drawer + 1,
    }}
  >
    <Container maxWidth={false}>
      <Toolbar disableGutters={true}>
        <Link href="/#/" style={{ textDecoration: "none" }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <CanvaIcon />
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 400,
                color: (theme) => theme.palette.text.primary,
                letterSpacing: 0.2,
              }}
            >
              Canva Enterprise
            </Typography>
            <Chip
              label="Connect API 演示"
              size="small"
              sx={{
                ml: 2,
                borderRadius: 999,
                color: (t) => t.palette.secondary.main,
                borderColor: (t) => t.palette.secondary.main,
              }}
              variant="outlined"
            />
          </Box>
        </Link>
      </Toolbar>
    </Container>
  </AppBar>
);
