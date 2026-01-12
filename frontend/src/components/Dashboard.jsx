import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleCollegeSelect = (college) => {
    // Map college name to URL param
    const param = college === 'All' ? 'all' : college === 'RU University' ? 'ru' : 'su';
    navigate(`/students/${param}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center">
      {/* Dashboard Header & Filter */}
      <div className="w-full px-4 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto w-full">
          <div className="text-center space-y-4">
            <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-6xl md:text-7xl mb-4 transition-all duration-700">
             Leetcode Dashboard
            </h1>
            <p className="text-gray-400 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Select your university to view student progress and statistics
            </p>
          </div>
          
          {/* College Selection Cards */}
          <div className="grid gap-6 w-full max-w-4xl grid-cols-1 md:grid-cols-3 mt-12">
            {['All', 'RU University', 'SU University'].map((college) => (
              <button
                key={college}
                onClick={() => handleCollegeSelect(college)}
                className="group relative overflow-hidden rounded-2xl transition-all duration-500 p-8 bg-gray-800/40 border border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/60 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2"
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 transition-transform duration-500 group-hover:scale-110 ${
                    college === 'All' ? 'bg-blue-500/20 text-blue-400' :
                    college === 'RU University' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-pink-500/20 text-pink-400'
                  }`}>
                    {college === 'All' ? '🌍' : college === 'RU University' ? '🏛️' : '🎓'}
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {college === 'All' ? 'All Students' : college}
                  </h3>
                  <p className="text-sm text-gray-500 text-center group-hover:text-gray-400">
                    {college === 'All' ? 'View analytics for all registered students' : `View students from ${college}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
