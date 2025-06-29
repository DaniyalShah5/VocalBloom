
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from '../src/context/AuthContext';
import { SocketProvider } from '../src/context/SocketContext';
import axios from 'axios';
import { SessionProvider } from './context/SessionContext';


axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SocketProvider>
        <SessionProvider>
      <App />
      </SessionProvider>
      </SocketProvider>
    </AuthProvider>
  </React.StrictMode>
);