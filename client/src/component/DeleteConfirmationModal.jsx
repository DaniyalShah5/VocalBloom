import React from 'react';


export const DeleteConfirmationModal = ({ isOpen, onConfirm, onCancel, userName, email, userRole }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Delete
          </h3>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this {userRole || 'user'}?
          </p>
          {userName && (
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-red-400">
              <p className="font-medium text-gray-900"><span className='text-gray-900 mr-1 font-light'>Name :</span>{userName}</p>
              <p className="font-medium text-gray-900"><span className='text-gray-900 mr-1 font-light'>Email :</span>{email}</p>
              <p className="text-sm text-gray-600 capitalize"><span className=''>Role : </span>{userRole}</p>
            </div>
          )}
          <p className="text-sm text-red-600 mt-3">
            <strong>Warning:</strong> This action cannot be undone. All data associated with this user will be permanently deleted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
};