"use client";

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { createTheme, ThemeProvider } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Open_Sans } from 'next/font/google';
import { Provider } from 'react-redux';
import store from '../redux/store';
import '../styles/styles.css';
import '../styles/CircleOfFifths.css';
import './styles.css';

const inter = Open_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

const theme = createTheme({
  typography: {
    fontFamily: ['Chilanka', 'cursive'].join(','),
  },
});

const drawerWidth = 240;

/* -----------------------------------------------------------
   FIX 1: Remove overflow sources
----------------------------------------------------------- */
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: 0,
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: '100%',
    maxWidth: '100%',          // ← FIXED (was 100vw)
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  })
);

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  padding: '0 25px',
  margin: 0,
  width: '100%',              // ← FIXED (was 100vw)

  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),

  '@media print': { display: 'none' },

  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,   // ← FIXED (was 100vw)
    left: `${drawerWidth}px`,

    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),

  zIndex: 3000,
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Container = styled('div')({
  width: '100%',
  maxWidth: '100%',       // ← FIXED
  margin: 0,
  padding: 0,
  overflowX: 'hidden',    // ← SAFETY
});

const NavLinks = styled('div')({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  gap: '16px',
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

const DrawerContent = styled('div')({
  width: drawerWidth,
  zIndex: 10000,
  position: 'relative',
});

const ToolbarContent = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

/* -----------------------------------------------------------
   MAIN COMPONENT
----------------------------------------------------------- */
function App({ Component, pageProps }) {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleDrawerClose = () => setDrawerOpen(false);

  const drawer = (
    <DrawerContent>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>

      <Divider />

      <List>
        <Link href="/" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>Play and Visualize</Typography></ListItemText></ListItem>
        </Link>
        <Link href="/news" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>Musicians News</Typography></ListItemText></ListItem>
        </Link>
        <Link href="/learn" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>Learn Songs</Typography></ListItemText></ListItem>
        </Link>
        <Link href="/circle" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>The Circle Of Fifths</Typography></ListItemText></ListItem>
        </Link>
        <Link href="/compose" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>Compose Music</Typography></ListItemText></ListItem>
        </Link>
        <Link href="/references" passHref>
          <ListItem onClick={handleDrawerToggle}><ListItemText><Typography>References</Typography></ListItemText></ListItem>
        </Link>
      </List>

      <Divider />
    </DrawerContent>
  );

  return (
    <>
      <style jsx global>{`
        html, body {
          overflow-x: hidden !important;   /* ← HARD LOCK */
          max-width: 100% !important;
        }
        html {
          font-family: ${inter.style.fontFamily};
          font-weight: 300;
        }
      `}</style>

      <Provider store={store}>
        <ThemeProvider theme={theme}>
          
          {/* FIX 2: Replace 100vw with 100% */}
          <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
            
            <AppBarStyled position="fixed" open={drawerOpen}>
              <ToolbarContent>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerToggle}
                  edge="end"
                  sx={{
                    mr: 2,
                    ...(drawerOpen && { display: 'none' }),
                    "@media (min-width:1200px)": { display: "none" },
                  }}
                >
                  <MenuIcon />
                </IconButton>

                <Button startIcon={<FavoriteIcon />}>
                  <Typography variant="h6" noWrap>Strum.fun</Typography>
                </Button>

                <NavLinks sx={{ "@media (max-width:1200px)": { display: "none" } }}>
                  <StyledLink href="/"><Button color="inherit">Play and Visualize</Button></StyledLink>
                  <StyledLink href="/news"><Button color="inherit">Musicians News</Button></StyledLink>
                  <StyledLink href="/learn"><Button color="inherit">Learn Songs</Button></StyledLink>
                  <StyledLink href="/circle"><Button color="inherit">The Circle Of Fifths</Button></StyledLink>
                  <StyledLink href="/compose"><Button color="inherit">Compose Music</Button></StyledLink>
                  <StyledLink href="/references"><Button color="inherit">References</Button></StyledLink>
                </NavLinks>
              </ToolbarContent>
            </AppBarStyled>

            <nav style={{ zIndex: 10000 }}>
              <Drawer
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    zIndex: 10000,
                    position: 'fixed',
                  },
                  "@media (min-width:1200px)": {
                    display: "none",
                  },
                }}
                variant="temporary"
                open={drawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
              >
                {drawer}
              </Drawer>
            </nav>

            <Main open={drawerOpen}>
              <Container>
                <Component {...pageProps} leftDrawerOpen={drawerOpen} leftDrawerWidth={drawerWidth} />
              </Container>
            </Main>

          </Box>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
