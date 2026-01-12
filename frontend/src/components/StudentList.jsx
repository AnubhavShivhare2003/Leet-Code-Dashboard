import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const result = await api.getUsers();
        if (result.success) {
          setStudents(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch students');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const getColorTheme = (index) => {
    return 'from-gray-600 to-gray-800';
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.leetcodeProfileID.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800 rounded-xl border border-red-500/50">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Students</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="text-center mb-16 relative"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] -z-10"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-gray-400 tracking-tight">
            Student Showcase
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Discover the coding journey of our talented developers
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or username..."
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm shadow-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Students Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredStudents.map((student) => (
              <motion.div
                key={student._id}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                viewport={{ once: true, margin: "0px" }}
                style={{ willChange: "transform, opacity" }}
              >
                <Link
                  to={`/student/${student._id}`}
                  className="group relative block bg-gray-800/40 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] hover:-translate-y-1 h-full"
                >
                  {/* Card Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  <div className="p-6 relative z-10 flex flex-col h-full">
                    {/* Header: Avatar & Info */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        {student.userAvatar ? (
                          <img 
                            src={student.userAvatar} 
                            alt={student.name}
                            className="w-16 h-16 rounded-full border-2 border-white/10 shadow-lg object-cover group-hover:border-purple-500/50 transition-colors duration-300"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl font-bold text-white border-2 border-white/10 shadow-lg group-hover:border-purple-500/50 transition-colors duration-300">
                            {student.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {student.ranking > 0 && student.ranking < 100000 && (
                          <div className="absolute -bottom-1 -right-1 bg-yellow-500/90 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-yellow-400">
                            Top
                          </div>
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold text-white truncate group-hover:text-purple-400 transition-colors duration-300">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono truncate mb-1">
                          @{student.leetcodeProfileID}
                        </p>
                        {student.countryName && (
                          <div className="flex items-center text-xs text-gray-400 gap-1 truncate">
                            <span>📍 {student.countryName}</span>
                          </div>
                        )}
                        {student.school && (
                          <div className="flex items-center text-xs text-gray-500 gap-1 truncate mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <span className="truncate">{student.school}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Solved</div>
                        <div className="text-xl font-black text-white group-hover:text-purple-300 transition-colors">
                          {student.totalSolved || 0}
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Rank</div>
                        <div className="text-sm font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                          {student.ranking ? `#${student.ranking.toLocaleString()}` : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Difficulty Bars (Mini Visualization) */}
                    <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-gray-700/50 mb-6">
                      <div style={{ width: `${(student.easySolved / (student.totalSolved || 1)) * 100}%` }} className="bg-emerald-500/70"></div>
                      <div style={{ width: `${(student.mediumSolved / (student.totalSolved || 1)) * 100}%` }} className="bg-yellow-500/70"></div>
                      <div style={{ width: `${(student.hardSolved / (student.totalSolved || 1)) * 100}%` }} className="bg-red-500/70"></div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4 mt-auto">
                      <div className="flex flex-col">
                        {student.contestRating > 0 ? (
                          <span className="text-yellow-500/90 font-medium flex items-center gap-1.5" title="Contest Rating">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>
                            Rating: {Math.round(student.contestRating)}
                          </span>
                        ) : student.reputation > 0 ? (
                          <span className="text-blue-400/90 font-medium flex items-center gap-1.5" title="LeedCode Reputation">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                            Reputation: {student.reputation}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-medium flex items-center gap-1.5" title="Acceptance Rate">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Acc. Rate: {student.acceptanceRate ? student.acceptanceRate.toFixed(1) : 0}%
                          </span>
                        )}
                      </div>
                      <span className="flex items-center text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        View Profile →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredStudents.length === 0 && !loading && (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No students found</h3>
            <p className="text-gray-400">Try adjusting your search criteria</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentList;