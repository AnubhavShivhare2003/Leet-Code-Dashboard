import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://leet-code-dashboard.onrender.com/api/users/users');
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const result = await response.json();
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
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            LeetCode Students
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Discover and connect with talented developers showcasing their exceptional problem-solving skills
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search students by name or username..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Students Grid or No Results */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredStudents.map((student, index) => (
              <Link
                key={student._id}
                to={`/student/${student._id}`}
                className="group relative bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-4 sm:p-6 border border-gray-700 hover:border-gray-400 overflow-hidden block"
              >
              {/* Accent bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-600"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                {/* Profile avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Student info */}
                <div className="text-center mb-4 flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:text-gray-300 transition-colors duration-300 line-clamp-1">
                    {student.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 bg-gray-700 px-2 sm:px-3 py-1 rounded-full inline-block font-mono border border-gray-600 mb-3">
                    @{student.leetcodeProfileID}
                  </p>
                  
                  {/* LeetCode Profile Link */}
                  <div className="mt-3">
                    <a 
                      href={student.leetcodeProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs text-gray-400 hover:text-gray-300 transition-colors duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View LeetCode Profile
                    </a>
                  </div>
                </div>

                {/* Action button */}
                <div className="text-center mt-auto pt-4">
                  <div className="inline-block bg-gray-700 text-white font-semibold text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-gray-600 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 transform w-full max-w-xs mx-auto text-center">
                    View Details
                    <span className="ml-1 sm:ml-2 text-xs sm:text-sm inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gray-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
            </Link>
          ))}
        </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex flex-col items-center justify-center">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.86-6.09 2.28" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No students found</h3>
              <p className="text-gray-400 max-w-md">
                No students match your search for "{searchTerm}". Try a different name or username.
              </p>
            </div>
          </div>
        )}

        {/* Stats and footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <p className="text-gray-400 text-sm sm:text-base">
              Showing <span className="text-gray-300 font-semibold">{filteredStudents.length}</span> talented developers
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Live backend connection active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;