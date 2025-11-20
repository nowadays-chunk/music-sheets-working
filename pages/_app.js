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
import Hidden from '@mui/material/Hidden';
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
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Open_Sans({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

const theme = createTheme({
  typography: {
    fontFamily: ['Chilanka', 'cursive'].join(','),
  },
});

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));


const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  padding: '0 25px',
  '@media print': {
    display: 'none',
  },
  ...(open && {
    width: '100%',
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Container = styled('div')({
  width: '100%',
});

const NavLinks = styled('div')({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  gap: '16px', // Add spacing between menu items
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'inherit',
});

const DrawerContent = styled('div')({
  width: drawerWidth,
});

const ToolbarContent = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
});

const ToolbarTitle = styled(Button)({});

function App({ Component, pageProps }) {
  const theme = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

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
          <ListItem  onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>Play and Visualize</Typography>
            </ListItemText>
          </ListItem>
        </Link>
        {/* <Link href="/compose" passHref>
          <ListItem onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>Compose and Share</Typography>
            </ListItemText>
          </ListItem>
        </Link> */}
        <Link href="/learn" passHref>
          <ListItem onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>Learn Songs</Typography>
            </ListItemText>
          </ListItem>
        </Link>
        <Link href="/circle" passHref>
          <ListItem onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>The Circle Of Fifths</Typography>
            </ListItemText>
          </ListItem>
        </Link>
        {/* <Link href="/generate" passHref>
          <ListItem onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>Generate Tabs</Typography>
            </ListItemText>
          </ListItem>
        </Link> */}
        <Link href="/references" passHref>
          <ListItem onClick={handleDrawerToggle}>
            <ListItemText>
              <Typography>References</Typography>
            </ListItemText>
          </ListItem>
        </Link>
      </List>
      
      <Divider />
    </DrawerContent>
  );

  return (
    <>
      <style jsx global>{`
        html {
          font-family: ${inter.style.fontFamily};
          font-weight: 300;
        }
      `}</style>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {<AppBarStyled position="fixed" open={drawerOpen}>
              <ToolbarContent>
              <Hidden mdUp>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerToggle}
                  edge="end"
                  sx={{ mr: 2, ...(drawerOpen && { display: 'none' }) }}
                >
                  <MenuIcon />
                </IconButton>
                </Hidden>
                <ToolbarTitle variant="secondary" startIcon={<FavoriteIcon />}>
                  <Typography variant="h6" noWrap component="div">
                    Strum.fun
                  </Typography>
                </ToolbarTitle>
                <Hidden mdDown>
                  <NavLinks>
                    <StyledLink href="/">
                      <Button color="inherit">Play and Visualize</Button>
                    </StyledLink>
                    {/* <StyledLink href="/compose">
                      <Button color="inherit">Compose and Share</Button>
                    </StyledLink> */}
                    <StyledLink href="/learn">
                      <Button color="inherit">Learn Songs</Button>
                    </StyledLink>
                    <StyledLink href="/circle">
                      <Button color="inherit">The Circle Of Fifths</Button>
                    </StyledLink>
                    {/* <StyledLink href="/generate">
                      <Button color="inherit">Generate Tabs</Button>
                    </StyledLink> */}
                    <StyledLink href="/references">
                      <Button color="inherit">References</Button>
                    </StyledLink>
                  </NavLinks>
                </Hidden>
              </ToolbarContent>
            </AppBarStyled>}
            <nav>
              <Hidden mdUp>
                <Drawer
                  sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                      width: drawerWidth,
                      boxSizing: 'border-box',
                    },
                  }}
                  variant="temporary"
                  open={drawerOpen}
                  onClose={handleDrawerToggle}
                  ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                  }}
                >
                  {drawer}
                </Drawer>
              </Hidden>
            </nav>
            <Main open={drawerOpen}>
              <DrawerHeader />
              <Container>
                <Component {...pageProps} />
              </Container>
            </Main>
          </Box>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default App;
