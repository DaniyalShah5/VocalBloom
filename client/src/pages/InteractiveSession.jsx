import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
import TherapistRequestList from "./TherapistRequestList";
import {
  Clock,
  Video,
  X,
  RefreshCw,
  CheckCircle,
  XCircle,
  Send,
  MessageSquare,
  Calendar,
  Heart,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function InteractiveSession() {
  const { user, loading: authLoading } = useAuth();
  const [request, setRequest] = useState(undefined);
  const token = localStorage.getItem("token");
  const [newFeedback, setNewFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const socket = useSocket();
  const [therapistPendingRequests, setTherapistPendingRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (socket && user) {
      socket.emit("register", { userId: user._id, role: user.role });
    }
  }, [socket, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRequest(null);
      setTherapistPendingRequests([]);
      setCountdown(null);
      return;
    }

    setLoading(true);

    const apiEndpoint =
      user.role === "therapist"
        ? `${import.meta.env.VITE_API_BASE_URL}/api/session-requests`
        : `${import.meta.env.VITE_API_BASE_URL}/api/session-requests/my`;

    axios
      .get(apiEndpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setError(null);

        if (user.role === "therapist") {
          const allTherapistRequests = res.data;
          const pending = allTherapistRequests.filter(
            (req) => req.status === "pending"
          );
          setTherapistPendingRequests(pending);
          const activeSession = allTherapistRequests.find((req) =>
            ["accepted", "in_progress"].includes(req.status)
          );
          setRequest(activeSession || null);
          setCountdown(null);
        } else {
          setRequest(res.data);
          if (res.data && res.data.status === "pending") {
            const requestTime = new Date(res.data.requestedAt).getTime();
            const now = Date.now();
            setCountdown(Math.floor((now - requestTime) / 1000));
          } else {
            setCountdown(null);
          }
        }
      })
      .catch((err) => {
        setRequest(null);
        setTherapistPendingRequests([]);
        setCountdown(null);
        setError("Unable to fetch session data.");
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, token]);

  useEffect(() => {
    if (!request || request.status !== "pending" || countdown === null) {
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [request, countdown]);

  useEffect(() => {
    if (!socket || !user) return;

    if (user.role === "therapist") {
      const handleNewSessionRequest = (payload) => {
        setTherapistPendingRequests((prevRequests) => {
          if (prevRequests.some((req) => req._id === payload.requestId)) {
            return prevRequests;
          }
          return [
            {
              _id: payload.requestId,
              child: payload.child,
              status: payload.status,
              requestedAt: payload.requestedAt,
              description: payload.description,
            },
            ...prevRequests,
          ];
        });
      };
      socket.on("new_session_request", handleNewSessionRequest);

      const handleSessionRequestDeleted = (payload) => {
        setTherapistPendingRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== payload.requestId)
        );
      };
      socket.on("session_request_deleted", handleSessionRequestDeleted);

      return () => {
        socket.off("new_session_request", handleNewSessionRequest);
        socket.off("session_request_deleted", handleSessionRequestDeleted);
      };
    }

    const handleSessionRequestUpdated = (payload) => {
      if (user.role === "therapist") {
        setTherapistPendingRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== payload.requestId)
        );
        setRequest((prevActiveRequest) => {
          if (
            prevActiveRequest &&
            prevActiveRequest._id === payload.requestId
          ) {
            return {
              ...prevActiveRequest,
              status: payload.status,
              acceptedAt: payload.acceptedAt,
              declinedAt: payload.declinedAt,
              endedAt: payload.endedAt,
              therapist: payload.therapist,
            };
          } else if (
            ["accepted", "in_progress"].includes(payload.status) &&
            payload.therapist === user._id
          ) {
            return prevActiveRequest;
          }
          return prevActiveRequest;
        });
      } else {
        setRequest((prevRequest) => {
          if (prevRequest && prevRequest._id === payload.requestId) {
            return {
              ...prevRequest,
              status: payload.status,
              acceptedAt: payload.acceptedAt,
              declinedAt: payload.declinedAt,
              endedAt: payload.endedAt,
              therapist: payload.therapist,
            };
          }
          return prevRequest;
        });
      }
    };
    socket.on("session_request_updated", handleSessionRequestUpdated);
    return () => {
      socket.off("session_request_updated", handleSessionRequestUpdated);
    };
  }, [socket, user]);

  const createRequest = () => {
    setLoading(true);
    axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL}/api/session-requests`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRequest(res.data);
        setError(null);
        setCountdown(0);
      })
      .catch((err) => {
        setError("Failed to create session request. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const acceptRequest = (id) => {
    setLoading(true);
    axios
      .put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/session-requests/${id}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRequest(res.data);
        setError(null);

        setTherapistPendingRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== id)
        );
      })
      .catch((err) => {
        console.error("Error:", err.response?.data?.error || err.message);
        setError("Failed to accept request. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const declineRequest = (id) => {
    setLoading(true);
    axios
      .put(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/session-requests/${id}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRequest(null);
        setError(null);

        setTherapistPendingRequests((prevRequests) =>
          prevRequests.filter((req) => req._id !== id)
        );
      })
      .catch((err) => {
        console.error("Error:", err.response?.data?.error || err.message);
        setError("Failed to decline request. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const endSession = (id) => {
    setLoading(true);
    axios
      .put(
        `${import.meta.env.VITE_API_BASE_URL}/api/session-requests/${id}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setRequest(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data?.error || err.message);
        setError("Failed to end session. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const cancelCurrentRequest = () => {
    if (!request?._id) return;

    setLoading(true);
    axios
      .delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/session-requests/${
          request._id
        }`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setRequest(null);
        setError(null);
      })
      .catch((err) => {
        console.error("Error:", err.response?.data?.error || err.message);
        setError("Failed to delete session request. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Loading state
  if (loading && (!user || request === undefined)) {
    return (
      <div className="min-h-[65vh] flex justify-center items-center sm:min-h-screen sm:flex sm:items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col items-center justify-center min-h-64 p-8">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">
            Loading session data...
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="bg-white border border-red-200 rounded-xl shadow-lg p-8 max-w-2xl mx-auto my-16">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
              <XCircle className="text-red-500" size={24} />
            </div>
            <h3 className="text-red-800 font-bold text-xl">
              Something went wrong
            </h3>
          </div>
          <p className="text-red-700 mb-6 text-lg leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <RefreshCw size={18} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const patientName = request?.child?.profile?.name || "Unknown Patient";

  // CHILD / PARENT VIEW
  if (user?.role === "child" || user?.role === "parent") {
    // No request or declined → show request button
    if (request === null || request?.status === "declined") {
      return (
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden rounded-xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-center p-4">
                <div className="grid grid-col-3 sm:grid-col-1 sm:grid-row-3">
                  <div className="col-start-1 col-end-2 flex items-center justify-start sm:justify-center sm:row-start-1 sm:row-end-2 sm:col-start-1 sm:col-end-2">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center ">
                      <Video className="text-[#5495b5] sm:w-10 sm:h-10" />
                    </div>
                  </div>
                  <div className="col-start-2 col-end-3 flex flex-col justify-center sm:row-start-2 sm:row-end-4 sm:col-start-1 sm:col-end-2 ml-2">
                    <h2 className="font-bold text-white text-xl sm:text-3xl">
                      Start Your Therapy Session
                    </h2>
                    <p className="text-blue-100 text-sm sm:text-lg">
                      Connect with a professional therapist for personalized
                      support
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                {request?.status === "declined" && (
                  <div className="bg-amber-50 border-l-4 border-amber-400 p-6 mb-8 rounded-r-lg">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircle className="h-6 w-6 text-amber-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-amber-800 font-medium">
                          Previous Request Declined
                        </p>
                        <p className="text-amber-700 mt-1">
                          Your previous request was declined. You can try again
                          when a therapist becomes available.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6">
                    <h3 className="font-bold text-blue-800 mb-4 text-xl">
                      Session Benefits
                    </h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <Video className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-blue-800">
                            Face-to-Face Connection
                          </p>
                          <p className="text-blue-700">
                            Direct interaction with professional therapists
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-blue-800">
                            Personalized Guidance
                          </p>
                          <p className="text-blue-700">
                            Real-time feedback tailored to your needs
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <div className="flex-shrink-0 mt-1 w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-blue-800">
                            Focused Attention
                          </p>
                          <p className="text-blue-700">
                            Dedicated time for your specific concerns
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <h3 className="font-bold text-purple-800 mb-4 text-xl">
                      What to Expect
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-700 text-sm font-bold">
                            1
                          </span>
                        </div>
                        <span className="text-purple-700">
                          Request your session
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-700 text-sm font-bold">
                            2
                          </span>
                        </div>
                        <span className="text-purple-700">
                          Wait for therapist confirmation
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-700 text-sm font-bold">
                            3
                          </span>
                        </div>
                        <span className="text-purple-700">
                          Join your secure video session
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-purple-700 text-sm font-bold">
                            4
                          </span>
                        </div>
                        <span className="text-purple-700">
                          Receive personalized feedback
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    onClick={createRequest}
                    disabled={loading}
                    className={`
                      inline-flex items-center justify-center
                      bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600
                      text-white px-8 py-4 rounded-xl font-bold text-lg
                      transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl
                      ${loading ? "opacity-70 cursor-not-allowed" : ""}
                    `}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Video size={24} className="mr-3" />
                        {request?.status === "declined"
                          ? "Request New Session"
                          : "Start Session Request"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pending → show waiting message
    if (request?.status === "pending") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#88c6e4] to-[#db8ec1] p-4 sm:p-6">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <Clock className="w-8 h-8 sm:h-8 sm:w-8 text-[#88c6e4]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Connecting You...
                    </h2>
                    <p className="text-blue-100">
                      Your therapist will join shortly
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-8">
                <div className="text-center mb-4 sm:mb-8">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <div className="w-14 h-14 sm:w-24 sm:h-24 border-4 border-blue-300 rounded-full animate-spin">
                        <div className="absolute top-0 left-0 w-14 h-14 sm:w-24 sm:h-24 border-4 border-transparent border-t-[#db8ec1] rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <div className="absolute -top-1 -right-3 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                    Waiting for Your Therapist
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-md">
                    Please be patient while we connect you with an available
                    professional
                  </p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-5 sm:mb-8">
                  <div className="flex justify-between items-center mb-3 sm:mb-6">
                    <div>
                      <p className="text-gray-700 font-medium mb-1">
                        Waiting Time
                      </p>
                      <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {formatTime(countdown || 0)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <div className="hidden sm:block">
                    <p className="">
                      Request submitted:{" "}
                      {new Date(request.requestedAt).toLocaleString()}
                    </p>
                    </div>
                    <div className="block sm:hidden">
                      <p className="text-center text-gray-800 mb-2">Request submitted</p>
                      <div className="flex items-center justify-between">
                      <p>Date:{" "}
                        { new Date(request.requestedAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p>Time:{" "}
                        {new Date(request.requestedAt).toLocaleTimeString(undefined,{
                          hour:'2-digit',
                          minute:'2-digit',
                        })}
                      </p>
                      </div>

                    </div>

                  </div>

                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-2">
                      While you wait:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Find a quiet, comfortable space</li>
                      <li>• Test your camera and microphone</li>
                      <li>• Prepare any questions you'd like to discuss</li>
                      <li>• Take a few deep breaths and relax</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center space-x-1 sm:space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors text-nowrap text-sm sm:text-[16px]"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh Status
                  </button>

                  <button
                    onClick={cancelCurrentRequest}
                    className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors text-nowrap text-sm sm:text-[16px]"
                  >
                    <X size={16} className="mr-2" />
                    Cancel Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Accepted or in_progress → show video call
    if (["accepted", "in_progress"].includes(request?.status)) {
      const room = `vb-${request._id}`;
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#db8ec1] to-[#88c6e4] text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <Video className="text-[#db8ec1]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Live Therapy Session
                      </h2>
                      <p className="text-blue-100">Secure & Private</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-red-500 bg-opacity-90 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                    <span className="font-bold">LIVE</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <iframe
                  title="Jitsi Meet"
                  src={`https://meet.jit.si/${room}`}
                  allow="camera;microphone;fullscreen;display-capture"
                  className="w-full h-[700px] border-0"
                />

                <div className="absolute top-6 right-6 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                  Session ID: {request._id.substring(0, 8)}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                    <p className="text-gray-700 font-medium">
                      Your session is end-to-end encrypted and completely
                      private
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors border border-gray-200"
                  >
                    <RefreshCw size={14} className="inline mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <MessageSquare className="mr-2 text-blue-500" size={20} />
                Session Guidelines
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Before You Start:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Ensure you're in a quiet, private space</li>
                    <li>✓ Test your camera and microphone</li>
                    <li>✓ Have good lighting on your face</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    During Your Session:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Have a notebook handy for important points</li>
                    <li>✓ Speak clearly and feel free to ask questions</li>
                    <li>✓ The therapist will conclude the session</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Completed → show feedback list
    if (request?.status === "completed") {
      const childId = user.role === "child" ? user._id : user.children?.[0];

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-[#5495b5] bg-clip-text text-transparent">
                Session Complete!
              </h2>
              <button
                onClick={createRequest}
                disabled={loading}
                className={`
                  flex items-center bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] hover:opacity-90
                  text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg
                  ${loading ? "opacity-70 cursor-not-allowed" : ""}
                `}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                ) : (
                  <Calendar size={18} className="mr-2" />
                )}
                Schedule New Session
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full text-green-500 flex items-center justify-center mr-4">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Session Successfully Completed
                    </h3>
                    <p className="text-green-100">
                      Great work on completing your therapy session!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mr-4">
                    <ThumbsUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      Excellent Progress!
                    </h4>
                    <p className="text-gray-600">
                      You can view your feedback and session history below.
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="font-bold text-gray-800 mb-4">
                    Session Summary
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold text-sm">
                          #
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">Session ID</p>
                      <p className="font-bold text-gray-800">
                        {request._id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="text-purple-600" size={16} />
                      </div>
                      <p className="text-gray-500 text-sm">Date</p>
                      <p className="font-bold text-gray-800">
                        {new Date(request.endedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Clock className="text-green-600" size={16} />
                      </div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <p className="font-bold text-gray-800">
                        {request.requestedAt && request.endedAt
                          ? `${Math.round(
                              (new Date(request.endedAt) -
                                new Date(request.requestedAt)) /
                                60000
                            )} min`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="text-emerald-600" size={16} />
                      </div>
                      <p className="text-gray-500 text-sm">Status</p>
                      <p className="inline-flex items-center font-bold text-emerald-700">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        Complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageSquare className="mr-3 text-blue-600" size={24} />
                  Session History & Feedback
                </h3>
                <p className="text-gray-600 mt-1">
                  Review your progress and therapist feedback
                </p>
              </div>
              <div className="p-6">
                <FeedbackList childId={childId} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // THERAPIST VIEW
  if (user?.role === "therapist") {
    // No in-progress or accepted → list all pending/in_progress requests
    if (!request || request.status === "pending") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h2 className="mb-3 text-center  text-4xl font-bold text-gray-800">
                Therapist Dashboard
              </h2>
              <p className="text-lg text-gray-600 text-center mb-10">
                Manage incoming session requests from patients
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-[#8ec1db] to-[#db8ec1] p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <Clock className="text-[#5495b5]" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Pending Session Requests
                      </h3>
                      <p className="text-blue-100">
                        Review and respond to patient requests
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-black px-4 py-2 rounded-lg text-sm flex items-center transition-colors backdrop-blur-sm"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh List
                  </button>
                </div>
              </div>

              <div className="p-6">
                <TherapistRequestList
                  pendingRequests={therapistPendingRequests}
                  onAccept={acceptRequest}
                  onDecline={declineRequest}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="mr-2 text-purple-500" size={20} />
                Therapist Guidelines
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Session Management:
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>
                      • New requests appear automatically in the list above
                    </li>
                    <li>• Accept requests to begin live video sessions</li>
                    <li>• Ensure your equipment is tested before accepting</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">
                    Best Practices:
                  </h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Maintain a professional, quiet environment</li>
                    <li>• Keep sessions focused and goal-oriented</li>
                    <li>• Provide constructive feedback after completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // in_progress or accepted → show video + end button
    if (["accepted", "in_progress"].includes(request?.status)) {
      const room = `vb-${request._id}`;
      const childName = request.child?.profile?.name || "Patient";

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-l from-[#88c6e4] to-[#db8ec1] text-white p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <Video className="text-[#88c6e4]" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        Active Session with {childName}
                      </h2>
                      <p className="text-blue-100">
                        Professional Therapy Session
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-red-500 bg-opacity-90 px-4 py-2 rounded-full">
                      <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                      <span className="font-bold">LIVE</span>
                    </div>
                    <button
                      onClick={() => endSession(request._id)}
                      disabled={loading}
                      className={`
                        flex items-center bg-red-600 hover:bg-red-700 text-white 
                        px-4 py-2 rounded-lg transition-colors font-medium
                        ${loading ? "opacity-70 cursor-not-allowed" : ""}
                      `}
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      ) : (
                        <X size={16} className="mr-2" />
                      )}
                      End Session
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative">
                <iframe
                  title="Jitsi Meet"
                  src={`https://meet.jit.si/${room}`}
                  allow="camera;microphone;fullscreen;display-capture"
                  className="w-full h-[700px] border-0"
                />

                <div className="absolute top-6 right-6 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
                  Session ID: {request._id.substring(0, 8)}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-t">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Patient Information:
                    </h4>
                    <div className="bg-white p-4 rounded-lg ">
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-800">Name:</span>{" "}
                        {childName}
                      </p>
                      {request.child?.profile?.age && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium text-gray-800">
                            Age:
                          </span>{" "}
                          {request.child.profile.age}
                        </p>
                      )}
                      <p className="text-gray-600 mt-1">
                        <span className="font-medium text-gray-800">
                          Session Started:
                        </span>{" "}
                        {new Date(
                          request.acceptedAt || request.requestedAt
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Session Status:
                    </h4>
                    <div className="bg-white p-4 rounded-lg ">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                        <span className="font-medium text-green-700">
                          Session Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Connection is secure and encrypted
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                <MessageSquare className="mr-2 text-blue-500" size={20} />
                Session Notes
              </h3>
              <p className="text-gray-600 mb-4">
                Take notes during your session. These are for your reference
                only and won't be saved automatically.
              </p>
              <textarea
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                rows="6"
                placeholder="Enter session notes, observations, and treatment recommendations here..."
              ></textarea>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-gray-500">
                  Notes are stored locally and not transmitted
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Completed → show feedback form
    if (request?.status === "completed") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                    <CheckCircle className="text-black" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">
                      Session Successfully Completed
                    </h3>
                    <p className="text-green-100">
                      Please provide feedback for this session
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Send className="mr-3 text-blue-500" size={24} />
                    Provide Session Feedback
                  </h4>
                  <p className="text-gray-600 mb-6 text-lg">
                    Your professional feedback helps track patient progress and
                    improve future sessions.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-8">
                    <h5 className="font-bold text-gray-800 mb-4">
                      Session Summary
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-600 font-bold">P</span>
                        </div>
                        <p className="text-gray-500 text-sm">Patient</p>
                        <p className="font-bold text-gray-800">{patientName}</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-purple-600 font-bold">#</span>
                        </div>
                        <p className="text-gray-500 text-sm">Session ID</p>
                        <p className="font-bold text-gray-800">
                          {request._id.substring(0, 8)}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Calendar className="text-green-600" size={16} />
                        </div>
                        <p className="text-gray-500 text-sm">Date</p>
                        <p className="font-bold text-gray-800">
                          {new Date(request.endedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Clock className="text-orange-600" size={16} />
                        </div>
                        <p className="text-gray-500 text-sm">Duration</p>
                        <p className="font-bold text-gray-800">
                          {request.requestedAt && request.endedAt
                            ? `${Math.round(
                                (new Date(request.endedAt) -
                                  new Date(request.requestedAt)) /
                                  60000
                              )} min`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-gray-100 rounded-xl p-2">
                    <FeedbackForm
                      therapyModule={request._id}
                      onFeedbackSubmitted={(feedback) =>
                        setNewFeedback(feedback)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <MessageSquare className="mr-3 text-blue-600" size={24} />
                  Previous Session Feedback
                </h3>
                <p className="text-gray-600 mt-1">
                  Review feedback history for this patient
                </p>
              </div>
              <div className="p-6">
                <FeedbackList
                  therapyModule={request._id}
                  newFeedback={newFeedback}
                />
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-[#8ec1db] text-white px-8 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback for any other roles
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            You do not have the necessary permissions to access this therapy
            session interface.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}
