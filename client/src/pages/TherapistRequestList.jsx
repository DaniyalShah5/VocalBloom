
import React from 'react';


export default function TherapistRequestList({ pendingRequests, onAccept, onDecline }) {

  if (!pendingRequests || pendingRequests.length === 0) {
    return <p>No new pending requests at this time.</p>;
  }

  return (
    <ul className="space-y-4">
      {pendingRequests.map(r => (
        <li key={r._id} className="flex flex-col gap-3 p-4 rounded">
          <p className='text-lg'><strong className='font-semibold'>Child:</strong> {r.child?.profile?.name}</p>
          <p className='text-lg'><strong className='font-semibold'>Disability Type:</strong> {r.child?.profile?.disabilityType || '—'}</p>
          <p className='text-lg'><strong className='font-semibold'>Additional Info:</strong> {r.child?.profile?.additionalInfo || '—'}</p>
          <p className='text-lg'><strong className='font-semibold'>Requested:</strong> {new Date(r.requestedAt).toLocaleTimeString()}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => onAccept(r._id)}
              className="bg-[#88c6e4] text-white hover:scale-105 transition-transform text-lg px-4 py-1 rounded"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline(r._id)}
              className="bg-red-500 text-white hover:scale-105 transition-transform text-lg px-4 py-1 rounded"
            >
              Decline
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}