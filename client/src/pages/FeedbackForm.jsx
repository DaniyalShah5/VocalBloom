import React, { useState } from 'react';
import axios from 'axios';

const FeedbackForm = ({ therapyModule, onFeedbackSubmitted }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!therapyModule) {
    return <p className="text-sm text-gray-500">Feedback not available</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/feedback',
        { therapyModule, feedbackText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('Feedback submitted successfully!');
      setFeedbackText('');
      
      
      if (typeof onFeedbackSubmitted === 'function') {
        onFeedbackSubmitted(response.data);
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Submission failed';
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 mt-4">
      <h3 className="font-bold text-lg mb-2">Submit Feedback</h3>
      {message && (
        <p className={`mb-2 text-lg ${message.startsWith('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border p-2 rounded focus:outline-none"
          placeholder="Share your session experience..."
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          required
          disabled={submitting}
          minLength={10}
        />
        <button
          type="submit"
          className={`w-full p-2 rounded text-lg text-white transition-colors ${
            submitting ? 'bg-gray-400' : 'bg-[#6ec4ef] hover:bg-[#6ec4efcf] focus:outline-none'
          }`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;