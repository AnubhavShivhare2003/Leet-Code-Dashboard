const mongoose = require('mongoose');

const leetcodeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  // Profile information
  realName: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: ''
  },
  userAvatar: {
    type: String,
    default: ''
  },
  aboutMe: {
    type: String,
    default: ''
  },
  countryName: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  school: {
    type: String,
    default: ''
  },
  starRating: {
    type: Number,
    default: 0
  },
  
  // Problem statistics
  totalSolved: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  easySolved: {
    type: Number,
    default: 0
  },
  totalEasy: {
    type: Number,
    default: 0
  },
  mediumSolved: {
    type: Number,
    default: 0
  },
  totalMedium: {
    type: Number,
    default: 0
  },
  hardSolved: {
    type: Number,
    default: 0
  },
  totalHard: {
    type: Number,
    default: 0
  },
  
  // Submission statistics
  totalSubmissions: {
    type: Number,
    default: 0
  },
  totalAcceptedSubmissions: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  },
  
  // Ranking and reputation
  ranking: {
    type: Number,
    default: 0
  },
  reputation: {
    type: Number,
    default: 0
  },
  contributionPoints: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  
  // Badges and achievements
  badges: [{
    id: String,
    displayName: String,
    icon: String,
    creationDate: Date
  }],
  upcomingBadges: [{
    name: String,
    icon: String
  }],
  activeBadge: {
    id: String
  },
  
  // Submission calendar (heatmap data)
  submissionCalendar: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Recent submissions
  recentSubmissions: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  
  yesterdayQuestionsSolved: {
    type: Number,
    default: 0
  },
  todayQuestionsSolved: {
    type: Number,
    default: 0
  },
  yesterdaySubmissions: {
    type: Number,
    default: 0
  },
  
  // Contest information
  contestParticipation: {
    type: Number,
    default: 0
  },
  contestRating: {
    type: Number,
    default: 0
  },
  contestGlobalRanking: {
    type: Number,
    default: 0
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for ranking and sorting
leetcodeSchema.index({ ranking: 1 });
leetcodeSchema.index({ totalSolved: -1 });

const LeetCode = mongoose.model('LeetCode', leetcodeSchema);

module.exports = LeetCode;