import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const FilterIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
);

const SortIcon = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
);

const FilterDropdown = ({ options, value, onChange, icon: Icon, minWidth = "min-w-[200px]" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-20'}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between ${minWidth} space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl transition-all duration-300 backdrop-blur-xl group ${isOpen ? 'bg-white/10 border-white/20 ring-1 ring-white/10' : ''}`}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />}
          <span className="font-medium text-sm text-gray-300 group-hover:text-white transition-colors truncate">
            {selectedOption?.label}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] z-50 backdrop-blur-xl ring-1 ring-white/5 ${minWidth}`}
          >
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-all flex items-center justify-between group/item ${
                    value === option.value
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                     {option.icon && <option.icon className={`w-4 h-4 ${value === option.value ? 'text-purple-400' : 'text-gray-500 group-hover/item:text-white'}`} />}
                     {option.label}
                  </span>
                  {value === option.value && (
                    <motion.svg 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="w-4 h-4 text-purple-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total'); // 'total', 'yesterdaySubmissions', 'yesterdayQuestions', 'points'
  const [selectedCollege, setSelectedCollege] = useState('All'); // 'All', 'RU University', 'SU University'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const collegeOptions = [
    { value: 'All', label: 'All Students' },
    { value: 'RU University', label: 'RU University' },
    { value: 'SU University', label: 'SU University' }
  ];

  const sortOptions = [
    { value: 'total', label: 'Total Solved' },
    { value: 'yesterdaySubmissions', label: 'Submissions (Yesterday)' },
    { value: 'yesterdayQuestions', label: 'Questions (Yesterday)' }
  ];

  // Initial Load & Filter Change
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setPage(1);
        
        // Fetch leaderboard data with pagination
        const data = await api.getLeaderboard({ 
          page: 1, 
          limit: 20, 
          sortBy, 
          college: selectedCollege 
        });
        
        if (data.status === 'success') {
          setLeaderboardData(data.data);
          setMeta(data.meta);
          setHasMore(data.meta.pagination.page < data.meta.pagination.totalPages);
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

    fetchInitialData();
  }, [sortBy, selectedCollege]);

  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMore) return;
    
    try {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      
      const data = await api.getLeaderboard({ 
        page: nextPage, 
        limit: 20, 
        sortBy, 
        college: selectedCollege 
      });
      
      if (data.status === 'success') {
        setLeaderboardData(prev => [...prev, ...data.data]);
        setPage(nextPage);
        setHasMore(data.meta.pagination.page < data.meta.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching more data:', err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Removed client-side filtering and sorting since backend handles it now
  const sortedData = leaderboardData; 


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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 to-black text-white overflow-x-hidden">
      <div className="w-full mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-4xl md:text-6xl mb-6">
            Leaderboard
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {sortBy === 'total' ? (
              'Ranked by total problems solved'
            ) : (
              <span>
                Ranked by {sortBy === 'yesterdaySubmissions' ? 'total submissions' : 'questions solved'} on
                <span className="block sm:inline font-semibold text-white/90 mt-1 sm:mt-0"> {meta?.yesterdayDate || 'yesterday'}</span>
              </span>
            )}
          </p>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 relative z-20">
          <FilterDropdown 
            options={collegeOptions}
            value={selectedCollege}
            onChange={setSelectedCollege}
            icon={FilterIcon}
            minWidth="min-w-[240px]"
          />
          
          <FilterDropdown 
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            icon={SortIcon}
            minWidth="min-w-[260px]"
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-transparent lg:bg-gradient-to-b lg:from-gray-900/80 lg:to-black/80 lg:rounded-3xl lg:border lg:border-white/10 lg:overflow-hidden w-full lg:shadow-2xl backdrop-blur-md"
        >
          {/* Header Row */}
          <div className="hidden lg:grid grid-cols-12 bg-black/40 px-6 py-5 font-bold text-gray-400 uppercase tracking-wider text-xs border-b border-white/10">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-5 text-center">
              {sortBy === 'total' && 'Total Solved'}
              {sortBy === 'yesterdaySubmissions' && 'Submissions (Y)'}
              {sortBy === 'yesterdayQuestions' && 'Questions (Y)'}
            </div>
            <div className="col-span-1 text-center">Global Rank</div>
          </div>

          <div className="space-y-3 lg:space-y-0 lg:divide-y lg:divide-white/5">
            <AnimatePresence mode='wait'>
              {sortedData.map((student, index) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index < 10 ? index * 0.05 : 0 }}
                >
                  <Link
                    to={`/student/${student._id}`}
                    state={{ from: 'leaderboard' }}
                    className="block lg:grid grid-cols-12 p-4 lg:px-6 lg:py-5 bg-gradient-to-br from-gray-800/40 to-black/40 lg:bg-transparent rounded-2xl lg:rounded-none border border-white/10 lg:border-0 hover:bg-white/5 transition-all duration-300 group backdrop-blur-sm"
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
                              <div className="text-base font-black leading-tight text-purple-400 whitespace-nowrap">
                                {student.totalSolved} <span className="text-[8px] uppercase tracking-tighter ml-1">Total</span>
                              </div>
                            )}
                            {sortBy === 'yesterdaySubmissions' && (
                              <div className="text-base font-black leading-tight text-blue-400 whitespace-nowrap">
                                {student.yesterdaySubmissions} <span className="text-[8px] uppercase tracking-tighter ml-1">Submissions (Y)</span>
                              </div>
                            )}
                            {sortBy === 'yesterdayQuestions' && (
                              <div className="text-base font-black leading-tight text-emerald-400 whitespace-nowrap">
                                {student.yesterdayQuestionsSolved} <span className="text-[8px] uppercase tracking-tighter ml-1">Questions (Y)</span>
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
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="mt-12 flex flex-col items-center space-y-6 text-center">
          {hasMore && (
            <button 
              onClick={handleLoadMore}
              disabled={isFetchingMore}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {isFetchingMore ? (
                <span className="flex items-center space-x-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Loading...</span>
                </span>
              ) : (
                'Load More Students'
              )}
            </button>
          )}

          <div className="inline-block bg-black/40 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
            <span className="text-purple-400 font-bold">{meta?.pagination?.total || leaderboardData.length}</span>
            <span className="text-gray-400 ml-2">Students Ranked • Updated in Real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
