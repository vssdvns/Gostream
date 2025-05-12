import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoPlayer from './pages/VideoPlayer';
import VideoUpload from './pages/VideoUpload';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import New from './pages/New';
import MyList from './pages/MyList';
import AdminPanel from './pages/AdminPanel';
import { fetchUserProfile } from './store/slices/authSlice';
import { Box } from '@mui/material';
import SubscriptionPage from './pages/SubscriptionPage';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from './config/stripe';
import SubscriptionForm from './components/SubscriptionForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && isAuthenticated) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token, isAuthenticated]);

  const handleSubscriptionSuccess = (subscription) => {
    console.log('Subscription successful:', subscription);
    // Update user's subscription status in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      storedUser.subscribed = true;
      storedUser.plan = subscription.plan;
      localStorage.setItem('user', JSON.stringify(storedUser));
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      <Navbar />
      <Box sx={{ mt: 8 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/video/:id"
            element={
              <PrivateRoute>
                <VideoPlayer />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <VideoUpload />
              </PrivateRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <PrivateRoute>
                <Elements stripe={stripePromise}>
                  <SubscriptionForm 
                    user={user}
                    onSuccess={handleSubscriptionSuccess}
                  />
                </Elements>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-shows" element={<TVShows />} />
          <Route path="/new" element={<New />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Box>
    </div>
  );
}

export default App; 