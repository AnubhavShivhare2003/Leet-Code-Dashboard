import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total'); // 'total' or 'yesterday'

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all leaderboard data from our backend
        const response = await fetch(`https://leet-code-dashboard.onrender.com/api/leetcode/leaderboard`);
        
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

  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortBy === 'yesterday') {
      if (b.yesterdaySolved !== a.yesterdaySolved) {
        return b.yesterdaySolved - a.yesterdaySolved;
      }
    }
    // Secondary sort by totalSolved if yesterday is equal
    if (b.totalSolved !== a.totalSolved) {
      return b.totalSolved - a.totalSolved;
    }
    // Tertiary sort by ranking
    return (a.ranking || 2147483647) - (b.ranking || 2147483647);
  });

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
          <p className="text-gray-400">
            {sortBy === 'total' ? 'Ranked by total problems solved' : 'Ranked by problems solved yesterday'}
          </p>
        </div>

        {/* Toggle Feature */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/80 p-1.5 rounded-2xl border border-gray-700/50 flex backdrop-blur-sm shadow-xl">
            <button
              onClick={() => setSortBy('total')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                sortBy === 'total' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>All Time</span>
            </button>
            <button
              onClick={() => setSortBy('yesterday')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                sortBy === 'yesterday' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Yesterday</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden w-full backdrop-blur-sm shadow-2xl">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 bg-gray-700/50 px-6 py-5 font-bold text-gray-300 uppercase tracking-wider text-xs">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-3 text-center">
              {sortBy === 'total' ? 'Problems Solved' : 'Solved Yesterday'}
            </div>
            <div className="col-span-3 text-center">Global Rank</div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden bg-gray-700/50 px-4 py-4 font-bold text-gray-300 text-center uppercase tracking-widest text-xs">
            {sortBy === 'total' ? 'Leaderboard (All Time)' : 'Leaderboard (Yesterday)'}
          </div>

          <div className="divide-y divide-gray-700/50">
            {sortedData.map((student, index) => (
              <Link
                key={student._id}
                to={`/student/${student._id}`}
                className="block md:grid grid-cols-12 px-4 md:px-6 py-5 hover:bg-white/5 transition-all duration-300 group"
              >
                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' :
                        index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-400/50' :
                        index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/50' :
                        'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xs uppercase">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm truncate group-hover:text-purple-400 transition-colors">{student.name}</div>
                        <div className="text-xs text-gray-500 truncate font-mono">@{student.leetcodeProfileID}</div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className={`text-lg font-black ${sortBy === 'yesterday' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {sortBy === 'total' ? student.totalSolved : student.yesterdaySolved}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
                        {sortBy === 'total' ? 'total' : 'yesterday'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden md:flex col-span-1 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' :
                    index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-400/50' :
                    index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/50' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="hidden md:flex col-span-5 items-center">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-bold text-sm uppercase">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-400 transition-colors duration-300">{student.name}</div>
                      <div className="text-sm text-gray-500 font-mono">@{student.leetcodeProfileID}</div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex col-span-3 items-center justify-center">
                  <div className="text-center group-hover:scale-110 transition-transform duration-300">
                    <div className={`text-3xl font-black ${sortBy === 'yesterday' ? 'text-blue-400' : 'text-purple-400'}`}>
                      {sortBy === 'total' ? student.totalSolved : student.yesterdaySolved}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                      {sortBy === 'total' ? 'Solved Total' : 'Solved Yesterday'}
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex col-span-3 items-center justify-center">
                  <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      #{student.ranking > 0 && student.ranking !== 2147483647 ? student.ranking.toLocaleString() : 'N/A'}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Global Rank</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-gray-800/50 px-6 py-3 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
            <span className="text-purple-400 font-bold">{leaderboardData.length}</span>
            <span className="text-gray-400 ml-2">Students Ranked • Updated in Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;