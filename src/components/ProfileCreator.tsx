import React, { useState, useEffect } from 'react';
import { reverseGeocode } from '../services/geocodingService';

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

interface ProfileCreatorProps {
  currentUser: any;
  location: { latitude: number; longitude: number } | null;
  profile?: Profile; // Optional prop for editing an existing profile
  onProfileCreatedOrUpdated: () => void; // Callback to refresh profile list
}

export default function ProfileCreator({ currentUser, location, profile, onProfileCreatedOrUpdated }: ProfileCreatorProps) {
  const [targetUserId, setTargetUserId] = useState(profile?.targetUserId || '');
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [occupation, setOccupation] = useState(profile?.occupation || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [region, setRegion] = useState(profile?.region || '');
  const [state, setState] = useState(profile?.state || '');
  const [lga, setLga] = useState(profile?.lga || '');
  const [ward, setWard] = useState(profile?.ward || '');
  const [constituency, setConstituency] = useState(profile?.constituency || '');
  const [profileMessage, setProfileMessage] = useState('');

  // Effect to update form fields if a new profile is passed for editing
  useEffect(() => {
    setTargetUserId(profile?.targetUserId || '');
    setName(profile?.name || '');
    setAge(profile?.age?.toString() || '');
    setGender(profile?.gender || '');
    setOccupation(profile?.occupation || '');
    setBio(profile?.bio || '');
    setRegion(profile?.region || '');
    setState(profile?.state || '');
    setLga(profile?.lga || '');
    setWard(profile?.ward || '');
    setConstituency(profile?.constituency || '');
    setProfileMessage('');
  }, [profile]);

  // Effect to pre-fill location details from reverse geocoding
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (location?.latitude && location?.longitude) {
        try {
          const result = await reverseGeocode(location.latitude, location.longitude);
          setRegion(result.region || '');
          setState(result.state || '');
          setLga(result.lga || '');
          setWard(result.ward || '');
          setConstituency(result.constituency || '');
        } catch (error) {
          console.error('Error during reverse geocoding:', error);
        }
      }
    };
    fetchLocationDetails();
  }, [location]);



  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage('');
    if (!currentUser?.id || !name) {
      setProfileMessage('You must be logged in and provide a name for the profile.');
      return;
    }

    try {
      const method = profile?.id ? 'PUT' : 'POST';
      const url = profile?.id ? `/api/profiles/${profile.id}` : '/api/profiles';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profilerId: currentUser.id,
          targetUserId: targetUserId || null, // Optional
          name,
          age: age ? parseInt(age) : null,
          gender,
          occupation,
          bio,
          latitude: location?.latitude,
          longitude: location?.longitude,
          region,
          state,
          lga,
          ward,
          constituency,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfileMessage(data.message);
        setTargetUserId('');
        setName('');
        setAge('');
        setGender('');
        setOccupation('');
        setProfileMessage(data.message);
        setTargetUserId('');
        setName('');
        setAge('');
        setGender('');
        setOccupation('');
        setBio('');
        onProfileCreatedOrUpdated(); // Notify parent of update/creation
      } else {
        setProfileMessage(data.message || `Failed to ${profile?.id ? 'update' : 'create'} profile`);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setProfileMessage('An error occurred while creating the profile');
    }
  };

  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{profile?.id ? 'Edit Profile' : 'Create a Profile'}</h3>
      {profileMessage && (
        <p className={`mb-4 text-center ${profileMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
          {profileMessage}
        </p>
      )}
      <form onSubmit={handleCreateProfile} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Profile Name (e.g., John Doe)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Target User ID (optional, if profiling another user)"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Age (optional)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Gender (optional)"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Occupation (optional)"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
          ></textarea>
        </div>
        <div>
          <input
            type="text"
            placeholder="Region (optional)"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="State (optional)"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="LGA (Local Government Area) (optional)"
            value={lga}
            onChange={(e) => setLga(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Ward (optional)"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="Constituency (optional)"
            value={constituency}
            onChange={(e) => setConstituency(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          {profile?.id ? 'Update Profile' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
}
