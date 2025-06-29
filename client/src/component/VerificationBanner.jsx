
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const VerificationBanner = () => {
  const { user, updateUser } = useAuth();
  const [timeLeft, setTimeLeft] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const intervalRef = useRef(null);

  
  useEffect(() => {
    

    const calculateTimeLeft = () => {
      if (user && !user.isVerified && user.verificationTokenExpires) {
        const expiryDate = new Date(user.verificationTokenExpires);
        const now = new Date();
        const difference = expiryDate.getTime() - now.getTime();

        if (isNaN(expiryDate.getTime()) || isNaN(difference)) {
          console.error('Invalid expiryDate or difference calculated.');
          setTimeLeft('Error calculating time');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          return;
        }

        if (difference > 0) {
          const totalSeconds = Math.floor(difference / 1000);
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
        } else {
          setTimeLeft('Expired');
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          console.log("Verification grace period expired. User may need to log in again.");
          
          if (user && user.email) {
            axios.get('/api/auth/me')
              .then(response => {
                updateUser(response.data);
              })
              .catch(err => {
                console.error("Failed to re-fetch user after expiry:", err);
                
              });
          }
        }
      } else {
        setTimeLeft(null);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (user && !user.isVerified && user.verificationTokenExpires) {
      calculateTimeLeft();
      intervalRef.current = setInterval(calculateTimeLeft, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, updateUser]); 

  const handleResendVerification = async () => {
    setMessage('');
    setIsError(false);
    if (!user || !user.email) {
      setMessage('Error: No user email available to resend verification.');
      setIsError(true);
      return;
    }

    try {
      const response = await axios.post('/api/auth/resend-verification-email', { email: user.email });
      setMessage(response.data.message);
      setIsError(false);
      
      if (response.data.user) {
        updateUser(response.data.user);
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to resend verification email.');
      setIsError(true);
    }
  };

  
  if (!user || user.isVerified || user.role === 'child') {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 shadow-md rounded-md my-4 mx-auto w-11/12 md:w-full max-w-7xl" role="alert">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center text-center md:text-left flex-wrap md:flex-nowrap"> 
          <svg className="fill-current h-6 w-6 text-yellow-500 mr-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
          <p className="font-bold text-lg mr-2">Email Verification Required!</p> 
          <p className="text-sm md:text-base mt-2 md:mt-0"> 
            Your account email (<span className="font-semibold break-all">{user.email}</span>) is not verified. Please check your inbox for a verification link. After the link expires you would not be able log in.
          </p>
        </div>
        <div className="mt-2 md:mt-0 flex-col md:flex-row items-center gap-3 w-full md:w-auto"> 
          
          <button
            onClick={handleResendVerification}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-150 ease-in-out whitespace-nowrap w-full md:w-auto" 
          >
            Resend Verification Email
          </button>
          {timeLeft && (
            <p className="text-sm md:text-xs mr-0 md:mr-4 font-semibold text-yellow-800 text-center w-full md:w-auto "> 
              Link expires in: <span className="font-bold">{timeLeft}</span>
            </p>
          )}
        </div>
      </div>
      {message && (
        <p className={`mt-3 text-center text-sm ${isError ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default VerificationBanner;
