import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useParams, Link } from 'react-router-dom';

const StudentCard = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch student basic info from backend
        const studentRes = await fetch(`http://localhost:4000/api/users/user/${studentId}`);
        if (!studentRes.ok) {
          throw new Error(`Failed to fetch student profile: ${studentRes.statusText}`);
        }
        const studentResult = await studentRes.json();
        
        if (!studentResult.success) {
          throw new Error(studentResult.message || 'Student not found');
        }
        
        const studentData = studentResult.data;
        setStudent(studentData);

        // 2. Fetch LeetCode detailed data using leetcodeProfileID
        const leetcodeRes = await fetch(`http://localhost:4000/api/leetcode/user/${studentData.leetcodeProfileID}`);
        if (!leetcodeRes.ok) {
          throw new Error(`Failed to fetch LeetCode statistics: ${leetcodeRes.statusText}`);
        }
        const leetcodeResult = await leetcodeRes.json();
        
        if (leetcodeResult.status === 'success') {
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
            contributionPoints: leetcodeResult.data.contributionPoints || 0,
            reputation: leetcodeResult.data.reputation || 0,
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
            lastUpdated: leetcodeResult.data.lastUpdated
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Profile...</h2>
          <p className="text-gray-400">Gathering coding statistics and profile data</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center bg-gray-900/50 p-8 rounded-2xl border border-white/20 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-4">Profile Error</h2>
          <p className="text-gray-400 mb-6">{error || 'Student not found in our database'}</p>
          <Link 
            to="/" 
            className="inline-block bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  if (!leetcodeData || leetcodeData.status === 'error') {
    return (
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center mb-8 text-gray-400 hover:text-white transition-colors duration-300 group">
            <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to Students
          </Link>
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">{student.name}'s Profile</h2>
            <p className="text-gray-400 mb-6">Could not load detailed LeetCode statistics at this moment.</p>
            <a href={student.leetcodeProfile} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300">
              View on LeetCode
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link 
          to="/" 
          className="inline-flex items-center mb-8 text-gray-400 hover:text-white transition-colors duration-300 group"
        >
          <span className="mr-2 group-hover:-translate-x-1 transition-transform duration-300">←</span>
          Back to Students
        </Link>

        {/* Student Card */}
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 p-6 sm:p-8 border-b border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                {leetcodeData.userAvatar ? (
                  <img 
                    src={leetcodeData.userAvatar} 
                    alt={student.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/20 shadow-xl object-cover grayscale"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 flex items-center justify-center text-white text-4xl sm:text-5xl font-bold shadow-lg backdrop-blur-sm border-4 border-white/20">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {leetcodeData.starRating > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-white text-black text-xs font-bold px-2 py-0.5 rounded-full shadow-md border border-black">
                    ★ {leetcodeData.starRating}
                  </div>
                )}
              </div>
              
              {/* Basic Info */}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white">
                    {student.name}
                  </h1>
                  {leetcodeData.countryName && (
                    <span className="text-white/60 text-sm font-medium px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                      {leetcodeData.countryName}
                    </span>
                  )}
                </div>
                <p className="text-lg sm:text-xl text-white/70 font-mono mb-2">
                  @{student.leetcodeProfileID}
                </p>
                
                {/* School/Company */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-white/50 text-sm">
                  {leetcodeData.school && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z"/></svg>
                      {leetcodeData.school}
                    </span>
                  )}
                  {leetcodeData.company && (
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57c0 .542-.312 1.034-.792 1.259l-6.703 3.158a1 1 0 01-.99 0L4.292 12.83A1.372 1.372 0 013.5 11.57V8a2 2 0 012-2h1zm2 0h4V5a1 1 0 00-1-1H9a1 1 0 00-1 1v1z" clipRule="evenodd"/></svg>
                      {leetcodeData.company}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Profile Links */}
              <div className="flex flex-col gap-3">
                <a
                  href={student.leetcodeProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-black px-6 py-2.5 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300 hover:scale-105 transform shadow-lg text-center text-sm"
                >
                  LeetCode Profile
                </a>
                {leetcodeData.githubUrl && (
                  <a
                    href={leetcodeData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-800 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-700 transition-all duration-300 hover:scale-105 transform shadow-lg text-center text-sm flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {/* About Me Section (if available) */}
            {leetcodeData.aboutMe && (
              <div className="mb-8 bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {leetcodeData.aboutMe}
                </p>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{leetcodeData.totalSolved}</div>
                <div className="text-sm text-white/40">Solved</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{leetcodeData.acceptanceRate.toFixed(1)}%</div>
                <div className="text-sm text-white/40">Acceptance</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">#{leetcodeData.ranking > 0 ? leetcodeData.ranking.toLocaleString() : 'N/A'}</div>
                <div className="text-sm text-white/40">Rank</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{leetcodeData.contributionPoints}</div>
                <div className="text-sm text-white/40">Points</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                <div className="text-2xl font-bold text-white">{leetcodeData.reputation}</div>
                <div className="text-sm text-white/40">Reputation</div>
              </div>
            </div>

            {/* Badges Section */}
            {leetcodeData.badges && leetcodeData.badges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white/40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                  Achievements & Badges
                </h3>
                <div className="flex flex-wrap gap-4">
                  {leetcodeData.badges.map((badge, idx) => (
                    <div key={idx} className="group relative">
                      <div className="w-16 h-16 bg-white/5 rounded-lg p-2 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors duration-300 cursor-help grayscale">
                        {badge.icon.startsWith('http') ? (
                          <img src={badge.icon} alt={badge.displayName} className="w-12 h-12 object-contain" />
                        ) : (
                          <img src={`https://leetcode.com${badge.icon}`} alt={badge.displayName} className="w-12 h-12 object-contain" />
                        )}
                      </div>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-10 pointer-events-none shadow-xl border border-white/10">
                        {badge.displayName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Content Grid: Chart + Recent Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pie Chart */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Problem Difficulty</h3>
                <div className="h-64">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-full text-white/40">
                      Unable to load chart data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Easy', value: leetcodeData.easySolved, color: '#ffffff' },
                            { name: 'Medium', value: leetcodeData.mediumSolved, color: '#a1a1aa' },
                            { name: 'Hard', value: leetcodeData.hardSolved, color: '#3f3f46' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            { name: 'Easy', value: leetcodeData.easySolved, color: '#ffffff' },
                            { name: 'Medium', value: leetcodeData.mediumSolved, color: '#a1a1aa' },
                            { name: 'Hard', value: leetcodeData.hardSolved, color: '#3f3f46' }
                          ].map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              className="hover:opacity-80 transition-opacity duration-300"
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name) => [`${value} problems`, name]}
                          contentStyle={{ 
                            backgroundColor: '#000000', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#ffffff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                          }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                        {/* Center Text */}
                        <text
                          x="50%"
                          y="50%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white font-bold text-2xl"
                        >
                          {leetcodeData.totalSolved}
                        </text>
                        <text
                          x="50%"
                          y="62%"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-white/40 text-[10px] uppercase tracking-widest"
                        >
                          Solved
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-white">{leetcodeData.easySolved}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Easy</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-400">{leetcodeData.mediumSolved}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Medium</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-600">{leetcodeData.hardSolved}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/40 font-medium">Hard</div>
                  </div>
                </div>
              </div>

              {/* Recent Submissions */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                  Recent Submissions
                  <span className="text-xs font-normal text-white/40 bg-white/5 px-2 py-1 rounded">Last 10</span>
                </h3>
                <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {leetcodeData.recentSubmissions && leetcodeData.recentSubmissions.length > 0 ? (
                    leetcodeData.recentSubmissions.map((sub, idx) => (
                      <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 group">
                        <div className="flex-1 min-w-0 mr-4">
                          <div className="text-white text-sm font-semibold truncate mb-1.5 group-hover:text-white transition-colors" title={sub.title}>
                            {sub.title}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              sub.statusDisplay === 'Accepted' ? 'bg-white text-black' : 'bg-white/10 text-white/60'
                            }`}>
                              {sub.statusDisplay}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono bg-white/5 px-1.5 py-0.5 rounded uppercase">{sub.lang}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex flex-col justify-center border-l border-white/10 pl-4">
                          <div className="text-[11px] text-white/60 font-medium">
                            {new Date(sub.timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="text-[10px] text-white/20 font-mono">
                            {new Date(sub.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-white/20 py-8">
                      <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <p className="text-sm">No recent submissions found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Problem Breakdown Bars */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-6">Problem Completion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Easy Problems */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-bold tracking-tight">Easy</span>
                    <span className="text-white text-sm font-mono bg-white/10 px-2 py-0.5 rounded-md">{leetcodeData.easySolved}/{leetcodeData.totalEasy}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                      style={{ width: `${leetcodeData.totalEasy > 0 ? (leetcodeData.easySolved / leetcodeData.totalEasy) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest mt-3 font-medium">
                    {leetcodeData.totalEasy > 0 ? ((leetcodeData.easySolved / leetcodeData.totalEasy) * 100).toFixed(1) : 0}% Complete
                  </div>
                </div>

                {/* Medium Problems */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70 font-bold tracking-tight">Medium</span>
                    <span className="text-white/70 text-sm font-mono bg-white/10 px-2 py-0.5 rounded-md">{leetcodeData.mediumSolved}/{leetcodeData.totalMedium}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className="bg-white/60 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${leetcodeData.totalMedium > 0 ? (leetcodeData.mediumSolved / leetcodeData.totalMedium) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest mt-3 font-medium">
                    {leetcodeData.totalMedium > 0 ? ((leetcodeData.mediumSolved / leetcodeData.totalMedium) * 100).toFixed(1) : 0}% Complete
                  </div>
                </div>

                {/* Hard Problems */}
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-colors"></div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/40 font-bold tracking-tight">Hard</span>
                    <span className="text-white/40 text-sm font-mono bg-white/10 px-2 py-0.5 rounded-md">{leetcodeData.hardSolved}/{leetcodeData.totalHard}</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className="bg-white/20 h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${leetcodeData.totalHard > 0 ? (leetcodeData.hardSolved / leetcodeData.totalHard) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <div className="text-white/40 text-[10px] uppercase tracking-widest mt-3 font-medium">
                    {leetcodeData.totalHard > 0 ? ((leetcodeData.hardSolved / leetcodeData.totalHard) * 100).toFixed(1) : 0}% Complete
                  </div>
                </div>
              </div>
            </div>

            {/* Footer with Last Updated */}
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-white/30 text-xs flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Last updated: {leetcodeData.lastUpdated ? new Date(leetcodeData.lastUpdated).toLocaleString() : 'Recently'}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-white/40 text-xs font-medium">Profile Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default StudentCard;