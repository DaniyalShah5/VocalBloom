import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TherapistDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterBy, setFilterBy] = useState("all");
  const [expandedPatients, setExpandedPatients] = useState({});
  const [patientProgress, setPatientProgress] = useState({});
  const [loadingProgress, setLoadingProgress] = useState({});
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view patients");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/therapist/patients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPatients(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (showOverlay) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showOverlay]);

  const handleViewProgress = async (childId) => {
    if (expandedPatients[childId]) {
      
      setExpandedPatients((prev) => ({
        ...prev,
        [childId]: false,
      }));
      setShowOverlay(false);
      return;
    }

    
    setExpandedPatients((prev) => ({
      ...prev,
      [childId]: true,
    }));
    setShowOverlay(true);

    if (!patientProgress[childId]) {
      setLoadingProgress((prev) => ({
        ...prev,
        [childId]: true,
      }));

      try {
        const token = localStorage.getItem("token");
        const progressRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/progress/${childId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const filteredProgress = progressRes.data.filter(
          (record) =>
            record.completedTasks.length > 0 || record.taskLogs.length > 0
        );

        setPatientProgress((prev) => ({
          ...prev,
          [childId]: filteredProgress,
        }));
      } catch (err) {
        console.error("Error fetching progress:", err);
        setPatientProgress((prev) => ({
          ...prev,
          [childId]: [],
        }));
      } finally {
        setLoadingProgress((prev) => ({
          ...prev,
          [childId]: false,
        }));
      }
    }
  };

  const calculateCompletion = (record) => {
    if (!record.therapyModule?.exercises) return 0;
    const total = record.therapyModule.exercises.length;
    const completed = record.completedTasks.filter((t) =>
      record.therapyModule.exercises.includes(t)
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No activity";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getProgressColor = (rate) => {
    if (rate >= 80) return "#22c55e"; 
    if (rate >= 50) return "#f59e0b"; 
    if (rate >= 20) return "#ef4444"; 
    return "#6b7280"; 
  };

  const getActivityStatus = (lastActivity) => {
    if (!lastActivity) return "inactive";
    const daysSince = Math.floor(
      (Date.now() - new Date(lastActivity)) / (1000 * 60 * 60 * 24)
    );
    if (daysSince <= 3) return "active";
    if (daysSince <= 7) return "recent";
    return "inactive";
  };

  
  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch =
        patient.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.parent?.profile.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      if (filterBy === "all") return matchesSearch;
      if (filterBy === "active")
        return (
          matchesSearch &&
          getActivityStatus(patient.progressSummary.lastActivity) === "active"
        );
      if (filterBy === "inactive")
        return (
          matchesSearch &&
          getActivityStatus(patient.progressSummary.lastActivity) === "inactive"
        );
      if (filterBy === "high-progress")
        return matchesSearch && patient.progressSummary.completionRate >= 70;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "name")
        return a.profile.name.localeCompare(b.profile.name);
      if (sortBy === "progress")
        return (
          b.progressSummary.completionRate - a.progressSummary.completionRate
        );
      if (sortBy === "activity")
        return (
          new Date(b.progressSummary.lastActivity || 0) -
          new Date(a.progressSummary.lastActivity || 0)
        );
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h3 className="text-xl font-bold text-red-600 mb-4">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Patient Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and track progress of all your patients
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-3xl font-bold mb-2">{patients.length}</h3>
            <p className="text-blue-100">Total Patients</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-3xl font-bold mb-2">
              {
                patients.filter(
                  (p) =>
                    getActivityStatus(p.progressSummary.lastActivity) ===
                    "active"
                ).length
              }
            </h3>
            <p className="text-green-100">Active This Week</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-3xl font-bold mb-2">
              {
                patients.filter((p) => p.progressSummary.completionRate >= 70)
                  .length
              }
            </h3>
            <p className="text-purple-100">High Progress</p>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-3xl font-bold mb-2">
              {Math.round(
                patients.reduce(
                  (sum, p) => sum + p.progressSummary.completionRate,
                  0
                ) / patients.length
              ) || 0}
              %
            </h3>
            <p className="text-orange-100">Average Progress</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="w-full lg:w-auto">
              <input
                type="text"
                placeholder="Search patients or parents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full lg:w-80 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
                <option value="activity">Sort by Activity</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Patients</option>
                <option value="active">Active This Week</option>
                <option value="inactive">Inactive</option>
                <option value="high-progress">High Progress</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-lg shadow-lg text-center">
              <p className="text-gray-500 text-lg">
                No patients found matching your criteria.
              </p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
              >
                {/* Patient Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {patient.profile.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {patient.profile.disabilityType || "General Therapy"}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getActivityStatus(
                        patient.progressSummary.lastActivity
                      ) === "active"
                        ? "bg-green-100 text-green-800"
                        : getActivityStatus(
                            patient.progressSummary.lastActivity
                          ) === "recent"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getActivityStatus(patient.progressSummary.lastActivity)}
                  </div>
                </div>

                {/* Patient Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Parent:</span>
                    <span className="text-gray-800 font-medium">
                      {patient.parent?.profile.name || "Not assigned"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Contact:</span>
                    <span className="text-gray-800">
                      {patient.parent?.profile.contact ||
                        patient.profile.contact ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-800">
                      {patient.parent?.email || "N/A"}
                    </span>
                  </div>
                  {patient.profile.additionalInfo && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <span className="text-gray-600">Notes: </span>
                      <span className="text-gray-800">
                        {patient.profile.additionalInfo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress Summary */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold text-gray-800">
                      {patient.progressSummary.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${patient.progressSummary.completionRate}%`,
                        backgroundColor: getProgressColor(
                          patient.progressSummary.completionRate
                        ),
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>{patient.progressSummary.totalModules} modules</span>
                    <span>
                      {patient.progressSummary.totalTasks} tasks completed
                    </span>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="mb-4 text-sm text-gray-600">
                  <strong>Last Activity:</strong>{" "}
                  {formatDate(patient.progressSummary.lastActivity)}
                </div>

                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProgress(patient._id)}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 font-medium ${
                      expandedPatients[patient._id]
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-[#6ec4ef] text-white hover:bg-[#6ec4efcf]"
                    }`}
                  >
                    {expandedPatients[patient._id]
                      ? "Hide Progress"
                      : "View Progress"}
                  </button>
                  
                </div>

                
                {expandedPatients[patient._id] && (
                  <div className="fixed inset-0 bg-gray-200 z-50 p-6 overflow-y-auto shadow-lg">
                    <div className="flex justify-between ">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Detailed Progress
                    </h4>
                    <button
                      onClick={() => handleViewProgress(patient._id)}
                      className="text-red-600 font-semibold hover:opacity-50 transition-all mb-4"
                    >
                      Close ✕
                    </button>
                    </div>

                    {loadingProgress[patient._id] ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="ml-2 text-gray-600">
                          Loading progress...
                        </span>
                      </div>
                    ) : patientProgress[patient._id] &&
                      patientProgress[patient._id].length > 0 ? (
                      <div className="space-y-4">
                        {patientProgress[patient._id].map((record, index) => {
                          const completionPercentage =
                            calculateCompletion(record);
                          return (
                            <div
                              key={index}
                              className="bg-gray-50 rounded-lg p-4"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-semibold text-gray-800">
                                    {record.therapyModule?.title ||
                                      "Unnamed Module"}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {record.therapyModule?.description ||
                                      "No description available"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-gray-700">
                                    {completionPercentage}% Complete
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Started: {formatDate(record.startedAt)}
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${completionPercentage}%`,
                                    backgroundColor:
                                      getProgressColor(completionPercentage),
                                  }}
                                ></div>
                              </div>

                              {/* Completed Tasks */}
                              {record.completedTasks &&
                                record.completedTasks.length > 0 && (
                                  <div className="mb-3">
                                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                                      Completed Tasks (
                                      {record.completedTasks.length})
                                    </h6>
                                    <div className="flex flex-wrap gap-1">
                                      {record.completedTasks.map(
                                        (task, taskIndex) => (
                                          <span
                                            key={taskIndex}
                                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                                          >
                                            {task}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Recent Task Logs */}
                              {record.taskLogs &&
                                record.taskLogs.length > 0 && (
                                  <div>
                                    <h6 className="text-sm font-medium text-gray-700 mb-2">
                                      Recent Activity
                                    </h6>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                      {record.taskLogs
                                        .slice(-3)
                                        .reverse()
                                        .map((log, logIndex) => (
                                          <div
                                            key={logIndex}
                                            className="bg-white p-2 rounded border-l-4 border-blue-400"
                                          >
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="text-sm font-medium text-gray-800">
                                                  {log.task}
                                                </div>
                                                {log.details && (
                                                  <div className="text-xs text-gray-600 mt-1">
                                                    {log.details}
                                                  </div>
                                                )}
                                              </div>
                                              <div className="text-xs text-gray-500">
                                                {formatDate(log.timestamp)}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                    {record.taskLogs.length > 3 && (
                                      <div className="text-xs text-gray-500 mt-2 text-center">
                                        Showing last 3 activities of{" "}
                                        {record.taskLogs.length} total
                                      </div>
                                    )}
                                  </div>
                                )}

                              {/* No Progress Message */}
                              {(!record.completedTasks ||
                                record.completedTasks.length === 0) &&
                                (!record.taskLogs ||
                                  record.taskLogs.length === 0) && (
                                  <div className="text-center py-4 text-gray-500">
                                    No progress recorded yet
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-lg mb-2">📊</div>
                        <p>No progress data available for this patient yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TherapistDashboard;
