
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ModuleDetail = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  
  const [userRole, setUserRole] = useState('');
  const [childrenList, setChildrenList] = useState([]); 
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    const fetchModuleAndProgress = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

      
        const moduleRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/therapy/${moduleId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModule(moduleRes.data);

       
        const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const currentUser = userRes.data;
        setUserRole(currentUser.role);

       
        if (
          currentUser.role === 'parent' &&
          Array.isArray(currentUser.children) &&
          currentUser.children.length > 0
        ) {
          const normalized = currentUser.children
            .map((childItem) => {
              if (typeof childItem === 'string') {
                return {
                  id: childItem,
                  name: 'Child'
                };
              } else if (childItem && typeof childItem === 'object') {
                return {
                  id: childItem._id,
                  name:
                    childItem.profile?.name?.trim().length > 0
                      ? childItem.profile.name
                      : 'Child'
                };
              } else {
                return null;
              }
            })
            .filter(Boolean);

          setChildrenList(normalized);

          const firstChildId = normalized[0].id;
          setSelectedChild(firstChildId);

          const progressRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/progress/${firstChildId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const moduleProgress = progressRes.data.find(
            (p) => p.therapyModule._id === moduleId
          );
          if (moduleProgress) {
            setProgress(moduleProgress);
          }
        }
        
        else if (currentUser.role === 'child') {
          const ownChildId = currentUser._id;
          setSelectedChild(ownChildId);

          const progressRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/progress/${ownChildId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const moduleProgress = progressRes.data.find(
            (p) => p.therapyModule._id === moduleId
          );
          if (moduleProgress) {
            setProgress(moduleProgress);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.error || 'Failed to load module data');
        setLoading(false);
      }
    };

    fetchModuleAndProgress();
  }, [moduleId]);

  
  const handleStartModule = async () => {
    if (userRole === 'parent') return;

    try {
      const token = localStorage.getItem('token');
      if (!selectedChild) {
        setStatusMessage('Failed! You are not a patient');
        return;
      }

      const taskLog = {
        task: 'Started module',
        details: 'Module activities initiated'
      };
      const progressData = {
        child: selectedChild,
        therapyModule: moduleId,
        taskLog
      };

      if (progress && Array.isArray(progress.completedTasks)) {
        
        progressData.completedTasks = progress.completedTasks;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/progress`,
        progressData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data);
      setStatusMessage('Module started successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error starting module:', err);
      setStatusMessage(
        'Failed to start module: ' +
          (err.response?.data?.error || err.message)
      );
    }
  };

  
  const handleCompleteModule = async () => {
    if (userRole === 'parent') return; 

    try {
      const token = localStorage.getItem('token');
      if (!progress) {
        setStatusMessage('You need to start the module first');
        return;
      }

      
      const completedTasks = module.exercises.map((ex) => {
        if (typeof ex === 'object') return ex.name;
        return ex;
      });
      const taskLog = {
        task: 'Completed module',
        details: 'All activities marked as completed'
      };

      const progressData = {
        child: selectedChild,
        therapyModule: moduleId,
        completedTasks,
        taskLog
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/progress`,
        progressData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data);
      setStatusMessage('Module marked as completed!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      console.error('Error completing module:', err);
      setStatusMessage(
        'Failed to complete module: ' +
          (err.response?.data?.error || err.message)
      );
    }
  };

 
  const handleToggleExercise = async (exerciseName) => {
    if (userRole === 'parent') return; 
    if (!module) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setStatusMessage('Authentication required');
      return;
    }

    
    if (!progress) {
    
      await handleStartModule();
     
    }

    
    const alreadyCompleted = Array.isArray(progress.completedTasks)
      ? [...progress.completedTasks]
      : [];

    let updatedTasks;
    let taskLog;

    if (alreadyCompleted.includes(exerciseName)) {
    
      updatedTasks = alreadyCompleted.filter((e) => e !== exerciseName);
      taskLog = {
        task: 'Unchecked exercise',
        details: `Uncompleted: ${exerciseName}`
      };
    } else {
     
      updatedTasks = [...alreadyCompleted, exerciseName];
      taskLog = {
        task: 'Checked exercise',
        details: `Completed: ${exerciseName}`
      };
    }

    try {
      const progressData = {
        child: selectedChild,
        therapyModule: moduleId,
        completedTasks: updatedTasks,
        taskLog
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/progress`,
        progressData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProgress(response.data);
      setStatusMessage('');
    } catch (err) {
      console.error('Error toggling exercise:', err);
      setStatusMessage(
        'Failed to update exercise: ' +
          (err.response?.data?.error || err.message)
      );
    }
  };

 
  const calculateCompletion = () => {
    if (!progress || !module) return 0;
    const totalTasks = module.exercises.length;
    if (totalTasks === 0) return 0;
    return Math.round((progress.completedTasks.length / totalTasks) * 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className='w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto'></div>
        <p>Loading module details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>
        <button
          onClick={() => navigate('/therapy-modules')}
          className="text-black hover:opacity-70"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
          Module not found
        </div>
        <button
          onClick={() => navigate('/therapy-modules')}
          className="text-black hover:opacity-70"
        >
          Back to Modules
        </button>
      </div>
    );
  }

  const completionPercentage = calculateCompletion();
  const moduleStatus =
    completionPercentage === 100
      ? 'Completed'
      : progress
      ? 'In Progress'
      : 'Not Started';

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate('/therapy-modules')}
        className="text-black hover:opacity-70 mb-6 flex items-center"
      >
        ← Back to Modules
      </button>

      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        {/* Module Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-[#5495b5]">{module.title}</h1>
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 text-sm text-gray-600">
            <span>Category: {module.category}</span>
            <span>Difficulty: {module.difficultyLevel}</span>
            <span>Duration: {module.estimatedTimeMinutes} minutes</span>
            {module.createdBy && (
              <span>Created by: {module.createdBy.profile?.name || 'Therapist'}</span>
            )}
          </div>
        </div>

        {/* Video Player  */}
        {module.videoLink && (
          <div className="border-b">
            <div className="aspect-w-16 aspect-h-9">
              <iframe
                src={
                  module.videoLink.includes('youtube.com')
                    ? module.videoLink.replace('watch?v=', 'embed/')
                    : module.videoLink
                }
                title={module.title}
                className="w-full h-96"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Module Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">
              {module.description || 'No description provided.'}
            </p>
          </div>

          {/* Exercises (now with checkboxes) */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Activities & Exercises</h2>
            {module.exercises.length > 0 ? (
              <ul className="space-y-2">
                {module.exercises.map((exercise, index) => {
                  
                  const exerciseName =
                    typeof exercise === 'object' ? exercise.name : exercise;
                  const isChecked =
                    progress?.completedTasks?.includes(exerciseName) || false;

                  return (
                    <li
                      key={index}
                      className="flex items-center text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={userRole === 'parent'}
                        onChange={() => handleToggleExercise(exerciseName)}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        className={`ml-3 ${
                          isChecked ? 'line-through text-green-600' : ''
                        }`}
                      >
                        {exerciseName}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 italic">
                No exercises specified for this module.
              </p>
            )}
          </div>

          {/* Status & Progress */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Module Progress</h3>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  moduleStatus === 'Completed'
                    ? 'bg-green-100 text-green-800'
                    : moduleStatus === 'In Progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {moduleStatus}
              </span>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="text-right text-xs text-gray-500 mt-1">
                {completionPercentage}% complete
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleStartModule}
              className={`px-4 py-2 rounded-md font-medium ${
                moduleStatus === 'Completed'
                  ? 'bg-gray-100 text-gray-600'
                  : 'bg-[#5495b5] text-white hover:opacity-80'
              } ${userRole === 'parent' || userRole === 'admin'|| userRole === 'therapist' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={moduleStatus === 'Completed' }
            >
              {moduleStatus === 'In Progress' ? 'Resume Module' : 'Start Module' }
            </button>

            {moduleStatus === 'In Progress' && userRole !== 'parent' && (
              <button
                onClick={handleCompleteModule}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
              >
                Mark as Completed
              </button>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-md ${
                statusMessage.includes('Failed')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;
