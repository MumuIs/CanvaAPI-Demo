import { AppBar, Container, Link, Toolbar, Box, Typography } from "@mui/material";
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
              variant="h6"
              sx={{
                fontWeight: 700,
                color: (theme) => theme.palette.primary.main,
                letterSpacing: 0.4,
              }}
            >
              Canva Enterprise
            </Typography>
          </Box>
        </Link>
      </Toolbar>
    </Container>
  </AppBar>
);
