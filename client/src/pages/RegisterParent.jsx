
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 

const RegisterParent = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 

  
  const [parentData, setParentData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '', 
    contact: '',
    address: ''
  });

  
  const [childData, setChildData] = useState({
    name: '',
    email: '',
    disabilityType: '',
    additionalInfo: '',
    password: '',
    useParentPassword: false
  });

  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false); 
  const [showChildPassword, setShowChildPassword] = useState(false); 
  const [registrationSuccess, setRegistrationSuccess] = useState(false); 

 
  const handleParentChange = (e) => {
    setParentData({ ...parentData, [e.target.name]: e.target.value });
  };

  
  const handleChildChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'useParentPassword') {
      setChildData({
        ...childData,
        useParentPassword: checked,
        password: checked ? parentData.password : ''
      });
    } else {
      setChildData({ ...childData, [name]: value });
    }
  };

 
  useEffect(() => {
    if (childData.useParentPassword) {
      setChildData((prev) => ({
        ...prev,
        password: parentData.password
      }));
    }
  }, [parentData.password, childData.useParentPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true); 
    setRegistrationSuccess(false);

    
    if (parentData.password !== parentData.confirmPassword) {
      setMessage('Error: Parent passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    
    if (!childData.password) {
      setMessage('Error: Child must have a password (or select "Use Parent\'s Password").');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      
      const childEmail = childData.email || `child-${Date.now()}@yourapp.local`;
      
      const registrationData = {
        parent: {
          name: parentData.name,
          email: parentData.email,
          password: parentData.password,
          contact: parentData.contact,
          address: parentData.address
        },
        child: {
          name: childData.name,
          email: childEmail,
          disabilityType: childData.disabilityType,
          additionalInfo: childData.additionalInfo,
          password: childData.password
        }
      };

     
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/register-parent`, registrationData);

      await login({ email: parentData.email, password: parentData.password });

      setMessage('Registration successful and you have been logged in! Please verify your email.');
      setIsError(false);
      setRegistrationSuccess(true); 
      navigate('/');
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.error || 'Registration failed'));
      setIsError(true);
      setRegistrationSuccess(false);
    } finally {
      setIsLoading(false); 
    }
  };

  const messageColorClass = isError ? "text-red-500 bg-red-100" : "text-green-500 bg-green-100";

  return (
    <div className="max-w-xl mx-auto mt-10 mb-10 flex flex-col items-center justify-center p-3">
      <div className='bg-[#db8ec1] p-3 py-5 rounded-t-lg w-full shadow-lg'>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white text-center">Parent &amp; Child Registration</h1>
      <h2 className="text-sm sm:text-md text-white text-center ">
            Your Journey to Clearer Speech Starts Here
          </h2>
      </div>

      {registrationSuccess ? (
        <div className="bg-green-100 border-l-4 w-full border-green-500 text-green-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Registration Successful!</p>
          <p>You have been automatically logged in. A verification link has been sent to <span className="font-semibold">{parentData.email}</span>. Please check your inbox to verify your account.</p>
          <Link to="/" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Go to Home
          </Link>
        </div>
      ) : (
        <>
          {message && <p className={`px-6 py-4 w-full ${messageColorClass}`}>{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6 p-6 w-full border-0 border-t-0 border-gray-300 rounded-b-lg shadow-lg">
            {/* Parent Section */}
            <section>
              <h3 className="text-2xl text-gray-700 font-semibold mb-4 text-center">Parent Details</h3>

              <label className="block text-gray-700 mb-1">Name:</label>
              <input
                type="text"
                name="name"
                value={parentData.name}
                onChange={handleParentChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                required
              />

              <label className="block text-gray-700 mb-1">Email:</label>
              <input
                type="email"
                name="email"
                value={parentData.email}
                onChange={handleParentChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">A verification link will be sent to this email.</p>

              <label className="block text-gray-700 mb-1 mt-4">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={parentData.password}
                  onChange={handleParentChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <label className="block text-gray-700 mb-1 mt-4">Confirm Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={parentData.confirmPassword}
                  onChange={handleParentChange}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <label className="block text-gray-700 mb-1">Contact:</label>
              <input
                type="text"
                name="contact"
                value={parentData.contact}
                onChange={handleParentChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />

              <label className="block text-gray-700 mb-1">Address:</label>
              <input
                type="text"
                name="address"
                value={parentData.address}
                onChange={handleParentChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />
            </section>

            {/* Child Section */}
            <section>
              <h3 className="text-2xl text-gray-700 font-semibold mb-6 text-center">Child Details</h3>

              <label className="block text-gray-700 mb-1">Name:</label>
              <input
                type="text"
                name="name"
                value={childData.name}
                onChange={handleChildChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                required
              />

              <label className="block text-gray-700 mb-1">Email (optional):</label>
              <input
                type="email"
                name="email"
                value={childData.email}
                onChange={handleChildChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />

              <label className="block text-gray-700 mb-1">Disability Type (optional):</label>
              <input
                type="text"
                name="disabilityType"
                value={childData.disabilityType}
                onChange={handleChildChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />

              <label className="block text-gray-700 mb-1">Additional Info (optional):</label>
              <textarea
                name="additionalInfo"
                value={childData.additionalInfo}
                onChange={handleChildChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              />

              {/* Child Password */}
              <label className="block text-gray-700 mb-1 mt-4">Child Password:</label>
              <div className="relative">
                <input
                  type={showChildPassword ? "text" : "password"}
                  name="password"
                  value={childData.password}
                  onChange={handleChildChange}
                  className={`w-full p-2 border border-gray-300 rounded focus:outline-none pr-10 ${
                    childData.useParentPassword ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  disabled={childData.useParentPassword}
                  required={!childData.useParentPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowChildPassword(!showChildPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 focus:outline-none"
                  disabled={childData.useParentPassword}
                >
                  {showChildPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="useParentPassword"
                  checked={childData.useParentPassword}
                  onChange={handleChildChange}
                  id="useParentPassword"
                  className="mr-2"
                />
                <label htmlFor="useParentPassword" className="text-gray-700">
                  Use Parent’s Password
                </label>
              </div>
            </section>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded font-medium text-white transition-all ${
                isLoading ? ' bg-[#6ec4ef] cursor-not-allowed' : 'bg-[#6ec4ef] hover:bg-[#6ec4efcf] '
              }`}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <Link to="/register/therapist" className="block text-center text-gray-500 hover:text-gray-700">
              Or apply to get registered as a Therapist
            </Link>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterParent;
