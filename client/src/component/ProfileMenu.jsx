
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ProfileMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showAllSpecialties, setShowAllSpecialties] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [childInfo, setChildInfo] = useState(null);
  const [parentOfChildInfo, setParentOfChildInfo] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loadingMenuData, setLoadingMenuData] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [fullUserData, setFullUserData] = useState(null);

  
  if (!user) {
    return null;
  }

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  
  const calculateCompletion = (record) => {
    if (!record.therapyModule?.exercises) return 0;
    const total = record.therapyModule.exercises.length;
    const completed = record.completedTasks.filter(t =>
      record.therapyModule.exercises.includes(t)
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  
  const getOverallStats = () => {
    if (progress.length === 0) return { totalModules: 0, completedModules: 0, inProgressModules: 0, averageCompletion: 0 };

    const totalModules = progress.length;
    const averageCompletion = totalModules > 0
      ? Math.round(progress.reduce((sum, record) => sum + calculateCompletion(record), 0) / totalModules)
      : 0;

    return { averageCompletion };
  };

  useEffect(() => {
    const fetchMenuData = async () => {
      setLoadingMenuData(true);
      setMenuError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setMenuError('Authentication token missing.');
          setLoadingMenuData(false);
          return;
        }

        
        const currentUserRes = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUserData = currentUserRes.data;
        setFullUserData(currentUserData);

        
        let targetChildId = null;
        if (currentUserData.role === 'parent' && currentUserData.children?.length > 0) {
          targetChildId = currentUserData.children[0];
        } else if (currentUserData.role === 'child') {
          targetChildId = currentUserData._id;
        }

        if (targetChildId) {
          
          const childRes = await axios.get(`http://localhost:5000/api/users/child/${targetChildId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setChildInfo(childRes.data);

          
          if (currentUserData.role === 'child') {
            const parentRes = await axios.get(`http://localhost:5000/api/users/parent-of-child/${currentUserData._id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setParentOfChildInfo(parentRes.data);
          }

          
          const progressRes = await axios.get(`http://localhost:5000/api/progress/${targetChildId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setProgress(progressRes.data);
        }

      } catch (err) {
        console.error("Error fetching menu data:", err);
        setMenuError(err.response?.data?.error || err.message || 'Failed to load menu data.');
      } finally {
        setLoadingMenuData(false);
      }
    };

    fetchMenuData();
  }, [user]);

  const { averageCompletion } = getOverallStats();

  
  const displayName = user.name || user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-gray-700 hover:scale-105 duration-150 focus:outline-none p-2 rounded-full bg-gray-100"
      >
        <div className="w-8 h-8 rounded-full bg-[#8ec1db] flex items-center justify-center text-white font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className='font-medium text-gray-800 hidden sm:block truncate max-w-32'>
          {user.name || user.email}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''} hidden sm:block`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 sm:w-60 bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden max-h-96 overflow-y-auto">
          {/* Header Section */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#8ec1db] to-[#a8d1e7] text-white">
            <p className="text-base font-semibold truncate ml-1">{user.name || user.email}</p>
            <div className="flex items-center space-x-2 mt-1">
              <div className="px-2 py-1 bg-white bg-opacity-20 text-gray-500 rounded-full text-xs font-medium">
                {user.role === 'parent' && 'Parent Account'}
                {user.role === 'child' && 'Child Account'}
                {user.role === 'therapist' && 'Therapist Account'}
                {user.role === 'admin' && 'Admin Account'}
              </div>
            </div>
          </div>
          
          {/* Loading/Error States */}
          {loadingMenuData && (
            <div className="px-4 py-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#8ec1db] mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading details...</p>
            </div>
          )}
          
          {menuError && (
            <div className="px-4 py-3 bg-red-50 border-l-4 border-red-400">
              <p className="text-sm text-red-700">{menuError}</p>
            </div>
          )}

          {!loadingMenuData && !menuError && (
            <div className="divide-y divide-gray-100">
              {/* Therapist Section */}
              {fullUserData && fullUserData.role === 'therapist' && (
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800">Specialties</h4>
                    {fullUserData.specialties && fullUserData.specialties.length > 0 && (
                      <span className="text-xs bg-[#8ec1db] text-white px-2 py-1 rounded-full">
                        {fullUserData.specialties.length}
                      </span>
                    )}
                  </div>
                  
                  {fullUserData.specialties && fullUserData.specialties.length > 0 ? (
                    <>
                      <ul className="space-y-1 mb-3">
                        {(showAllSpecialties ? fullUserData.specialties : fullUserData.specialties.slice(0, 3)).map((specialty, index) => (
                          <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-[#8ec1db] rounded-full"></div>
                            <span>{specialty}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {fullUserData.specialties.length > 3 && (
                        <button
                          onClick={() => setShowAllSpecialties(!showAllSpecialties)}
                          className="text-xs text-[#8ec1db] hover:underline mb-3 font-medium"
                        >
                          {showAllSpecialties ? 'Show Less' : `View All (${fullUserData.specialties.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mb-3">No specialties listed</p>
                  )}
                  
                  <Link
                    to="/create-therapy"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2 px-3 bg-[#8ec1db] hover:bg-[#7ab5d3] text-white text-center rounded-md transition-colors text-sm font-medium"
                  >
                    Create Module
                  </Link>
                </div>
              )}

              {/* Parent Section */}
              {user.role === 'parent' && childInfo && (
                <div className="px-4 py-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Child Information</h4>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium text-gray-800 truncate ml-2">
                        {childInfo.profile.name}
                      </span>
                    </div>
                    {childInfo.profile.disabilityType && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Disability:</span>
                        <span className="text-sm font-medium text-gray-800 truncate ml-2">
                          {childInfo.profile.disabilityType}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#8ec1db] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${averageCompletion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{averageCompletion}%</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/progress"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center rounded-md transition-colors text-sm font-medium"
                  >
                    View Progress Report
                  </Link>
                </div>
              )}

              {/* Child Section */}
              {user.role === 'child' && childInfo && parentOfChildInfo && (
                <div className="px-4 py-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">My Information</h4>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Parent:</span>
                      <span className="text-sm font-medium text-gray-800 truncate ml-2">
                        {parentOfChildInfo.profile.name}
                      </span>
                    </div>
                    {childInfo.profile.disabilityType && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Disability:</span>
                        <span className="text-sm font-medium text-gray-800 truncate ml-2">
                          {childInfo.profile.disabilityType}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progress:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#8ec1db] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${averageCompletion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{averageCompletion}%</span>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/progress"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center rounded-md transition-colors text-sm font-medium"
                  >
                    View My Progress
                  </Link>
                </div>
              )}

              {/* Admin Section */}
              {user.role === 'admin' && (
                <div className="px-4 py-3">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center rounded-md transition-colors text-sm font-medium"
                  >
                    Admin Dashboard
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {/* Logout Button */}
          <div className="border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="block w-full text-center px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;