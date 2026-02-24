import React, { useState } from 'react';

interface AlertCreatorProps {
  currentUser: any;
  location: { latitude: number; longitude: number } | null;
}

export default function AlertCreator({ currentUser, location }: AlertCreatorProps) {
  const [alertType, setAlertType] = useState('general');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertResponse, setAlertResponse] = useState('');

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertResponse('');
    if (!currentUser?.id || !alertMessage) {
      setAlertResponse('You must be logged in and provide an alert message.');
      return;
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: alertType,
          message: alertMessage,
          latitude: location?.latitude,
          longitude: location?.longitude,
          // TODO: Add region, state, lga, ward, constituency based on location
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAlertResponse(data.message);
        setAlertMessage('');
      } else {
        setAlertResponse(data.message || 'Failed to create alert');
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setAlertResponse('An error occurred while creating the alert');
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Create an Alert</h3>
      {alertResponse && (
        <p className={`mb-4 text-center ${alertResponse.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {alertResponse}
        </p>
      )}
      <form onSubmit={handleCreateAlert} className="space-y-4">
        <div>
          <label htmlFor="alertType" className="block text-sm font-medium text-gray-700">Alert Type</label>
          <select
            id="alertType"
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="general">General</option>
            <option value="emergency">Emergency</option>
            <option value="scout">Scout</option>
          </select>
        </div>
        <div>
          <textarea
            placeholder="Alert message..."
            value={alertMessage}
            onChange={(e) => setAlertMessage(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            rows={3}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        >
          Send Alert
        </button>
      </form>
    </div>
  );
}
