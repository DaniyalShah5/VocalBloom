import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  User,
  Mail,
  Star,
  Award,
  Send,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import emailjs from "emailjs-com";

const ScheduleSession = () => {
  const [therapists, setTherapists] = useState([]);
  const [childName, setChildName] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTimeOnly, setSessionTimeOnly] = useState("");

  useEffect(() => {
    const fetchTherapists = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/therapists");
        setTherapists(res.data);
      } catch (err) {
        console.error("Failed to load therapists:", err);
        setMessage("Failed to load therapists. Please try again.");
        setMessageType("error");
      }
    };
    fetchTherapists();
  }, []);

  const sendEmail = async (therapist) => {
    if (!childName || !sessionDate || !sessionTimeOnly) {
  setMessage('Please enter child name, date and time.');
  setMessageType('error');
  return;
}

    setLoading(true);

    const templateParams = {
      to_email: therapist.email,
      to_name: therapist.profile.name,
      from_name: childName,
      from_email: userEmail,
      session_time: formatSessionDateTime()
    };

    try {
      await emailjs.send(
        "vocalBloom",
        "template_tts3nas",
        templateParams,
        "mvl3kKfDV5hhh_gR5"
      );
      setMessage(`Request sent successfully to ${therapist.profile.name}!`);
      setMessageType("success");
    } catch (error) {
      setMessage("Failed to send request. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const formatSessionDateTime = () => {
  if (!sessionDate || !sessionTimeOnly) return '';
  const dateTime = new Date(`${sessionDate}T${sessionTimeOnly}`);
  return dateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Schedule Your Therapy Session
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with our qualified therapists and book a session that works
            for you
          </p>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <User className="inline-block w-4 h-4 mr-2" />
                Child's Name
              </label>
              <input
                type="text"
                placeholder="Enter your child's name"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="inline-block w-4 h-4 mr-2" />
                Your Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Session Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="inline-block w-4 h-4 mr-2" />
                Preferred Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            {/* Session Time */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="inline-block w-4 h-4 mr-2" />
                Preferred Time
              </label>
              <input
                type="time"
                value={sessionTimeOnly}
                onChange={(e) => setSessionTimeOnly(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
          </div>

          {sessionDate && sessionTimeOnly && (
  <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
    <p className="text-blue-800 font-medium">
      <Clock className="inline-block w-4 h-4 mr-2" />
      Preferred time: {formatSessionDateTime()}
    </p>
  </div>
)}
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border-l-4 flex items-center ${
              messageType === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <p className="font-medium">{message}</p>
          </div>
        )}

        {/* Therapists Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {therapists.map((therapist) => (
            <div
              key={therapist._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-[#db8ec1] to-[#8ec1db] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {therapist.profile?.name || "Therapist"}
                    </h3>
                    <div className="flex items-center text-white">
                      <Mail className="w-4 h-4 mr-1" />
                      <span className="text-sm">{therapist.email}</span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-3">
                    <User className="w-6 h-6 text-[#8ec1db]" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Specialties */}
                <div>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    <span className="font-semibold text-gray-700">
                      Specialties
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(therapist.specialties || ["General Therapy"]).map(
                      (specialty, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {specialty}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center">
                  <Award className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-gray-700">
                    <span className="font-semibold">
                      {therapist.qualifications?.yearsOfExperience || "N/A"}
                    </span>{" "}
                    years of experience
                  </span>
                </div>

                {/* Request Button */}
                <button
                  onClick={() => sendEmail(therapist)}
                  disabled={loading || !childName || !sessionDate || !sessionTimeOnly}
                  className="w-full mt-6 bg-[#8ec1db] text-white px-6 py-3 rounded-lg font-semibold disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group-hover:shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Send className="w-4 h-4 mr-2" />
                      Request Session
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {therapists.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Therapists...
              </h3>
              <p className="text-gray-600">
                We're currently loading our therapist directory. Please wait a
                moment.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            Need help? Contact our support team for assistance with scheduling.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSession;
