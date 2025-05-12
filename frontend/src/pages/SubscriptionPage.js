import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import StripeProvider from '../components/StripeProvider';
import SubscriptionForm from '../components/SubscriptionForm';
import axios from 'axios';

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [isAuthenticated, navigate]);

  const handleSubscriptionSuccess = (subscription) => {
    // Show success message
    alert('Subscription successful! Welcome to GoStream Premium.');
    
    // Redirect to home page
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your GoStream Plan
          </h1>
          <p className="text-xl text-gray-600">
            Get unlimited access to all your favorite content
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <StripeProvider>
            <SubscriptionForm 
              user={user} 
              onSuccess={handleSubscriptionSuccess} 
            />
          </StripeProvider>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage; 