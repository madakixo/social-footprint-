import React, { useEffect, useState } from 'react';

interface Profile {
  id: string;
  profilerId: string;
  targetUserId?: string;
  name: string;
  age?: number;
  gender?: string;
  occupation?: string;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  region?: string;
  state?: string;
  lga?: string;
  ward?: string;
  constituency?: string;
  createdAt: string;
}

interface ProfileListProps {
  isLoggedIn: boolean;
  currentUser: any;
  onEditProfile: (profile: Profile) => void;
  refreshTrigger: boolean;
}

export default function ProfileList({ isLoggedIn, currentUser, onEditProfile, refreshTrigger }: ProfileListProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const fetchProfiles = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await fetch(`/api/profiles?profilerId=${currentUser.id}`);
      const data = await response.json();
      if (response.ok) {
        setProfiles(data);
      } else {
        console.error('Failed to fetch profiles:', data.message);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && currentUser?.id) {
      fetchProfiles();
    }
  }, [isLoggedIn, currentUser, refreshTrigger]);

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Profiles</h3>
      {profiles.length === 0 ? (
        <p className="text-gray-600">No profiles created yet. Create one above!</p>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div key={profile.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-800 font-semibold mb-1">{profile.name}</p>
              {profile.age && <p className="text-sm text-gray-600">Age: {profile.age}</p>}
              {profile.occupation && <p className="text-sm text-gray-600">Occupation: {profile.occupation}</p>}
              {profile.bio && <p className="text-sm text-gray-600">{profile.bio}</p>}
              <button
                onClick={() => onEditProfile(profile)}
                className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
              >
                Edit Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
