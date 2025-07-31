import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AlignLeft } from "lucide-react";
import { CircleCheck } from "lucide-react";
import { Clock5 } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { LibraryBig } from "lucide-react";
import { ChartColumnBig } from "lucide-react";
import { BookOpen } from "lucide-react";

const ProgressReport = () => {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [childInfo, setChildInfo] = useState(null);
  const [filter, setFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserAndProgress = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view progress reports");
          setLoading(false);
          return;
        }

        const userRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const user = userRes.data;
        setCurrentUser(user);

        let childId;
        if (user.role === "parent") {
          if (!user.children?.length) throw new Error("No children associated");
          childId = user.children[0];
        } else if (user.role === "child") {
          childId = user._id;
        } else {
          throw new Error("You dont have a child registered as a patient");
        }

        const childRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/child/${childId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setChildInfo(childRes.data);

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

        setProgress(filteredProgress);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || err.message);
        setLoading(false);
      }
    };

    fetchUserAndProgress();
  }, []);

  const calculateCompletion = (record) => {
    if (!record.therapyModule?.exercises) return 0;
    const total = record.therapyModule.exercises.length;
    const completed = record.completedTasks.filter((t) =>
      record.therapyModule.exercises.includes(t)
    ).length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const filteredProgress = progress.filter((record) => {
    const hasProgress =
      record.completedTasks.length > 0 || record.taskLogs.length > 0;
    if (!hasProgress) return false;

    const percentage = calculateCompletion(record);
    if (filter === "completed") return percentage === 100;
    if (filter === "in-progress") return percentage >= 0 && percentage < 100;
    return true;
  });

  const sortedProgress = [...filteredProgress].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt)
  );

  const formatDateTime = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getOverallStats = () => {
    const totalModules = progress.length;
    const completedModules = progress.filter(
      (record) => calculateCompletion(record) === 100
    ).length;
    const inProgressModules = progress.filter((record) => {
      const completion = calculateCompletion(record);
      return completion > 0 && completion < 100;
    }).length;
    const averageCompletion =
      totalModules > 0
        ? Math.round(
            progress.reduce(
              (sum, record) => sum + calculateCompletion(record),
              0
            ) / totalModules
          )
        : 0;

    return {
      totalModules,
      completedModules,
      inProgressModules,
      averageCompletion,
    };
  };

  const stats = getOverallStats();

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Progress Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your therapy journey and achievements
          </p>
        </div>

        {/* Child Info Card */}
        {childInfo && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 ">
                <div className="bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] text-white w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold">
                  {childInfo.profile.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="sm:text-2xl text-xl font-bold text-gray-800">
                    {childInfo.profile.name}
                  </h2>
                  {childInfo.profile.disabilityType && (
                    <p className="text-gray-600 flex items-center mt-1 text-sm sm:text-md">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Focus Area: {childInfo.profile.disabilityType}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right flex-1">
                <div className="text-xl sm:text-3xl font-bold text-blue-600">
                  {stats.averageCompletion}%
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Overall Progress
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#8ec1db]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Modules
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalModules}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BookOpen className="w-6 h-6 text-[#8ec1db]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completedModules}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CircleCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgressModules}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock5 className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-[#db8ec1]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Progress
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageCompletion}%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#db8ec1]" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                filter === "all"
                  ? "bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <span className="flex items-center space-x-2">
                <AlignLeft className="" />
                <span>All Modules</span>
              </span>
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                filter === "completed"
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <span className="flex items-center space-x-2">
                <CircleCheck />
                <span>Completed</span>
              </span>
            </button>

            <button
              onClick={() => setFilter("in-progress")}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                filter === "in-progress"
                  ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              <span className="flex items-center space-x-2">
                <Clock5 />
                <span>In Progress</span>
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className=" ">
            <div className="flex flex-col items-center justify-center min-h-64 p-8">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                  <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                </div>
              </div>
              <p className="text-gray-600 text-lg mt-6 font-medium">
                Loading progress data...
              </p>
              <div className="flex space-x-1 mt-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        ) : sortedProgress.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-6">
              <LibraryBig className="h-full w-full" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Progress Records Found
            </h3>
            <p className="text-gray-600 mb-6">
              Start your therapy journey by exploring available modules
            </p>
            <Link
              to="/therapy-modules"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-full transition-all duration-200 transform hover:scale-105 "
            >
              + Explore Therapy Modules
            </Link>
          </div>
        ) : (
          /* Progress Cards */
          <div className="space-y-6">
            {sortedProgress.map((record) => {
              const completion = calculateCompletion(record);
              const totalExercises =
                record.therapyModule?.exercises?.length || 0;
              const completedExercises = record.completedTasks.filter((t) =>
                record.therapyModule?.exercises?.includes(t)
              ).length;
              const isCompleted = completion === 100;
              const status = isCompleted
                ? "Completed"
                : completion > 0
                ? "In Progress"
                : "Started";

              return (
                <div
                  key={record._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {record.therapyModule?.title || "Unnamed Module"}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Started: {formatDateTime(record.startedAt)}
                          </div>
                          {isCompleted && record.updatedAt && (
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Completed: {formatDateTime(record.updatedAt)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            isCompleted
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {status}{" "}
                          {status === "In Progress" && `(${completion}%)`}
                        </span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {completion}%
                          </div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-gray-600">
                          {completedExercises} of {totalExercises} tasks
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCompleted
                              ? "bg-gradient-to-r from-green-400 to-green-600"
                              : "bg-gradient-to-r from-blue-400 to-purple-600"
                          }`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-between items-center text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Last updated: {formatDateTime(record.updatedAt)}
                      </div>
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        Tasks completed: {record.completedTasks.length}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressReport;
