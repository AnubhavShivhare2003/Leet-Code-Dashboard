import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api } from '../services/api';

const StudentCard = () => {
  const { studentId } = useParams();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandAbout, setExpandAbout] = useState(false);

  // Determine back path based on state
  const backPath = location.state?.from === 'leaderboard' 
    ? '/leaderboard' 
    : location.state?.from === 'studentList' 
      ? `/students/${student?.college === 'RU University' ? 'ru' : student?.college === 'SU University' ? 'su' : 'all'}`
      : '/';

  const backLabel = location.state?.from === 'leaderboard'
    ? 'Back to Leaderboard'
    : location.state?.from === 'studentList'
      ? 'Back to Student List'
      : 'Back to Dashboard';
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);
        setExpandAbout(false);

        // 1. Fetch student basic info from backend
        const studentResult = await api.getUserById(studentId);
        
        if (!studentResult.success) {
          throw new Error(studentResult.message || 'Student not found');
        }
        
        const studentData = studentResult.data;
        setStudent(studentData);

        // 2. Fetch LeetCode detailed data using leetcodeProfileID
        const leetcodeResult = await api.getLeetCodeStats(studentData.leetcodeProfileID);
        
        if (leetcodeResult.status === 'success') {
          // Calculate dynamic yesterday submissions from calendar to avoid stale data
          let calculatedYesterdaySubs = leetcodeResult.data.yesterdaySubmissions || 0;
          
          if (leetcodeResult.data.submissionCalendar) {
            try {
              const calendar = typeof leetcodeResult.data.submissionCalendar === 'string' 
                ? JSON.parse(leetcodeResult.data.submissionCalendar) 
                : leetcodeResult.data.submissionCalendar;
                
              const now = new Date();
              const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
              const yesterdayTimestamp = Math.floor(todayUTC.getTime() / 1000) - 86400;
              
              // Check if the key exists (LeetCode uses unix timestamp as key)
              if (calendar[yesterdayTimestamp]) {
                calculatedYesterdaySubs = calendar[yesterdayTimestamp];
              } else {
                // If key is missing for yesterday, it means 0 submissions
                // Only overwrite if we have a valid calendar
                if (Object.keys(calendar).length > 0) {
                  calculatedYesterdaySubs = 0;
                }
              }
            } catch (e) {
              console.error('Error calculating yesterday submissions:', e);
            }
          }

          setLeetcodeData({
            status: 'success',
            totalSolved: leetcodeResult.data.totalSolved || 0,
            totalQuestions: leetcodeResult.data.totalQuestions || 0,
            easySolved: leetcodeResult.data.easySolved || 0,
            totalEasy: leetcodeResult.data.totalEasy || 0,
            mediumSolved: leetcodeResult.data.mediumSolved || 0,
            totalMedium: leetcodeResult.data.totalMedium || 0,
            hardSolved: leetcodeResult.data.hardSolved || 0,
            totalHard: leetcodeResult.data.totalHard || 0,
            acceptanceRate: leetcodeResult.data.acceptanceRate || 0,
            ranking: leetcodeResult.data.ranking || 0,
            yesterdaySubmissions: calculatedYesterdaySubs,
            yesterdayQuestionsSolved: leetcodeResult.data.yesterdayQuestionsSolved || 0,
            githubUrl: leetcodeResult.data.githubUrl || '',
            userAvatar: leetcodeResult.data.userAvatar || '',
            aboutMe: leetcodeResult.data.aboutMe || '',
            countryName: leetcodeResult.data.countryName || '',
            company: leetcodeResult.data.company || '',
            school: leetcodeResult.data.school || '',
            starRating: leetcodeResult.data.starRating || 0,
            badges: leetcodeResult.data.badges || [],
            recentSubmissions: leetcodeResult.data.recentSubmissions || [],
            contestRating: leetcodeResult.data.contestRating || 0,
            lastUpdated: leetcodeResult.data.lastUpdated,
            submissionCalendar: leetcodeResult.data.submissionCalendar || {}
          });
        } else {
          // If LeetCode data fails, we still have the student profile
          console.warn('LeetCode data fetch returned error status:', leetcodeResult.message);
          // Set a minimal leetcodeData to avoid crashes
          setLeetcodeData({ status: 'error' });
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAllData();
    }
  }, [studentId]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Loading Profile...</h2>
          <p className="text-gray-400 font-mono text-sm">Gathering coding statistics</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-gray-900/50 p-8 rounded-3xl border border-white/10 backdrop-blur-xl max-w-md w-full shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Profile Error</h2>
          <p className="text-gray-400 mb-8">{error || 'Student not found in our database'}</p>
          <Link 
            to={backPath}
            className="inline-flex items-center justify-center w-full bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!leetcodeData || leetcodeData.status === 'error') {
    return (
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to={backPath} className="inline-flex items-center mb-8 text-gray-400 hover:text-white transition-colors duration-300 group">
            <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </span>
            <span className="font-medium">{backLabel}</span>
          </Link>
          <div className="bg-gray-900/50 rounded-3xl shadow-2xl border border-white/10 p-12 text-center backdrop-blur-xl">
            <h2 className="text-3xl font-black text-white mb-4">{student.name}'s Profile</h2>
            <p className="text-gray-400 mb-8 text-lg">Could not load detailed LeetCode statistics at this moment.</p>
            <a href={student.leetcodeProfile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
              View on LeetCode <span className="ml-2">→</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black py-6 px-4 sm:px-6 lg:px-8 font-sans selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          to={backPath}
          className="inline-flex items-center mb-6 text-gray-400 hover:text-white transition-colors duration-300 group text-sm"
        >
          <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-2 group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-all border border-white/5 group-hover:border-purple-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </span>
          <span className="font-medium tracking-wide">{backLabel}</span>
        </Link>

        {/* Student Card */}
        <div className="bg-gray-900/40 rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 p-4 sm:p-6 border-b border-white/10 relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-purple-600/15 transition-colors duration-700"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 relative z-10">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                {leetcodeData.userAvatar ? (
                  <img 
                    src={leetcodeData.userAvatar} 
                    alt={student.name}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-gray-900 shadow-2xl object-cover ring-2 ring-white/10"
                  />
                ) : (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl border-4 border-gray-900 ring-2 ring-white/10">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {leetcodeData.starRating > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-gray-900">
                    ★ {leetcodeData.starRating}
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="text-center md:text-left flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 justify-center md:justify-start mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 tracking-tight truncate">
                    {student.name}
                  </h1>
                  {leetcodeData.countryName && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-medium text-gray-300 backdrop-blur-md self-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5 animate-pulse"></span>
                      {leetcodeData.countryName}
                    </span>
                  )}
                </div>
                <p className="text-sm text-purple-400/80 font-mono mb-2 tracking-wide">
                  @{student.leetcodeProfileID}
                </p>
                
                {/* School/Company */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 text-[10px] text-gray-400">
                  {leetcodeData.school && (
                    <span className="flex items-center px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <svg className="w-3 h-3 mr-1.5 text-purple-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>
                      {leetcodeData.school}
                    </span>
                  )}
                  {leetcodeData.company && (
                    <span className="flex items-center px-2.5 py-1 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                      <svg className="w-3 h-3 mr-1.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57c0 .542-.312 1.034-.792 1.259l-6.703 3.158a1 1 0 01-.99 0L4.292 12.83A1.372 1.372 0 013.5 11.57V8a2 2 0 012-2h1zm2 0h4V5a1 1 0 00-1-1H9a1 1 0 00-1 1v1z" clipRule="evenodd"/></svg>
                      {leetcodeData.company}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Profile Links */}
              <div className="flex flex-row md:flex-col gap-2">
                <a
                  href={student.leetcodeProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200 transition-all text-[10px] flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  LeetCode
                </a>
                {leetcodeData.githubUrl && (
                  <a
                    href={leetcodeData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#24292e] text-white px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700 transition-all text-[10px] flex items-center justify-center gap-1.5 border border-white/10"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Compact Content */}
          <div className="p-4 sm:p-6 space-y-4">
            
            {/* Top Row: Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center group hover:bg-white/[0.07] transition-all">
                <div className="text-xl font-black text-white">{leetcodeData.totalSolved}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Solved</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center group hover:bg-white/[0.07] transition-all">
                <div className="text-xl font-black text-white">{leetcodeData.acceptanceRate.toFixed(1)}%</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Acceptance</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center group hover:bg-white/[0.07] transition-all">
                <div className="text-lg font-black text-white truncate">#{leetcodeData.ranking.toLocaleString()}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Rank</div>
              </div>
              <div className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/20 text-center group hover:bg-emerald-500/10 transition-all">
                <div className="text-xl font-black text-emerald-400">{leetcodeData.yesterdayQuestionsSolved}</div>
                <div className="text-[10px] text-emerald-500/70 uppercase tracking-wider font-medium">Yest. Solved</div>
              </div>
            </div>

            {/* Main Grid: Chart/Breakdown vs Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Left Column: Visuals (1/3) */}
              <div className="space-y-4">
                {/* Pie Chart & Breakdown Combined */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                    <span className="w-1 h-3 bg-purple-500 rounded-full"></span>
                    Activity
                  </h3>
                  
                  <div className="flex items-center gap-4">
                    {/* Tiny Chart */}
                    <div className="h-24 w-24 relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Easy', value: leetcodeData.easySolved, color: '#10b981' },
                              { name: 'Medium', value: leetcodeData.mediumSolved, color: '#eab308' },
                              { name: 'Hard', value: leetcodeData.hardSolved, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={35}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {[
                              { name: 'Easy', value: leetcodeData.easySolved, color: '#10b981' },
                              { name: 'Medium', value: leetcodeData.mediumSolved, color: '#eab308' },
                              { name: 'Hard', value: leetcodeData.hardSolved, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{leetcodeData.totalSolved}</span>
                      </div>
                    </div>

                    {/* Breakdown Bars */}
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-emerald-400 font-medium">Easy</span>
                          <span className="text-gray-500">{leetcodeData.easySolved}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div style={{ width: `${leetcodeData.totalEasy > 0 ? (leetcodeData.easySolved / leetcodeData.totalEasy) * 100 : 0}%` }} className="h-full bg-emerald-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-yellow-400 font-medium">Medium</span>
                          <span className="text-gray-500">{leetcodeData.mediumSolved}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div style={{ width: `${leetcodeData.totalMedium > 0 ? (leetcodeData.mediumSolved / leetcodeData.totalMedium) * 100 : 0}%` }} className="h-full bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-red-400 font-medium">Hard</span>
                          <span className="text-gray-500">{leetcodeData.hardSolved}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div style={{ width: `${leetcodeData.totalHard > 0 ? (leetcodeData.hardSolved / leetcodeData.totalHard) * 100 : 0}%` }} className="h-full bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {leetcodeData.badges && leetcodeData.badges.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                      <span className="w-1 h-3 bg-yellow-500 rounded-full"></span>
                      Badges
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {leetcodeData.badges.slice(0, 6).map((badge, idx) => (
                        <div key={idx} className="w-8 h-8 bg-white/5 rounded-md p-1 border border-white/10 flex items-center justify-center" title={badge.displayName}>
                           <img src={badge.icon.startsWith('http') ? badge.icon : `https://leetcode.com${badge.icon}`} alt={badge.displayName} className="w-full h-full object-contain" />
                        </div>
                      ))}
                      {leetcodeData.badges.length > 6 && (
                        <div className="w-8 h-8 bg-white/5 rounded-md flex items-center justify-center text-[10px] text-gray-400 border border-white/10">
                          +{leetcodeData.badges.length - 6}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* About Me */}
                {leetcodeData.aboutMe && (
                  <div 
                    className={`bg-white/5 rounded-xl p-4 border border-white/10 ${leetcodeData.aboutMe.length > 100 ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}`}
                    onClick={() => leetcodeData.aboutMe.length > 100 && setExpandAbout(!expandAbout)}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-xs font-bold text-white">About</h3>
                      {leetcodeData.aboutMe.length > 100 && (
                        <span className="text-[10px] text-purple-400 font-medium">
                          {expandAbout ? 'Show Less' : 'Show More'}
                        </span>
                      )}
                    </div>
                    <p className={`text-gray-400 text-xs leading-relaxed ${expandAbout ? '' : 'line-clamp-3'}`}>
                      {leetcodeData.aboutMe}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Recent Submissions (2/3) */}
              <div className="lg:col-span-2">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 h-full">
                  <h3 className="text-xs font-bold text-white mb-3 flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                      Recent Activity
                    </span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400">Last 10</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                    {leetcodeData.recentSubmissions && leetcodeData.recentSubmissions.slice(0, 10).map((sub, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs border-b border-white/5 pb-2 last:border-0 md:last:border-b md:nth-last-2:border-0 md:nth-last-1:border-0">
                        <div className="truncate pr-2 flex-1">
                          <div className="text-gray-300 truncate hover:text-white transition-colors font-medium" title={sub.title}>{sub.title}</div>
                          <div className="text-[10px] text-gray-600">{new Date(sub.timestamp * 1000).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                          sub.statusDisplay === 'Accepted' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {sub.statusDisplay}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="text-gray-600 text-[10px]">
                Updated: {leetcodeData.lastUpdated ? new Date(leetcodeData.lastUpdated).toLocaleDateString() : 'Recently'}
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-[10px] font-bold uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
