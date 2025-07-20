import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, User, GraduationCap } from "lucide-react";
import { DeleteConfirmationModal } from '../component/DeleteConfirmationModal';
import { useAuth } from '../context/AuthContext';

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
  const [adminPermissions, setAdminPermissions] = useState({});

  const token = localStorage.getItem("token");
  const { user } = useAuth();

  const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchAdminDetails = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminPermissions(res.data.user.permissions || {});
    } catch (error) {
      console.error("Error fetching admin permissions:", error);
      setMessage("Error fetching admin permissions. Some features might be restricted.");
      setAdminPermissions({}); 
    }
  };


  const fetchPendingModules = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/admin/pending-modules`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingModules(res.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to view pending modules.");
      } else {
        setMessage("Error fetching modules: " + error.response?.data?.error);
      }
    }
  };


  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to view users.");
      } else {
        setMessage("Error fetching users: " + error.response?.data?.error);
      }
    }
  };

  
  const fetchPendingTherapists = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_BASE_URL}/api/admin/pending-therapists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingTherapists(res.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to view pending therapists.");
      } else {
        setMessage(
          "Error fetching pending therapists: " + error.response?.data?.error
        );
      }
    }
  };

  
  const approveModule = async (moduleId) => {
    try {
      const res = await axios.put(
        `${BACKEND_BASE_URL}/api/admin/approve/${moduleId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(`Module "${res.data.title}" approved.`);
      fetchPendingModules();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to approve modules.");
      } else {
        setMessage("Error approving module: " + error.response?.data?.error);
      }
    }
  };

  const disapproveModule = async (moduleId) => {
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/admin/reject-module/${moduleId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Module disapproved successfully.");
      fetchPendingModules(); 
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to disapprove modules.");
      } else {
        setMessage("Error disapproving module: " + error.response?.data?.error);
      }
    }
  };

 
  const approveTherapist = async (therapistId) => {
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/admin/approve-therapist/${therapistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Therapist approved successfully.");
      fetchPendingTherapists();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to approve therapists.");
      } else {
        setMessage("Error approving therapist: " + error.response?.data?.error);
      }
    }
  };


  const rejectTherapist = async (therapistId) => {
    try {
      await axios.put(
        `${BACKEND_BASE_URL}/api/admin/reject-therapist/${therapistId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Therapist rejected.");
      fetchPendingTherapists();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to reject therapists.");
      } else {
        setMessage("Error rejecting therapist: " + error.response?.data?.error);
      }
    }
  };

  
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setMessage("Access denied: You don't have permission to delete users.");
      } else {
        setMessage("Error deleting user: " + error.response?.data?.error);
      }
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
    fetchAdminDetails();
    fetchPendingModules();
    fetchUsers();
    fetchPendingTherapists();
  }, []);

  const tabs = [
    adminPermissions.canManageModules && { id: "modules", label: "Therapy Modules", count: pendingModules.length },
    adminPermissions.canApproveTherapists && {
      id: "therapists",
      label: "Therapist Applications",
      count: pendingTherapists.length,
    },
    (adminPermissions.canModifyUsers || adminPermissions.canDeleteUsers) && { id: "users", label: "User Management", count: users.length },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Control Panel
          </h1>
          <p className="text-gray-600">Manage your platform efficiently</p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {activeTab === "modules" && adminPermissions.canManageModules && (
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
                          {adminPermissions.canManageModules && (
                            <>
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
                            </>
                          )}
                        </div>
                      </div>

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

                          {module.exercises && module.exercises.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Exercises
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <ul className="space-y-1">
                                  {module.exercises.map((exercise, index) => (
                                    <li key={index} className="text-sm text-gray-700" >
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

          {activeTab === "therapists" && adminPermissions.canApproveTherapists && (
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
                    <div key={therapist._id} className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300" >
                      <div className="grid md:grid-cols-2 gap-4 mb-2 pb-2 border-b-3 border-gray-300 ">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700"> Name: </span>
                            <span className="ml-2 text-gray-800"> {therapist.profile?.name} </span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700"> Email: </span>
                            <span className="ml-2 text-gray-800"> {therapist.email} </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700"> Contact: </span>
                            <span className="ml-2 text-gray-800"> {therapist.profile?.contact} </span>
                          </div>
                          <div className="flex items-center">
                            <span className="w-2 h-2 rounded-full bg-[#db8ec1] mr-3"></span>
                            <span className="font-semibold text-gray-700"> Address: </span>
                            <span className="ml-2 text-gray-800"> {therapist.profile?.address} </span>
                          </div>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                          <span className="font-semibold text-gray-700"> Credentials: </span>
                        </div>
                        <div className="grid grid-cols-2 grid-flow-row">
                          <div className="">
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-semibold text-gray-700"> Degree: </p>
                            </div>
                            <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg">
                              {therapist.qualifications?.degree || "N/A"}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-semibold text-gray-700"> Years of experience </p>
                            </div>
                            <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg">
                              {therapist.qualifications.yearsOfExperience}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="w-2 h-2 rounded-full bg-[#8ec1db] mr-3"></span>
                              <p className="font-medium text-gray-700"> Specialties: </p>
                            </div>
                            {therapist.specialties && therapist.specialties.length > 0 ? (
                              <ul className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg list-disc list-inside">
                                {therapist.specialties.map((specialty, idx) => (
                                  <li key={idx}>{specialty}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="ml-5 text-gray-800 bg-gray-100 p-3 rounded-lg"> N/A </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {therapist.qualifications?.certifications && therapist.qualifications.certifications.length > 0 && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="font-semibold text-gray-800 mb-2">Certifications</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {therapist.qualifications.certifications.map((certUrl, index) => (
                              <div key={index} className="relative group overflow-hidden rounded-lg shadow-md">
                                <img
                                  src={certUrl}
                                  alt={`Certification ${index + 1}`}
                                  className="w-full h-32 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                  onClick={() => setViewingImage(certUrl)}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <button
                                    onClick={() => setViewingImage(certUrl)}
                                    className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md text-sm"
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {adminPermissions.canApproveTherapists && (
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => rejectTherapist(therapist._id)}
                            className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            ✗ Reject
                          </button>
                          <button
                            onClick={() => approveTherapist(therapist._id)}
                            className="px-6 py-2 bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                          >
                            ✓ Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "users" && (adminPermissions.canModifyUsers || adminPermissions.canDeleteUsers) && (
            <div>
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-[#db8ec1] mr-4 flex items-center p-2">
                  <User className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  User Management
                </h2>
              </div>
              {users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] opacity-20"></div>
                  <p className="text-gray-500 text-lg">No users to manage</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {user.profile?.name || user.email}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Email: {user.email}
                          </p>
                          <p className="text-gray-600 text-sm">
                            Role:{" "}
                            <span
                              className={`font-semibold ${
                                user.role === "admin"
                                  ? "text-purple-600"
                                  : user.role === "therapist"
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </p>
                        </div>
                        <div className="ml-4 flex gap-2">
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
                          {adminPermissions.canDeleteUsers && (
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      {expandedUser === user._id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
                          {user.role === 'parent' && user.children && user.children.length > 0 && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-800 mb-2">Children</h4>
                              <ul className="list-disc list-inside text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {user.children.map(child => (
                                  <li key={child._id}>{child.profile?.name} ({child.profile?.disabilityType || 'N/A'})</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {user.role === 'therapist' && (
                            <div className="mb-4">
                              <h4 className="font-semibold text-gray-800 mb-2">Therapist Details</h4>
                              <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <p><strong>Degree:</strong> {user.qualifications?.degree || 'N/A'}</p>
                                <p><strong>Experience:</strong> {user.qualifications?.yearsOfExperience || 0} years</p>
                                <p><strong>Specialties:</strong> {user.specialties?.join(', ') || 'N/A'}</p>
                                {user.qualifications?.certifications && user.qualifications.certifications.length > 0 && (
                                  <div>
                                    <h5 className="font-medium mt-2">Certifications:</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-1">
                                      {user.qualifications.certifications.map((certUrl, idx) => (
                                        <img key={idx} src={certUrl} alt={`Cert ${idx + 1}`} className="w-full h-24 object-cover rounded cursor-pointer" onClick={() => setViewingImage(certUrl)} />
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>Contact:</strong> {user.profile?.contact || 'N/A'}</p>
                            <p><strong>Address:</strong> {user.profile?.address || 'N/A'}</p>
                            <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>Verified Email:</strong> {user.isVerified ? 'Yes' : 'No'}</p>
                            {user.isVerified === false && user.verificationTokenExpires && (
                                <p className="text-red-500">
                                  Email verification expires: {new Date(user.verificationTokenExpires).toLocaleDateString()}
                                </p>
                              )}
                          </div>
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
        userName={userToDelete?.profile.name || userToDelete?.firstName + ' ' + userToDelete?.lastName}
        email={userToDelete?.email }
        userRole={userToDelete?.role}
      />
      {viewingImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setViewingImage(null)}
        >
          <img
            src={viewingImage}
            alt="Full size certification"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 text-white text-3xl font-bold"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;