import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmailVerificationSuccess = () => {
  const [statusMessage, setStatusMessage] = useState({ text: 'Verifying...', success: false });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const verifyEmail = useCallback(async () => {
    const token = new URLSearchParams(location.search).get('token');
    if (!token) {
      setStatusMessage({ text: 'No verification token found in URL. Please request a new one.', success: false });
      return;
    }

    try {
      const { data } = await axios.get(`/api/auth/verify-email`, { params: { token } });
      setStatusMessage({ text: data.message, success: true });

      if (user?.email) {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        if (stored?.email === user.email) {
          updateUser({ ...stored, isVerified: true });
        }
      }
    } catch (err) {
      console.error('Email verification error:', err);
      const errorText = err.response?.data?.error || 'Verification failed.';

      if (errorText.includes('Invalid or expired verification token')) {
        setStatusMessage({ text: 'Your email is already verified! Please log in.', success: true });
      
        if (user?.email) {
          const stored = JSON.parse(localStorage.getItem('user') || 'null');
          if (stored?.email === user.email) {
            updateUser({ ...stored, isVerified: true });
          }
        }
      } else {
        setStatusMessage({ text: errorText, success: false });
      }
    }
  }, [location.search, user, updateUser]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  const { text, success } = statusMessage;

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className={`${success ? 'text-green-500' : 'text-red-500'} text-6xl mb-4`}>  
          {success ? '\u2714' : '\u274C'}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {success ? 'Email Verified!' : 'Verification Status'}
        </h2>
        <p className="text-gray-600 mb-6">{text}</p>

        {success ? (
          <Link
            to="/login"
            className="bg-[#88c6e4] hover:bg-[#5495b5] text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out"
          >
            Go to Login
          </Link>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out"
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
