import React, { useState } from 'react';

interface GroupCreatorProps {
  currentUser: any;
  location: { latitude: number; longitude: number } | null;
  onGroupCreated: () => void; // Callback to refresh group list
}

export default function GroupCreator({ currentUser, location, onGroupCreated }: GroupCreatorProps) {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupMessage, setGroupMessage] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupMessage('');
    if (!currentUser?.id || !groupName) {
      setGroupMessage('You must be logged in and provide a group name.');
      return;
    }

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          ownerId: currentUser.id,
          latitude: location?.latitude,
          longitude: location?.longitude,
          // TODO: Add region, state, lga, ward, constituency based on location
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setGroupMessage(data.message);
        setGroupName('');
        setGroupDescription('');
        onGroupCreated(); // Refresh group list
      } else {
        setGroupMessage(data.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setGroupMessage('An error occurred while creating the group');
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Create a New Group</h3>
      {groupMessage && (
        <p className={`mb-4 text-center ${groupMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {groupMessage}
        </p>
      )}
      <form onSubmit={handleCreateGroup} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <textarea
            placeholder="Group Description (optional)"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          Create Group
        </button>
      </form>
    </div>
  );
}
