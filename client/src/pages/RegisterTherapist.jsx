
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; 

const RegisterTherapist = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", 
    contact: "",
    address: "",
    authDegree: "",
    yearsOfExperience: "",
    specialties: [],
  });
  const [certificationFiles, setCertificationFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [registrationSuccess, setRegistrationSuccess] = useState(false); 


  
  const specialtyOptions = [
    "Articulation Disorders",
    "Language Delays",
    "Stuttering",
    "Voice Disorders",
    "Apraxia of Speech",
    "Aphasia",
    "Autism Spectrum Disorders",
    "Swallowing Disorders",
    "Hearing Impairments",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecialtyChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, value],
      });
    } else {
      setFormData({
        ...formData,
        specialties: formData.specialties.filter(
          (specialty) => specialty !== value
        ),
      });
    }
  };

  
  const handleFileChange = (e) => {
    setCertificationFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true); 
    setRegistrationSuccess(false);

    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Error: Passwords do not match.');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("contact", formData.contact);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("authDegree", formData.authDegree);
      formDataToSend.append("yearsOfExperience", formData.yearsOfExperience);
      formDataToSend.append("specialties", JSON.stringify(formData.specialties));

      certificationFiles.forEach((file) => {
        formDataToSend.append("certifications", file);
      });

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/register-therapist`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setMessage("Registration successful! A verification link has been sent to your email.");
      setIsError(false);
      setRegistrationSuccess(true); 
      
    } catch (error) {
      setMessage(
        "Error: " + (error.response?.data?.error || "Registration failed")
      );
      setIsError(true);
      setRegistrationSuccess(false);
    } finally {
      setIsLoading(false); 
    }
  };
  const messageColorClass = isError
    ? "text-red-500"
    : "text-green-500";

  return (
    <div className="max-w-xl mx-auto mt-10 mb-10 p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center ">
        Therapist Registration
      </h2>
      {registrationSuccess ? (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
          <p className="font-bold">Registration Successful!</p>
          <p>A verification link has been sent to <span className="font-semibold">{formData.email}</span>. Please check your inbox to verify your account.</p>
          <Link to="/login" className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Go to Login
          </Link>
        </div>
      ) : (
        <>
          {message && <p className={`mb-4 ${messageColorClass}`}>{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-gray-700 mb-1">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              required
            />

            <label className="block text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">A verification link will be sent to this email.</p>

            <label className="block text-gray-700 mb-1 mt-4">Password:</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
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
                value={formData.confirmPassword}
                onChange={handleChange}
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
              value={formData.contact}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            />

            <label className="block text-gray-700 mb-1">Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
            />

            <label className="block text-gray-700 mb-1">Qualification / Degree:</label>
            <input
              type="text"
              name="authDegree"
              value={formData.authDegree}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              required
            />

            <label className="block text-gray-700 mb-1">Years of Experience:</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none"
              min="0"
              required
            />

            <div className="block text-gray-700">
              <span className="block mb-2">Specialties:</span>
              <div className="grid grid-cols-2 gap-2">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="specialties"
                      value={specialty}
                      onChange={handleSpecialtyChange}
                      className="form-checkbox"
                    />
                    <span>{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="block text-gray-700">
              <label htmlFor="certifications" className="block mb-2">
                Upload Certifications (Images):
              </label>
              <input
                type="file"
                id="certifications"
                name="certifications"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {certificationFiles.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {certificationFiles.length} file(s) selected.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded font-medium text-white ${
                isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#88c6e4] hover:bg-[#5495b5] focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Registering...' : 'Register as Therapist'}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default RegisterTherapist;
