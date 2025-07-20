import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock } from "lucide-react";
import { User } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { DeleteConfirmationModal } from "../component/DeleteConfirmationModal";

const AdminPanel = () => {
  const [pendingModules, setPendingModules] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingTherapists, setPendingTherapists] = useState([]);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("modules");
  const [expandedModule, setExpandedModule] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [adminInfo, setAdminInfo] = useState({ level: "", permissions: [] });

  const token = localStorage.getItem("token");

  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchPendingModules = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/pending-modules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingModules(res.data);
    } catch (error) {
      setMessage("Error fetching modules: " + error.response?.data?.error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUsers(res.data);
    } catch (error) {
      setMessage("Error fetching users: " + error.response?.data?.error);
    }
  };

  const fetchPendingTherapists = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/pending-therapists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingTherapists(res.data);
    } catch (error) {
      setMessage(
        "Error fetching pending therapists: " + error.response?.data?.error
      );
    }
  };

  const permissionLabels = {
    canDeleteUsers: "Delete users",
    canModifyUsers: "Modify user data",
    canApproveTherapists: "Approve therapist applications",
    canManageModules: "Manage therapy modules",
  };

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdminInfo(res.data);
      } catch (err) {
        handleActionError(err);
      }
    };
    fetchAdminInfo();
  }, []);

  const granted = Object.entries(adminInfo.permissions || {})
    .filter(([, allowed]) => allowed)
    .map(([key]) => permissionLabels[key]);

  const handleActionError = (error) => {
    if (error.response?.status === 403) {
      alert("You don't have permission to perform this action");
    } else {
      setMessage(error.response?.data?.error || "An error occurred");
    }
  };

  const approveModule = async (moduleId) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/approve/${moduleId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(`Module "${res.data.title}" approved.`);
      fetchPendingModules();
    } catch (error) {
      handleActionError(error);
    }
  };

  const disapproveModule = async (moduleId) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/reject-module/${moduleId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Module disapproved successfully.");
      fetchPendingModules();
    } catch (error) {
      handleActionError(error);
    }
  };

  const approveTherapist = async (therapistId) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/approve-therapist/${therapistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Therapist approved successfully.");
      fetchPendingTherapists();
    } catch (error) {
      handleActionError(error);
    }
  };

  const rejectTherapist = async (therapistId) => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/admin/reject-therapist/${therapistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Therapist rejected.");
      fetchPendingTherapists();
    } catch (error) {
      handleActionError(error);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/admin/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      handleActionError(error);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete._id || userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    fetchPendingModules();
    fetchUsers();
    fetchPendingTherapists();
  }, []);

  const tabs = [
    { id: "modules", label: "Therapy Modules", count: pendingModules.length },
    {
      id: "therapists",
      label: "Therapist Applications",
      count: pendingTherapists.length,
    },
    { id: "users", label: "User Management", count: users.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Control Panel
          </h1>
          <p className="text-gray-600">Manage your platform efficiently</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-white shadow-md border-l-4 border-blue-400">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] mr-3"></div>
              <p className="text-gray-800 font-medium">{message}</p>
              <button
                onClick={() => setMessage("")}
                className="ml-auto text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.id
                      ? "bg-white bg-opacity-30 text-gray-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Pending Therapy Modules */}
          {activeTab === "modules" && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 p-2 rounded-full flex items-center bg-[#db8ec1] mr-4">
                  <Clock className="text-white " />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Pending Therapy Modules
                </h2>
              </div>

              {pendingModules.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] opacity-20"></div>
                  <p className="text-gray-500 text-lg">
                    No pending modules to review
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingModules.map((module) => (
                    <div
                      key={module._id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2">
                            {module.title}
                          </h3>
                          <p className="text-gray-600 leading-relaxed mb-2">
                            {module.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>Created by:</span>
                            <span className="ml-1 font-medium text-gray-700">
                              {module.createdBy?.name ||
                                module.createdBy?.email ||
                                "Unknown Therapist"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() =>
                              setExpandedModule(
                                expandedModule === module._id
                                  ? null
                                  : module._id
                              )
                            }
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                          >
                            {expandedModule === module._id
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                          <button
                            onClick={() => disapproveModule(module._id)}
                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            ✗ Disapprove
                          </button>
                          <button
                            onClick={() => approveModule(module._id)}
                            className="px-6 py-2 bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            ✓ Approve
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedModule === module._id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Module Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Category:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {module.category}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Difficulty:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      module.difficultyLevel === "Beginner"
                                        ? "bg-green-100 text-green-800"
                                        : module.difficultyLevel ===
                                          "Intermediate"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {module.difficultyLevel}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Estimated Time:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {module.estimatedTimeMinutes} min
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">
                                    Created:
                                  </span>
                                  <span className="font-medium text-gray-800">
                                    {new Date(
                                      module.createdAt
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Additional Details
                              </h4>
                              <div className="space-y-2 text-sm">
                                {module.videoLink && (
                                  <div>
                                    <span className="text-gray-600">
                                      Video Link:
                                    </span>
                                    <a
                                      href={module.videoLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                                    >
                                      View Video
                                    </a>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-600">
                                    Assigned To:
                                  </span>
                                  <span className="ml-2 font-medium text-gray-800">
                                    {module.assignedTo?.length || 0} children
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Exercises Section */}
                          {module.exercises && module.exercises.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Exercises
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <ul className="space-y-1">
                                  {module.exercises.map((exercise, index) => (
                                    <li
                                      key={index}
                                      className="text-sm text-gray-700"
                                    >
                                      • {exercise}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Therapist Applications */}
          {activeTab === "therapists" && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-[#db8ec1] mr-4 flex items-center p-2">
                  <GraduationCap className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Therapist Applications
                </h2>
              </div>

              {pendingTherapists.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] opacity-20"></div>
                  <p className="text-gray-500 text-lg">
                    No pending therapist applications
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {pendingTherapists.map((therapist) => (
                    <div
                      key={therapist._id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="grid md:grid-cols-2 gap-4 mb-2 pb-2 border-b-3 border-gray-300 ">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700">
                              Name:
                            </span>
                            <span className="ml-2 text-gray-800">
                              {therapist.profile?.name}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700">
                              Email:
                            </span>
                            <span className="ml-2 text-gray-800">
                              {therapist.email}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700">
                              Contact:
                            </span>
                            <span className="ml-2 text-gray-800">
                              {therapist.profile?.contact}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700">
                              Address:
                            </span>
                            <span className="ml-2 text-gray-800">
                              {therapist.profile?.address}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                          <span className="font-semibold text-gray-700">
                            Credentials:
                          </span>
                        </div>
                        <div className="grid grid-cols-2 grid-flow-row">
                          <div className="">
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-semibold text-gray-700">
                                Degree:
                              </p>
                            </div>
                            <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg">
                              {therapist.qualifications?.degree || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-semibold text-gray-700">
                                Years of experience
                              </p>
                            </div>
                            <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg">
                              {therapist.qualifications.yearsOfExperience}
                            </p>
                          </div>
                          {/* Render Specialties */}
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-medium text-gray-700">
                                Specialties:
                              </p>
                            </div>
                            {therapist.specialties &&
                            therapist.specialties.length > 0 ? (
                              <ul className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg list-disc list-inside">
                                {therapist.specialties.map((specialty, idx) => (
                                  <li key={idx}>{specialty}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg">
                                N/A
                              </p>
                            )}
                          </div>
                          {/* Render Certifications (Images) */}
                          <div className="md:col-span-2 mt-2">
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-medium text-gray-700 mb-2">
                                Certifications:
                              </p>
                            </div>
                            {therapist.qualifications?.certifications &&
                            therapist.qualifications.certifications.length >
                              0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg">
                                {therapist.qualifications.certifications.map(
                                  (certUrl, idx) => (
                                    <a
                                      key={idx}
                                      href={certUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="relative group overflow-hidden rounded-md shadow-sm block"
                                    >
                                      <img
                                        src={certUrl}
                                        alt={`Certification ${idx + 1}`}
                                        className="w-full h-42 object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `https://placehold.co/100x75/cccccc/333333?text=Cert+Img`;
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white text-xs font-medium">
                                          View
                                        </span>
                                      </div>
                                    </a>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="ml-5 text-gray-800 bg-gray-50 p-3 rounded-lg">
                                No certifications provided.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveTherapist(therapist._id)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          ✓ Approve Application
                        </button>
                        <button
                          onClick={() => rejectTherapist(therapist._id)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          ✗ Reject Application
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User Management */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-[#db8ec1] mr-4 p-2 flex items-center">
                  <User className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  User Management
                </h2>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] opacity-20"></div>
                  <p className="text-gray-500 text-lg">No users found</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] flex items-center justify-center text-white font-bold text-lg">
                            {(user.profile?.name || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {user.profile?.name || "Unnamed User"}
                            </h3>
                            <p className="text-gray-600">{user.email}</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "therapist"
                                  ? "bg-blue-100 text-blue-800"
                                  : user.role === "parent"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setExpandedUser(
                                expandedUser === user._id ? null : user._id
                              )
                            }
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
                          >
                            {expandedUser === user._id
                              ? "Hide Details"
                              : "View Details"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="px-6 py-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>

                      {/* Expanded User Details */}
                      {expandedUser === user._id && (
                        <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-3">
                                Basic Information
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span className="font-medium text-gray-800">
                                    {user.profile?.name || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Email:</span>
                                  <span className="font-medium text-gray-800">
                                    {user.email || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Role:</span>
                                  <span className="font-medium text-gray-800 capitalize">
                                    {user.role}
                                  </span>
                                </div>
                                {user.profile?.contact && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Contact:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {user.profile.contact}
                                    </span>
                                  </div>
                                )}
                                {user.profile?.address && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Address:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                      {user.profile.address}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Role-specific Information */}
                            <div>
                              {/* Child-specific details */}
                              {user.role === "child" && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    Child Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {user.profile?.disabilityType && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Disability Type:
                                        </span>
                                        <span className="font-medium text-gray-800">
                                          {user.profile.disabilityType}
                                        </span>
                                      </div>
                                    )}
                                    {user.profile?.additionalInfo && (
                                      <div className="mt-2">
                                        <span className="text-gray-600">
                                          Additional Info:
                                        </span>
                                        <p className="mt-1 text-gray-800 text-xs bg-gray-50 p-2 rounded">
                                          {user.profile.additionalInfo}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Parent-specific details */}
                              {user.role === "parent" && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    Parent Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Children Count:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {user.children?.length || 0}
                                      </span>
                                    </div>
                                    {user.profile?.additionalInfo && (
                                      <div className="mt-2">
                                        <span className="text-gray-600">
                                          Additional Info:
                                        </span>
                                        <p className="mt-1 text-gray-800 text-xs bg-gray-50 p-2 rounded">
                                          {user.profile.additionalInfo}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Therapist-specific details */}
                              {user.role === "therapist" && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    Therapist Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Status:
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          user.therapistApplicationStatus ===
                                          "approved"
                                            ? "bg-green-100 text-green-800"
                                            : user.therapistApplicationStatus ===
                                              "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : user.therapistApplicationStatus ===
                                              "rejected"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {user.therapistApplicationStatus ||
                                          "Not Set"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Degree:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {user.qualifications?.degree || "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Experience:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {user.qualifications?.yearsOfExperience
                                          ? `${user.qualifications.yearsOfExperience} years`
                                          : "N/A"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Specialties:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {user.specialties?.length
                                          ? `${user.specialties.length} specialties`
                                          : "None"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Certifications:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {user.qualifications?.certifications
                                          ?.length
                                          ? `${user.qualifications.certifications.length} certs`
                                          : "None"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Admin-specific details */}
                              {user.role === "admin" && (
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3">
                                    Admin Details
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">
                                        Admin Level:
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {adminInfo.level || "N/A"}
                                      </span>
                                    </div>

                                    {/* only show if there’s at least one granted permission */}
                                    {granted.length > 0 ? (
                                      <div className="mt-4">
                                        <span className="text-gray-600 block mb-1">
                                          Permissions:
                                        </span>
                                        <ul className="list-disc list-inside space-y-1">
                                          {granted.map((label) => (
                                            <li
                                              key={label}
                                              className="font-medium text-gray-800"
                                            >
                                              • Permitted to{" "}
                                              {label.toLowerCase()}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ) : (
                                      <div className="mt-4">
                                        <span className="text-gray-600">
                                          Permissions:
                                        </span>
                                        <span className="font-medium text-gray-800">
                                          No permissions granted
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Children Details for Parents */}
                          {user.role === "parent" &&
                            user.children &&
                            user.children.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                  Children
                                </h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <div className="grid gap-3">
                                    {user.children.map((child, index) => (
                                      <div
                                        key={child._id || index}
                                        className="bg-white rounded-lg p-3 shadow-sm"
                                      >
                                        <div className="flex items-center space-x-3">
                                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                                            {(
                                              child.profile?.name ||
                                              child.email ||
                                              `Child ${index + 1}`
                                            )
                                              .charAt(0)
                                              .toUpperCase()}
                                          </div>
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-800">
                                              {child.profile?.name ||
                                                `Child ${index + 1}`}
                                            </p>
                                            {child.profile?.disabilityType && (
                                              <p className="text-xs text-gray-600">
                                                Disability:{" "}
                                                {child.profile.disabilityType}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Specialties for Therapists */}
                          {user.role === "therapist" &&
                            user.specialties &&
                            user.specialties.length > 0 && (
                              <div className="mt-6">
                                <h4 className="font-semibold text-gray-800 mb-3">
                                  Specialties
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {user.specialties.map((specialty, index) => (
                                    <span
                                      key={index}
                                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Render Certifications (Images) */}
                          <div className="md:col-span-2 mt-2">
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-medium text-gray-700 mb-2">
                                Certifications:
                              </p>
                            </div>
                            {user.qualifications?.certifications &&
                            user.qualifications.certifications.length > 0 ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-gray-50 p-3 rounded-lg">
                                {user.qualifications.certifications.map(
                                  (certUrl, idx) => (
                                    <div
                                      key={idx}
                                      className="relative group overflow-hidden rounded-md shadow-sm cursor-pointer"
                                      onClick={() => {
                                        setViewingImage(certUrl);
                                      }}
                                    >
                                      <img
                                        src={certUrl}
                                        alt={`Certification ${idx + 1}`}
                                        className="w-full h-42 object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src = `https://placehold.co/100x75/cccccc/333333?text=Cert+Img`;
                                        }}
                                      />
                                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-white text-xs font-medium">
                                          View
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <p className="ml-5 text-gray-800 bg-gray-50 p-3 rounded-lg">
                                No certifications provided.
                              </p>
                            )}
                          </div>

                          {/* Image Modal */}
                          {viewingImage && (
                            <div
                              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                              onClick={() => setViewingImage(null)}
                            >
                              <div className="relative max-w-4xl max-h-screen p-4">
                                <img
                                  src={viewingImage}
                                  alt="Certification"
                                  className="max-w-full max-h-full object-contain rounded-lg"
                                />
                                <button
                                  onClick={() => setViewingImage(null)}
                                  className="absolute top-2 right-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-red-600 rounded-full p-2 transition-all"
                                >
                                  <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        userName={
          userToDelete?.profile.name ||
          userToDelete?.firstName + " " + userToDelete?.lastName
        }
        email={userToDelete?.email}
        userRole={userToDelete?.role}
      />
    </div>
  );
};

export default AdminPanel;
