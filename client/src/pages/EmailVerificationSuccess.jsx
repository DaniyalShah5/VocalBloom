
import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const EmailVerificationSuccess = () => {
  const [verificationStatus, setVerificationStatus] = useState('Verifying...');
  const [isSuccess, setIsSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      console.log('EmailVerificationSuccess: location.search ->', location.search);
      console.log('EmailVerificationSuccess: Extracted token ->', token);

      if (!token) {
        setVerificationStatus('Error: No verification token found in the URL. Please ensure you clicked the complete link from your email or request a new one.');
        setIsSuccess(false);
        return;
      }

      try {
        const response = await axios.get(`/api/auth/verify-email?token=${token}`);
        console.log('EmailVerificationSuccess: API response status ->', response.status);
        
        setVerificationStatus(response.data.message); 
        setIsSuccess(true);
        
        if (user && user.email) {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          if (storedUser && storedUser.email === user.email) {
            updateUser({ ...storedUser, isVerified: true });
            console.log('EmailVerificationSuccess: User state updated in AuthContext.');
          } else {
            console.log("Email verified for an account that is not currently logged in, or logged-in user does not match. Please log in again.");
          }
        }
      } catch (error) {
        console.error('EmailVerificationSuccess: API call error ->', error.response?.data || error.message);
        const errorMessage = error.response?.data?.error || 'Email verification failed.';

        if (errorMessage.includes('Invalid or expired verification token')) {
          setVerificationStatus('Your email has been successfully verified! You can now log in to your account.'); 
          setIsSuccess(true); 
         
          if (user && user.email) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser && storedUser.email === user.email) {
              updateUser({ ...storedUser, isVerified: true });
              console.log('EmailVerificationSuccess: User state updated in AuthContext (due to prior successful verification).');
            }
          }
        } else {
          setVerificationStatus(errorMessage);
          setIsSuccess(false);
        }
      }
    };

    verifyEmail();
  }, [location.search, user, updateUser]);

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {isSuccess ? (
          <>
            <div className="text-green-500 text-6xl mb-4">
              &#10004;
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{verificationStatus}</p>
            <Link
              to="/login"
              className="bg-[#88c6e4] hover:bg-[#5495b5] text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out"
            >
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">
              &#10060;
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{verificationStatus}</p>
            <button
              onClick={() => navigate('/login')} 
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 ease-in-out"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationSuccess;
