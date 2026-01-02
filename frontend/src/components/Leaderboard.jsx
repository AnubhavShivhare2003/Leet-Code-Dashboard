import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all leaderboard data from our backend
        const response = await fetch(`http://localhost:4000/api/leetcode/leaderboard`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
          setLeaderboardData(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch leaderboard data');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-400 text-2xl mb-4">Error loading leaderboard</div>
            <div className="text-gray-400">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="w-full mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Leaderboard</h1>
          <p className="text-gray-400">Ranked by total problems solved</p>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden w-full">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 bg-gray-700/50 px-4 md:px-6 py-4 font-semibold text-gray-300">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-3 text-center">Problems Solved</div>
            <div className="col-span-3 text-center">Global Rank</div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden bg-gray-700/50 px-4 py-3 font-semibold text-gray-300 text-center">
            Leaderboard
          </div>

          {leaderboardData.map((student, index) => (
            <Link
              key={student._id}
              to={`/student/${student._id}`}
              className="block md:grid grid-cols-12 px-4 md:px-6 py-4 hover:bg-gray-700/30 transition-colors duration-200 border-b border-gray-700 last:border-b-0"
            >
              {/* Mobile View */}
              <div className="md:hidden">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                      index === 1 ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50' :
                      index === 2 ? 'bg-amber-900/20 text-amber-400 border border-amber-700/50' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-white text-sm truncate">{student.name}</div>
                      <div className="text-xs text-gray-400 truncate">@{student.leetcodeProfileID}</div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-md font-bold text-purple-400">
                      {student.totalSolved}
                    </div>
                    <div className="text-xs text-gray-400">solved</div>
                  </div>
                </div>
              </div>

              {/* Desktop View */}
              <div className="hidden md:flex col-span-1 items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                  index === 1 ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50' :
                  index === 2 ? 'bg-amber-900/20 text-amber-400 border border-amber-700/50' :
                  'bg-gray-600/20 text-gray-300'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              <div className="hidden md:flex col-span-5 items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{student.name}</div>
                    <div className="text-sm text-gray-400">@{student.leetcodeProfileID}</div>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex col-span-3 items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {student.totalSolved}
                  </div>
                  <div className="text-xs text-gray-400">solved</div>
                </div>
              </div>

              <div className="hidden md:flex col-span-3 items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-400">
                    #{student.ranking?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">global</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          {leaderboardData.length} students ranked • Updated in real-time
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;