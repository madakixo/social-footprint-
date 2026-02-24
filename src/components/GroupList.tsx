import React, { useEffect, useState } from 'react';

interface GroupListProps {
  isLoggedIn: boolean;
  currentUser: any;
  onGroupJoined: () => void; // Callback to refresh group list
  refreshTrigger: boolean; // Trigger to re-fetch groups
}

interface Group {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  ownerUsername: string;
  createdAt: string;
}

export default function GroupList({ isLoggedIn, currentUser, onGroupJoined, refreshTrigger }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinMessage, setJoinMessage] = useState('');

  const fetchGroups = async () => {
    try {
      const response = await fetch('/api/groups');
      const data = await response.json();
      if (response.ok) {
        setGroups(data);
      } else {
        console.error('Failed to fetch groups:', data.message);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    setJoinMessage('');
    if (!currentUser?.id) {
      setJoinMessage('You must be logged in to join a group.');
      return;
    }

    try {
      const response = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await response.json();
      if (response.ok) {
        setJoinMessage(data.message);
        onGroupJoined(); // Refresh group list
      } else {
        setJoinMessage(data.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      setJoinMessage('An error occurred while joining the group');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchGroups();
    }
  }, [isLoggedIn, refreshTrigger]);

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Available Groups</h3>
      {joinMessage && (
        <p className={`mb-4 text-center ${joinMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {joinMessage}
        </p>
      )}
      {groups.length === 0 ? (
        <p className="text-gray-600">No groups available. Be the first to create one!</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div key={group.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-800 font-semibold mb-1">{group.name} <span className="text-sm text-gray-500">by {group.ownerUsername}</span></p>
              {group.description && <p className="text-gray-600 text-sm mb-2">{group.description}</p>}
              <p className="text-xs text-gray-400">Created on {new Date(group.createdAt).toLocaleString()}</p>
              {isLoggedIn && (
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className="mt-2 text-sm bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                >
                  Join Group
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
