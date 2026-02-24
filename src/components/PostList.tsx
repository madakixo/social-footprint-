import React, { useEffect, useState } from 'react';

interface PostListProps {
  isLoggedIn: boolean;
  currentUser: any; // Add currentUser prop
}

interface Post {
  id: string;
  userId: string;
  username: string;
  content: string;
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

export default function PostList({ isLoggedIn, currentUser }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [repostMessage, setRepostMessage] = useState('');

  const handleRepost = async (postId: string) => {
    if (!currentUser?.id) {
      setRepostMessage('You must be logged in to repost.');
      return;
    }

    try {
      const response = await fetch('/api/reposts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, postId }),
      });
      const data = await response.json();
      if (response.ok) {
        setRepostMessage(data.message);
        fetchPosts(); // Refresh posts to show new reposts
      } else {
        setRepostMessage(data.message || 'Failed to repost');
      }
    } catch (error) {
      console.error('Error reposting:', error);
      setRepostMessage('An error occurred while reposting');
    }
  };


  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (response.ok) {
        setPosts(data);
      } else {
        console.error('Failed to fetch posts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPosts();
    }
  }, [isLoggedIn]);

  return (
    <div className="mt-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Recent Posts</h3>
      {posts.length === 0 ? (
        <p className="text-gray-600">No posts yet. Be the first to post!</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-800 mb-2">{post.content}</p>
              <p className="text-sm text-gray-500">Posted by <span className="font-semibold">{post.username}</span> on {new Date(post.createdAt).toLocaleString()}</p>
              {post.location && (
                <p className="text-xs text-gray-400">Tagged Location: {post.location}</p>
              )}
              {post.latitude && post.longitude && (
                <p className="text-xs text-gray-400">Coordinates: {post.latitude}, {post.longitude}</p>
              )}
              {post.region && <p className="text-xs text-gray-400">Region: {post.region}</p>}
              {post.state && <p className="text-xs text-gray-400">State: {post.state}</p>}
              {post.lga && <p className="text-xs text-gray-400">LGA: {post.lga}</p>}
              {post.ward && <p className="text-xs text-gray-400">Ward: {post.ward}</p>}
              {post.constituency && <p className="text-xs text-gray-400">Constituency: {post.constituency}</p>}
              {isLoggedIn && (
                <button
                  onClick={() => handleRepost(post.id)}
                  className="mt-2 text-sm text-blue-600 hover:underline focus:outline-none"
                >
                  Repost
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
