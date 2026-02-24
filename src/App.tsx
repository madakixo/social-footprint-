/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import PostList from './components/PostList';
import AlertCreator from './components/AlertCreator';
import ProfileCreator, { Profile } from './components/ProfileCreator';
import ProfileList from './components/ProfileList';
import GroupCreator from './components/GroupCreator';
import GroupList from './components/GroupList';
import { generateContent } from './services/geminiService';
import { getCurrentLocation } from './services/mapsService';
import { reverseGeocode } from './services/geocodingService';

export default function App() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [geminiPrompt, setGeminiPrompt] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postMessage, setPostMessage] = useState('');
  const [postLocation, setPostLocation] = useState(''); // New state for explicit location name
  const [postRegion, setPostRegion] = useState('');
  const [postState, setPostState] = useState('');
  const [postLga, setPostLga] = useState('');
  const [postWard, setPostWard] = useState('');
  const [postConstituency, setPostConstituency] = useState('');
  const [refreshGroups, setRefreshGroups] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | undefined>(undefined);
  const [refreshProfiles, setRefreshProfiles] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Optionally, log in the user directly after registration
        // handleLogin(e);
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('An error occurred during registration');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setIsLoggedIn(true);
        setCurrentUser(data.user);
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred during login');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMessage('Logged out successfully');
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostMessage('');
    if (!currentUser?.id || !postContent) {
      setPostMessage('Please log in and enter post content.');
      return;
    }

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: postContent,
          location: postLocation || null, // Explicitly tagged location
          latitude: location?.latitude,
          longitude: location?.longitude,
          region: postRegion || null,
          state: postState || null,
          lga: postLga || null,
          ward: postWard || null,
          constituency: postConstituency || null,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPostMessage(data.message);
        setPostContent('');
      } else {
        setPostMessage(data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setPostMessage('An error occurred while creating the post');
    }
  };

  const handleGeminiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiResponse('Generating response...');
    const response = await generateContent(geminiPrompt);
    setGeminiResponse(response);
  };

  const handleGetLocation = async () => {
    setLocationError('');
    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
    } catch (error: any) {
      setLocationError(error.message);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      handleGetLocation(); // Get location when user logs in
    }
  }, [isLoggedIn, refreshGroups]);

  // Effect to pre-fill post location details from reverse geocoding
  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (location?.latitude && location?.longitude) {
        try {
          const result = await reverseGeocode(location.latitude, location.longitude);
          // For post creation, we might want to set a more general location name initially
          // For example, combining LGA and State, or just the State.
          // For now, let's just pre-fill the specific fields.
          setPostRegion(result.region || '');
          setPostState(result.state || '');
          setPostLga(result.lga || '');
          setPostWard(result.ward || '');
          setPostConstituency(result.constituency || '');
          setPostLocation(`${result.lga || ''}, ${result.state || ''}`.replace(/^, |^,$/g, '').trim());
        } catch (error) {
          console.error('Error during reverse geocoding for post:', error);
        }
      }
    };
    fetchLocationDetails();
  }, [location]);

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome, {currentUser?.username}!</h2>
          <p className="text-center text-gray-600 mb-4">You are logged in.</p>

          <AlertCreator currentUser={currentUser} location={location} />

          <ProfileCreator
            currentUser={currentUser}
            location={location}
            profile={editingProfile}
            onProfileCreatedOrUpdated={() => {
              setRefreshProfiles(prev => !prev);
              setEditingProfile(undefined); // Clear editing profile after update/create
            }}
          />

          <GroupCreator currentUser={currentUser} location={location} onGroupCreated={() => setRefreshGroups(prev => !prev)} />

          <GroupList isLoggedIn={isLoggedIn} currentUser={currentUser} onGroupJoined={() => setRefreshGroups(prev => !prev)} refreshTrigger={refreshGroups} />

          <ProfileList
            isLoggedIn={isLoggedIn}
            currentUser={currentUser}
            onEditProfile={setEditingProfile}
            refreshTrigger={refreshProfiles}
          />

          {/* Location Display */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Location</h3>
            {locationError && <p className="text-red-600 mb-2">Error: {locationError}</p>}
            {location ? (
              <p className="text-gray-600">Latitude: {location.latitude}, Longitude: {location.longitude}</p>
            ) : (
              <p className="text-gray-600">Fetching location...</p>
            )}
            <button
              onClick={handleGetLocation}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Refresh Location
            </button>
          </div>

          {/* Post Creation */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Create a New Post</h3>
            {postMessage && (
              <p className={`mb-4 text-center ${postMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {postMessage}
              </p>
            )}
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              ></textarea>
              <div>
                <input
                  type="text"
                  placeholder="Tag a location (e.g., 'Eko Atlantic, Lagos') (optional)"
                  value={postLocation}
                  onChange={(e) => setPostLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Region (optional)"
                  value={postRegion}
                  onChange={(e) => setPostRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="State (optional)"
                  value={postState}
                  onChange={(e) => setPostState(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="LGA (Local Government Area) (optional)"
                  value={postLga}
                  onChange={(e) => setPostLga(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ward (optional)"
                  value={postWard}
                  onChange={(e) => setPostWard(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Constituency (optional)"
                  value={postConstituency}
                  onChange={(e) => setPostConstituency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Post
              </button>
            </form>
          </div>

          {/* Gemini Integration */}
          <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Gemini AI Interaction</h3>
            <form onSubmit={handleGeminiPrompt} className="space-y-4">
              <textarea
                placeholder="Ask Gemini something..."
                value={geminiPrompt}
                onChange={(e) => setGeminiPrompt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
              ></textarea>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              >
                Ask Gemini
              </button>
            </form>
            {geminiResponse && (
              <div className="mt-4 p-4 bg-gray-100 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-700">Gemini's Response:</h4>
                <p className="text-gray-800 whitespace-pre-wrap">{geminiResponse}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Logout
          </button>

          <PostList isLoggedIn={isLoggedIn} currentUser={currentUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Join the Network</h2>
        {message && (
          <p className={`mb-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleRegister} className="space-y-4 mb-8">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl hover:bg-indigo-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Register
          </button>
        </form>

        <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Already have an account?</h3>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
