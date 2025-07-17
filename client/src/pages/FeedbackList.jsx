import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FeedbackList({ childId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/feedback/child/${childId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    if (childId) fetchFeedbacks();
  }, [childId, token]);

  if (!childId) return null;
console.log(feedbacks)
  return (
    <div className="space-y-4">
      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback history found</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb._id} className=" p-4 rounded-lg bg-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">
                {fb.user?.profile?.name || 'Anonymous'}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(fb.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-gray-700">{fb.feedbackText}</p>
            <div className="mt-2 text-sm text-gray-500">
              Session ID: {fb.therapyModule.toString().slice(-6)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}