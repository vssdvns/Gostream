import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Box,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Notifications,
  Upload as UploadIcon,
  AdminPanelSettings as AdminPanelIcon,
} from '@mui/icons-material';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(${theme.spacing(4)} + ${theme.spacing(2)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      handleClose();
      // Force a hard reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: scrolled ? 'rgba(0, 0, 0, 0.9)' : 'transparent',
        boxShadow: scrolled ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 0, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          GoStream
        </Typography>

        <Box sx={{ flexGrow: 1, display: 'flex', ml: 3 }}>
          <Button color="inherit" onClick={() => navigate('/')}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate('/movies')}>
            Movies
          </Button>
          <Button color="inherit" onClick={() => navigate('/tv-shows')}>
            TV Shows
          </Button>
          <Button color="inherit" onClick={() => navigate('/new')}>
            New & Popular
          </Button>
          {isAuthenticated && (
            <Button color="inherit" onClick={() => navigate('/my-list')}>
              My List
            </Button>
          )}
        </Box>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        {isAuthenticated ? (
          <>
            {user?.role === 'admin' && (
              <Button
                color="inherit"
                startIcon={<UploadIcon />}
                onClick={() => navigate('/upload')}
                sx={{ mr: 2 }}
              >
                Upload
              </Button>
            )}
            {user?.role === 'admin' && (
              <Button
                color="inherit"
                startIcon={<AdminPanelIcon />}
                onClick={() => navigate('/admin')}
                sx={{ mr: 2 }}
              >
                Admin Panel
              </Button>
            )}
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar
                alt={user?.name}
                src={user?.avatar}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={() => { navigate('/subscription'); handleClose(); }}>
                Subscription
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/register')}
              sx={{ ml: 1 }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 