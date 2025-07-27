
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth(); 
  
  const from = location.state?.from?.pathname || "/";

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [childOptions, setChildOptions] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [loginAsParent, setLoginAsParent] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const fetchChildrenForEmail = async (email) => {
    if (!email) {
      setChildOptions([]);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/parent/${email}/children`);
      if (response.ok) {
        const children = await response.json();
        setChildOptions(children);
       
        setSelectedChild('');
        setLoginAsParent(true);
      } else {
        setChildOptions([]);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setChildOptions([]);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChildrenForEmail(credentials.email);
    }, 500); 

    return () => clearTimeout(timer);
  }, [credentials.email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      let loginData;
      
      if (!loginAsParent && selectedChild) {
        
        loginData = {
          role: 'child',
          childId: selectedChild,
          parentEmail: credentials.email,
          password: credentials.password
        };
      } else {
        
        loginData = {
          email: credentials.email,
          password: credentials.password
        };
      }

      const response = await login(loginData); 

      const loggedInUser = response.user; 

      if (loggedInUser && loggedInUser.role !== 'child' && !loggedInUser.isVerified) {
        const expiryDate = new Date(loggedInUser.verificationTokenExpires);
        const now = new Date();

        if (expiryDate < now) {
          
          setMessage('Error: Your email verification period has expired. Please contact support.');
    
          return; 
        }
      }

      setMessage('Login successful!');
      navigate(from, { replace: true });
    } catch (error) {
     
      setMessage('Error: ' + (error.message || 'Login failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 mb-10 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.startsWith('Error') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            required
          />
        </div>

        {/* Show children options if parent has children */}
        {childOptions.length > 0 && (
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm text-gray-600 mb-3">Login as:</p>
            
            {/* Parent option */}
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="loginAsParent"
                name="loginOption"
                checked={loginAsParent}
                onChange={() => {
                  setLoginAsParent(true);
                  setSelectedChild('');
                }}
                className="mr-2"
              />
              <label htmlFor="loginAsParent" className="text-gray-700">
                Parent Account
              </label>
            </div>

            {/* Child options */}
            {childOptions.map(child => (
              <div key={child._id} className="flex items-center mb-2">
                <input
                  type="radio"
                  id={`child-${child._id}`}
                  name="loginOption"
                  checked={!loginAsParent && selectedChild === child._id}
                  onChange={() => {
                    setLoginAsParent(false);
                    setSelectedChild(child._id);
                  }}
                  className="mr-2"
                />
                <label htmlFor={`child-${child._id}`} className="text-gray-700">
                  {child.profile.name} (Child)
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Password Field */}
        <div>
          <label className="block text-gray-700 mb-1">Password:</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded font-medium text-white ${
            isLoading
              ? 'bg-[#6ec4ef] cursor-not-allowed'
              : 'bg-[#6ec4ef] hover:bg-[#6ec4efcf] focus:outline-none focus:ring-2 transition-colors focus:ring-gray-300'
          }`}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register as Parent
          </Link>{' '}
          or{' '}
          <Link to="/register/therapist" className="text-blue-600 hover:underline">
            Register as Therapist
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
