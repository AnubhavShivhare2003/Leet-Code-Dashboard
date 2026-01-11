import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total'); // 'total', 'yesterdaySubmissions', 'yesterdayQuestions', 'points'

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all leaderboard data from our backend
        const data = await api.getLeaderboard();
        
        if (data.status === 'success') {
          setLeaderboardData(data.data);
          setMeta(data.meta);
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
    if (sortBy === 'yesterdaySubmissions') {
      if (b.yesterdaySubmissions !== a.yesterdaySubmissions) {
        return b.yesterdaySubmissions - a.yesterdaySubmissions;
      }
    } else if (sortBy === 'yesterdayQuestions') {
      if (b.yesterdayQuestionsSolved !== a.yesterdayQuestionsSolved) {
        return b.yesterdayQuestionsSolved - a.yesterdayQuestionsSolved;
      }
    }
    
    // Default / Secondary sort by totalSolved
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
            {sortBy === 'total' 
              ? 'Ranked by total problems solved' 
              : sortBy === 'yesterdaySubmissions'
              ? `Ranked by total submissions on ${meta?.yesterdayDate || 'yesterday'}`
              : `Ranked by  questions solved on ${meta?.yesterdayDate || 'yesterday'}`}
          </p>
        </div>

        {/* Toggle Feature */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/80 p-1.5 rounded-2xl border border-gray-700/50 flex flex-wrap justify-center gap-2 backdrop-blur-sm shadow-xl">
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
              <span>Total Solved</span>
            </button>
            <button
              onClick={() => setSortBy('yesterdaySubmissions')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                sortBy === 'yesterdaySubmissions' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Submissions (Yesterday)</span>
            </button>
            <button
              onClick={() => setSortBy('yesterdayQuestions')}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                sortBy === 'yesterdayQuestions' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg scale-105' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Questions (Yesterday)</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden w-full shadow-2xl">
          {/* Header Row */}
          <div className="hidden lg:grid grid-cols-12 bg-gray-700/50 px-6 py-5 font-bold text-gray-300 uppercase tracking-wider text-xs">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-5 text-center">
              {sortBy === 'total' && 'Total Solved'}
              {sortBy === 'yesterdaySubmissions' && 'Submissions (Y)'}
              {sortBy === 'yesterdayQuestions' && 'Questions (Y)'}
            </div>
            <div className="col-span-1 text-center">Global Rank</div>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden bg-gray-700/50 px-4 py-4 font-bold text-gray-300 text-center uppercase tracking-widest text-xs">
            {sortBy === 'total' 
              ? 'Leaderboard (All Time)' 
              : sortBy === 'yesterdaySubmissions' 
              ? 'Submissions (Yesterday)' 
              : 'Questions (Yesterday)'}
          </div>

          <div className="divide-y divide-gray-700/50">
            {sortedData.map((student, index) => (
              <Link
                key={student._id}
                to={`/student/${student._id}`}
                className="block lg:grid grid-cols-12 px-4 md:px-6 py-5 hover:bg-white/5 transition-all duration-300 group"
              >
                {/* Mobile View */}
                <div className="lg:hidden">
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
                    <div className="text-right flex-shrink-0 ml-4 flex flex-col justify-center">
                      <div className="flex flex-col items-end">
                        {sortBy === 'total' && (
                          <div className="text-base font-black leading-tight text-purple-400">
                            {student.totalSolved} <span className="text-[8px] uppercase tracking-tighter">Total</span>
                          </div>
                        )}
                        {sortBy === 'yesterdaySubmissions' && (
                          <div className="text-base font-black leading-tight text-blue-400">
                            {student.yesterdaySubmissions} <span className="text-[8px] uppercase tracking-tighter">Submissions (Y)</span>
                          </div>
                        )}
                        {sortBy === 'yesterdayQuestions' && (
                          <div className="text-base font-black leading-tight text-emerald-400">
                            {student.yesterdayQuestionsSolved} <span className="text-[8px] uppercase tracking-tighter">Questions (Y)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop View */}
                <div className="hidden lg:flex col-span-1 items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                    index === 0 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' :
                    index === 1 ? 'bg-gray-300/20 text-gray-300 border border-gray-400/50' :
                    index === 2 ? 'bg-amber-700/20 text-amber-500 border border-amber-600/50' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="hidden lg:flex col-span-5 items-center">
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

                <div className="hidden lg:flex col-span-5 items-center justify-center">
                  <div className="text-center group-hover:scale-110 transition-transform duration-300">
                    {sortBy === 'total' && (
                      <>
                        <div className="text-2xl font-black text-purple-400">
                          {student.totalSolved}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                          Total Solved
                        </div>
                      </>
                    )}
                    {sortBy === 'yesterdaySubmissions' && (
                      <>
                        <div className="text-2xl font-black text-blue-400">
                          {student.yesterdaySubmissions}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                          Submissions (Y)
                        </div>
                      </>
                    )}
                    {sortBy === 'yesterdayQuestions' && (
                      <>
                        <div className="text-2xl font-black text-emerald-400">
                          {student.yesterdayQuestionsSolved}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">
                          Questions (Y)
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="hidden lg:flex col-span-1 items-center justify-center border-l border-gray-700/30">
                  <div className="text-center opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="text-sm font-bold text-gray-400 font-mono">
                      #{student.ranking > 0 && student.ranking !== 2147483647 ? student.ranking.toLocaleString() : 'N/A'}
                    </div>
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