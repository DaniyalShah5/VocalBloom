
import React, { useState } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Video,
  Clock,
  Target,
  FileText,
  Tag,
  Zap,
  CheckCircle,
  AlertCircle,
  Save,
  Play,
  Brain,
  Users,
  Settings,
  PlusCircle,
  XCircle
} from 'lucide-react';

const CreateTherapyModule = () => {
  
  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    videoLink: '',
    exercises: [],           
    category: '',
    difficultyLevel: 'Beginner',
    estimatedTimeMinutes: 30
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'Articulation Disorders', icon: '🗣️', color: 'bg-red-100 text-red-800' },
    { value: 'Language Delays', icon: '💬', color: 'bg-blue-100 text-blue-800' },
    { value: 'Stuttering', icon: '🔄', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Voice Disorders', icon: '🎵', color: 'bg-purple-100 text-purple-800' },
    { value: 'Apraxia of Speech', icon: '🧠', color: 'bg-green-100 text-green-800' },
    { value: 'Aphasia', icon: '💭', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'Autism Spectrum Disorders', icon: '🌈', color: 'bg-pink-100 text-pink-800' },
    { value: 'Swallowing Disorders', icon: '🥤', color: 'bg-teal-100 text-teal-800' },
    { value: 'Hearing Impairments', icon: '👂', color: 'bg-orange-100 text-orange-800' }
  ];

  const difficultyLevels = [
    { value: 'Beginner', icon: '🌱', color: 'text-green-600' },
    { value: 'Intermediate', icon: '🌿', color: 'text-yellow-600' },
    { value: 'Advanced', icon: '🌳', color: 'text-red-600' }
  ];


  const handleChange = (e) => {
    setModuleData({ ...moduleData, [e.target.name]: e.target.value });
  };


  const handleExerciseChange = (index, newValue) => {
    const updated = [...moduleData.exercises];
    updated[index] = newValue;
    setModuleData({ ...moduleData, exercises: updated });
  };

 
  const addExerciseField = () => {
    setModuleData({ ...moduleData, exercises: [...moduleData.exercises, ''] });
  };


  const removeExerciseField = (index) => {
    const updated = moduleData.exercises.filter((_, i) => i !== index);
    setModuleData({ ...moduleData, exercises: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      
      if (!moduleData.title || !moduleData.category) {
        setMessage('Title and category are required!');
        setMessageType('error');
        setIsSubmitting(false);
        return;
      }

    
      const exercisesArray = moduleData.exercises
        .map((ex) => ex.trim())
        .filter((ex) => ex.length > 0);

      const dataToSend = {
        ...moduleData,
        exercises: exercisesArray,                        
        estimatedTimeMinutes: parseInt(moduleData.estimatedTimeMinutes),
      };

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/therapy', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage('Therapy module submitted! Awaiting admin approval.');
      setMessageType('success');

     
      setModuleData({
        title: '',
        description: '',
        videoLink: '',
        exercises: [],
        category: '',
        difficultyLevel: 'Beginner',
        estimatedTimeMinutes: 30
      });
    } catch (error) {
      setMessage('Error: An error occurred while creating the module');
      setMessageType('error');
      setIsSubmitting(false);
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const selectedCategory = categories.find(cat => cat.value === moduleData.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Therapy Module
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Design personalized therapy modules to help patients achieve their communication goals
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-xl border-l-4 flex items-center shadow-sm ${
              messageType === 'success'
                ? 'bg-green-50 border-green-500 text-green-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
            )}
            <p className="font-medium text-lg">{message}</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-l from-[#8ec1db] to-[#db8ec1] px-8 py-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Settings className="w-6 h-6 mr-3" />
              Module Configuration
            </h2>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Module Title */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
                    Module Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={moduleData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Enter a descriptive title for your module"
                    required
                  />
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Tag className="w-4 h-4 mr-2 text-indigo-500" />
                    Category *
                  </label>
                  <select
                    name="category"
                    value={moduleData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.value}
                      </option>
                    ))}
                  </select>
                  {selectedCategory && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${selectedCategory.color}`}>
                        <span className="mr-2">{selectedCategory.icon}</span>
                        {selectedCategory.value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Target className="w-4 h-4 mr-2 text-indigo-500" />
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {difficultyLevels.map(level => (
                      <label key={level.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="difficultyLevel"
                          value={level.value}
                          checked={moduleData.difficultyLevel === level.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div
                          className={`p-3 rounded-lg border-2 text-center transition-all duration-200 ${
                            moduleData.difficultyLevel === level.value
                              ? getDifficultyColor(level.value) + ' border-current'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-sm font-medium">{level.value}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Estimated Time */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                    Estimated Time (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="estimatedTimeMinutes"
                      value={moduleData.estimatedTimeMinutes}
                      onChange={handleChange}
                      min="5"
                      max="180"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Recommended: 15-60 minutes per session</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                    Module Description
                  </label>
                  <textarea
                    name="description"
                    value={moduleData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Describe the goals, methods, and expected outcomes of this therapy module..."
                  />
                </div>

                {/* Video Link */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Video className="w-4 h-4 mr-2 text-indigo-500" />
                    Video Resource Link
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="videoLink"
                      value={moduleData.videoLink}
                      onChange={handleChange}
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Play className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">YouTube, Vimeo, or other video platform links</p>
                </div>

                {/* Exercises  */}
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Zap className="w-4 h-4 mr-2 text-indigo-500" />
                    Exercise Activities
                  </label>
                  
                  {moduleData.exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={ex}
                        onChange={(e) => handleExerciseChange(idx, e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                        placeholder={`Exercise #${idx + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeExerciseField(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  ))}

                  
                  <button
                    type="button"
                    onClick={addExerciseField}
                    className="inline-flex items-center px-4 py-2 mt-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all duration-200"
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Add Exercise
                  </button>

                  <p className="text-sm text-gray-500">Click “Add Exercise” to create a new field; leave blank fields empty.</p>
                </div>
              </div>
            </div>

           
            {(moduleData.title || moduleData.category) && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Module Preview
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {moduleData.title && (
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">Title:</span>
                      <span className="ml-2 text-gray-700">{moduleData.title}</span>
                    </div>
                  )}
                  {moduleData.category && (
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="font-medium">Category:</span>
                      <span className="ml-2 text-gray-700">{moduleData.category}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Level:</span>
                    <span className="ml-2 text-gray-700">{moduleData.difficultyLevel}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">Duration:</span>
                    <span className="ml-2 text-gray-700">{moduleData.estimatedTimeMinutes} minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !moduleData.title || !moduleData.category}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg flex items-center shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Creating Module...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-5 h-5 mr-3" />
                    Create Module
                  </div>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            Creating effective therapy modules helps patients achieve better outcomes and progress tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateTherapyModule;
