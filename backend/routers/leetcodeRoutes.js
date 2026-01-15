const { LeetCode } = require("leetcode-query");
const express = require('express');
const LeetCodeModel = require('../models/leetcodeModel');
const User = require('../models/userModel');

const leetcodeRoutes = express.Router();
const leetcode = new LeetCode();

// Helper function to fetch user data from LeetCode
async function fetchLeetCodeUserData(username) {
  try {
    
    // Test different method names that might exist in leetcode-query
    let userProfile;
    let methodUsed = '';
    
    // Try leetcode.user() first (common method)
    try {
      if (leetcode.user && typeof leetcode.user === 'function') {
        userProfile = await leetcode.user(username);
        methodUsed = 'leetcode.user()';
      }
    } catch (error) {
      // Silently try next method
    }
    
    // If leetcode.user() didn't work or doesn't exist, try leetcode.get_user()
    if (!userProfile) {
      try {
        if (leetcode.get_user && typeof leetcode.get_user === 'function') {
          userProfile = await leetcode.get_user(username);
          methodUsed = 'leetcode.get_user()';
        }
      } catch (error) {
        // Silently try next method
      }
    }
    
    // If still not working, try leetcode.getUser()
    if (!userProfile) {
      try {
        if (leetcode.getUser && typeof leetcode.getUser === 'function') {
          userProfile = await leetcode.getUser(username);
          methodUsed = 'leetcode.getUser()';
        }
      } catch (error) {
        // Silently try next method
      }
    }
    
    // If all methods failed, throw comprehensive error
    if (!userProfile) {
      const availableMethods = Object.keys(leetcode).filter(key => 
        typeof leetcode[key] === 'function'
      );
      throw new Error(`No working LeetCode API methods found. Available methods: ${availableMethods.join(', ')}`);
    }
    
    // Handle different response structures
    let matchedUserData;
    let allQuestionsCount = [];
    
    // Attempt to find allQuestionsCount
    if (userProfile.allQuestionsCount && Array.isArray(userProfile.allQuestionsCount)) {
      allQuestionsCount = userProfile.allQuestionsCount;
    } else if (userProfile.user && Array.isArray(userProfile.user.allQuestionsCount)) {
      allQuestionsCount = userProfile.user.allQuestionsCount;
    } else if (userProfile.data && userProfile.data.allQuestionsCount && Array.isArray(userProfile.data.allQuestionsCount)) {
      allQuestionsCount = userProfile.data.allQuestionsCount;
    }

    // Attempt to find matchedUser data
    if (userProfile.matchedUser) {
      matchedUserData = userProfile.matchedUser;
    } else if (userProfile.user && userProfile.user.matchedUser) {
      matchedUserData = userProfile.user.matchedUser;
    } else if (userProfile.data && userProfile.data.matchedUser) {
      matchedUserData = userProfile.data.matchedUser;
    } else if (userProfile.user) {
      matchedUserData = userProfile.user;
    } else {
      matchedUserData = userProfile; // Fallback to the whole object
    }
    
    if (!matchedUserData) {
      throw new Error('Unable to find matchedUser data in LeetCode response');
    }

    // Double check allQuestionsCount if still not found
    if (allQuestionsCount.length === 0) {
      if (matchedUserData.allQuestionsCount) {
        allQuestionsCount = matchedUserData.allQuestionsCount;
      }
    }

    // Final validation
    if (!matchedUserData) {
      throw new Error('User not found on LeetCode - no matchedUser data');
    }

    const profile = matchedUserData.profile || {};
    const submitStats = matchedUserData.submitStats || {};
    
    if (!profile) {
      throw new Error('No profile data found for user');
    }

    // Extract submission stats safely - use the correct structure
    const acSubmissionNum = submitStats?.acSubmissionNum || [];
    const totalSubmissionNum = submitStats?.totalSubmissionNum || [];
    
    // Parse submission stats with defaults
    let easySolved = 0, mediumSolved = 0, hardSolved = 0, totalSolved = 0;
    let totalEasy = 0, totalMedium = 0, totalHard = 0, totalQuestions = 0;
    let totalSubmissions = 0, totalAcceptedSubmissions = 0;
    
    acSubmissionNum.forEach(stat => {
      if (stat.difficulty === 'Easy') {
        easySolved = stat.count || 0;
      } else if (stat.difficulty === 'Medium') {
        mediumSolved = stat.count || 0;
      } else if (stat.difficulty === 'Hard') {
        hardSolved = stat.count || 0;
      } else if (stat.difficulty === 'All') {
        totalSolved = stat.count || 0;
        totalAcceptedSubmissions = stat.submissions || 0;
      }
    });

    // Get user's submission counts from totalSubmissionNum
    totalSubmissionNum.forEach(stat => {
      if (stat.difficulty === 'All') {
        totalSubmissions = stat.submissions || 0;
      }
    });

    // Get total questions by difficulty from allQuestionsCount
    allQuestionsCount.forEach(stat => {
      if (stat.difficulty === 'Easy') {
        totalEasy = stat.count || 0;
      } else if (stat.difficulty === 'Medium') {
        totalMedium = stat.count || 0;
      } else if (stat.difficulty === 'Hard') {
        totalHard = stat.count || 0;
      } else if (stat.difficulty === 'All') {
        totalQuestions = stat.count || 0;
      }
    });

    // Calculate acceptance rate safely - use correct formula
    const acceptanceRate = totalSubmissions > 0 
      ? Math.round((totalAcceptedSubmissions / totalSubmissions) * 100) 
      : 0;

    // Calculate yesterday's timestamp for unique questions solved
    const now = new Date();
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterdayTimestamp = Math.floor(todayUTC.getTime() / 1000) - 86400;
    const todayTimestamp = yesterdayTimestamp + 86400;

    // Recent submissions (limit to last 20)
    let recentSubmissions = [];
    if (userProfile.recentSubmissionList) {
      recentSubmissions = userProfile.recentSubmissionList;
    } else if (matchedUserData.recentSubmissionList) {
      recentSubmissions = matchedUserData.recentSubmissionList;
    } else if (userProfile.recentSubmissions) {
      recentSubmissions = userProfile.recentSubmissions;
    }

    // Attempt to fetch more recent submissions to exceed the 20 limit
    try {
      // 1. Try library method if available
      if (typeof leetcode.recent_submissions === 'function') {
        const extraSubmissions = await leetcode.recent_submissions(username, 50);
        if (Array.isArray(extraSubmissions) && extraSubmissions.length > 0) {
          recentSubmissions = [...recentSubmissions, ...extraSubmissions];
        }
      }
      
      // 2. Try raw GraphQL for recentAcSubmissionList (gets older accepted submissions)
      if (leetcode.graphql) {
         const queryObj = {
             query: `
             query recentAcSubmissions($username: String!, $limit: Int) {
                 recentAcSubmissionList(username: $username, limit: $limit) {
                     title
                     titleSlug
                     timestamp
                     statusDisplay
                     lang
                 }
             }
             `,
             variables: { username, limit: 50 }
         };
         const result = await leetcode.graphql(queryObj);
         if (result.data && result.data.recentAcSubmissionList) {
             recentSubmissions = [...recentSubmissions, ...result.data.recentAcSubmissionList];
         }
      }
    } catch (e) {
      // console.log('Optional extra submissions fetch failed:', e.message);
    }

    // Deduplicate and sort submissions
    const uniqueSubmissions = [];
    const seenSubmission = new Set();
    
    // Sort by timestamp desc
    recentSubmissions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    
    for (const sub of recentSubmissions) {
        // Create unique key based on timestamp and title
        const key = `${sub.timestamp}-${sub.titleSlug}`;
        if (!seenSubmission.has(key)) {
            seenSubmission.add(key);
            uniqueSubmissions.push(sub);
        }
    }

    const formattedSubmissions = uniqueSubmissions.slice(0, 100).map(sub => ({
      title: sub.title || '',
      titleSlug: sub.titleSlug || '',
      timestamp: Number(sub.timestamp) || 0,
      statusDisplay: sub.statusDisplay || '',
      lang: sub.lang || ''
    }));

    // Calculate unique questions solved yesterday from recent submissions
    const uniqueAcceptedYesterday = new Set();
    const uniqueAcceptedToday = new Set();
    let yesterdaySubmissions = 0;
    
    // Check submission calendar for submission count (more accurate for total count)
    const submissionCalendar = matchedUserData.submissionCalendar 
      ? (typeof matchedUserData.submissionCalendar === 'string' 
          ? JSON.parse(matchedUserData.submissionCalendar) 
          : matchedUserData.submissionCalendar)
      : {};
      
    if (submissionCalendar[yesterdayTimestamp.toString()]) {
      yesterdaySubmissions = submissionCalendar[yesterdayTimestamp.toString()];
    }

    formattedSubmissions.forEach(sub => {
      // Yesterday's questions
      if (sub.timestamp >= yesterdayTimestamp && sub.timestamp < todayTimestamp) {
        if (sub.statusDisplay === 'Accepted') {
          uniqueAcceptedYesterday.add(sub.titleSlug || sub.title);
        }
      }
      // Today's questions
      if (sub.timestamp >= todayTimestamp) {
        if (sub.statusDisplay === 'Accepted') {
          uniqueAcceptedToday.add(sub.titleSlug || sub.title);
        }
      }
    });
    const yesterdayQuestionsSolved = uniqueAcceptedYesterday.size;
    const todayQuestionsSolved = uniqueAcceptedToday.size;

    // Points calculation (example: 10 points for hard, 5 for medium, 2 for easy)
    const points = (hardSolved * 10) + (mediumSolved * 5) + (easySolved * 2);

    return {
      username: username,
      name: profile.realName || username,
      
      // Profile information
      realName: profile.realName || '',
      githubUrl: matchedUserData.githubUrl || '',
      userAvatar: profile.userAvatar || '',
      aboutMe: profile.aboutMe || '',
      countryName: profile.countryName || '',
      company: profile.company || '',
      school: profile.school || '',
      starRating: profile.starRating || 0,
      
      // Problem statistics
      totalSolved,
      totalQuestions,
      easySolved,
      totalEasy,
      mediumSolved,
      totalMedium,
      hardSolved,
      totalHard,
      
      // Submission statistics
      totalSubmissions,
      totalAcceptedSubmissions,
      acceptanceRate,
      
      // Ranking and reputation
      ranking: profile.ranking || 0,
      reputation: profile.reputation || 0,
      contributionPoints: matchedUserData.contributions?.points || 0,
      points,
      
      // Badges and achievements
      badges: matchedUserData.badges || [],
      upcomingBadges: matchedUserData.upcomingBadges || [],
      activeBadge: matchedUserData.activeBadge || { id: '' },
      
      // Submission calendar - parse JSON string to object
      submissionCalendar,
      
      // Recent submissions
      recentSubmissions: formattedSubmissions,
      yesterdayQuestionsSolved: yesterdayQuestionsSolved,
      todayQuestionsSolved: todayQuestionsSolved,
      yesterdaySubmissions: yesterdaySubmissions,
      
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching LeetCode data for user', username, ':', error.message);
    throw new Error(`Failed to fetch data for user ${username}: ${error.message}`);
  }
}

// Function to update a batch of users
async function updateStaleUsers(limit = 5) {
  try {
    // Find users with oldest lastUpdated timestamp or no timestamp
    // We query User collection and join with LeetCodeModel to ensure we cover all users
    // including those who might not have a LeetCodeModel entry yet.
    const usersToUpdate = await User.aggregate([
      {
        $lookup: {
          from: 'leetcodes',
          localField: 'leetcodeProfileID',
          foreignField: 'username',
          as: 'leetcodeInfo'
        }
      },
      {
        $project: {
          leetcodeProfileID: 1,
          // If leetcodeInfo is empty or lastUpdated missing, use very old date (epoch 0)
          lastUpdated: { 
            $ifNull: [
              { $arrayElemAt: ["$leetcodeInfo.lastUpdated", 0] }, 
              new Date(0) 
            ] 
          }
        }
      },
      { $sort: { lastUpdated: 1 } },
      { $limit: limit }
    ]);

    if (usersToUpdate.length === 0) {
      return { updated: 0, message: 'No users found in database' };
    }

    const results = [];
    const errors = [];

    for (const user of usersToUpdate) {
      const username = user.leetcodeProfileID;
      try {
        const leetcodeData = await fetchLeetCodeUserData(username);
        
        await LeetCodeModel.findOneAndUpdate(
          { username: username },
          leetcodeData,
          { upsert: true, new: false, setDefaultsOnInsert: true }
        );

        results.push(username);
      } catch (error) {
        errors.push({ username: username, error: error.message });
        // Even if failed, update timestamp to push to back of queue so we don't get stuck
        await LeetCodeModel.updateOne(
          { username: username }, 
          { $set: { lastUpdated: new Date() } },
          { upsert: true } // Ensure it exists even if fetch failed
        );
      }
    }

    // Get total user count for stats
    const totalUsers = await User.countDocuments({ leetcodeProfileID: { $ne: null } });

    return { 
      updated: results.length, 
      failed: errors.length, 
      users: results,
      totalUsers,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('Error in incremental update:', error);
    throw error;
  }
}

// Endpoint for external cron service (Keep-Alive + Incremental Update)
leetcodeRoutes.get('/cron-update', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log(`[Cron Job] Starting incremental update for ${limit} users...`);
    
    const result = await updateStaleUsers(limit);
    
    // Calculate cycle time in hours
    const totalUsers = result.totalUsers || 0;
    const requestsPerHour = (60 / 5) * limit; // Assuming 5 min interval
    const cycleTimeHours = totalUsers > 0 ? (totalUsers / requestsPerHour).toFixed(2) : 0;

    console.log(`[Cron Job] Success! Updated: ${result.updated}, Failed: ${result.failed}, Total Users: ${totalUsers}`);

    res.json({
      success: true,
      message: 'Incremental update completed',
      stats: {
        totalUsers,
        batchSize: limit,
        estimatedCycleTime: `${cycleTimeHours} hours`
      },
      data: result
    });
  } catch (error) {
    console.error(`[Cron Job] Failed: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Incremental update failed',
      error: error.message
    });
  }
});

// Manual trigger endpoint for testing
leetcodeRoutes.post('/update-all-now', async (req, res) => {
  // This is now discouraged for production but kept for manual admin use
  try {
    const result = await updateStaleUsers(132); // Try to update a large batch manually if needed
    res.json({ message: 'Manual batch update completed', result });
  } catch (error) {
    res.status(500).json({ error: 'Failed', details: error.message });
  }
});

// Get LeetCode data for a specific user
leetcodeRoutes.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Try to get data from our database first
    let leetcodeData = await LeetCodeModel.findOne({ username });
    
    // If data exists but has no submissions, or if it's very old, consider it stale
    const isStale = leetcodeData && (!leetcodeData.recentSubmissions || leetcodeData.recentSubmissions.length === 0);
    
    if (leetcodeData && !isStale) {
      return res.json({
        status: 'success',
        message: 'Data retrieved from database',
        data: leetcodeData
      });
    }
    
    // If not in database or data is stale (no submissions), fetch from LeetCode API
    const freshData = await fetchLeetCodeUserData(username);
    
    if (leetcodeData) {
      // Update existing record
      Object.assign(leetcodeData, freshData);
      await leetcodeData.save();
    } else {
      // Save new record
      const newLeetCodeUser = new LeetCodeModel(freshData);
      await newLeetCodeUser.save();
      leetcodeData = newLeetCodeUser;
    }
    
    res.json({
      status: 'success',
      message: isStale ? 'Data refreshed from LeetCode API' : 'Data fetched from LeetCode API',
      data: leetcodeData
    });
    
  } catch (error) {
    console.error('Error fetching user LeetCode data:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get LeetCode data for all users (for leaderboard)
leetcodeRoutes.get('/leaderboard', async (req, res) => {
  try {
    console.log('Leaderboard endpoint hit');
    
    // Query Params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'total'; // 'total', 'yesterdaySubmissions', 'yesterdayQuestions'
    const college = req.query.college || 'All';
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Calculate yesterday's timestamp at 00:00:00 UTC
    const now = new Date();
    // Use UTC date to match LeetCode's submission calendar timestamps
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const yesterdayTimestamp = Math.floor(todayUTC.getTime() / 1000) - 86400;

    // Build Match Stage
    const matchStage = { leetcodeProfileID: { $ne: null } };
    if (college !== 'All') {
      matchStage.college = college;
    }
    
    // Add Search Filter
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { leetcodeProfileID: { $regex: search, $options: 'i' } }
      ];
    }

    // Build Sort Stage
    let sortStage = {};
    switch (sortBy) {
      case 'yesterdaySubmissions':
        sortStage = { 'leetcodeInfo.yesterdaySubmissions': -1, 'leetcodeInfo.totalSolved': -1 };
        break;
      case 'yesterdayQuestions':
        sortStage = { 'leetcodeInfo.yesterdayQuestionsSolved': -1, 'leetcodeInfo.totalSolved': -1 };
        break;
      case 'todayQuestions':
        sortStage = { 'leetcodeInfo.todayQuestionsSolved': -1, 'leetcodeInfo.totalSolved': -1 };
        break;
      case 'total':
      default:
        sortStage = { 'leetcodeInfo.totalSolved': -1, 'leetcodeInfo.ranking': 1 };
        break;
    }

    const aggregationPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'leetcodes',
          localField: 'leetcodeProfileID',
          foreignField: 'username',
          as: 'leetcodeInfo'
        }
      },
      {
        $unwind: {
          path: '$leetcodeInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      { $sort: sortStage },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                college: 1,
                leetcodeProfile: 1,
                leetcodeProfileID: 1,
                userAvatar: { $ifNull: ['$leetcodeInfo.userAvatar', '$userAvatar'] },
                countryName: { $ifNull: ['$leetcodeInfo.countryName', ''] },
                school: { $ifNull: ['$leetcodeInfo.school', ''] },
                totalSolved: { $ifNull: ['$leetcodeInfo.totalSolved', 0] },
                ranking: { $ifNull: ['$leetcodeInfo.ranking', 2147483647] },
                acceptanceRate: { $ifNull: ['$leetcodeInfo.acceptanceRate', 0] },
                easySolved: { $ifNull: ['$leetcodeInfo.easySolved', 0] },
                mediumSolved: { $ifNull: ['$leetcodeInfo.mediumSolved', 0] },
                hardSolved: { $ifNull: ['$leetcodeInfo.hardSolved', 0] },
                contestRating: { $ifNull: ['$leetcodeInfo.contestRating', 0] },
                reputation: { $ifNull: ['$leetcodeInfo.reputation', 0] },
                yesterdayQuestionsSolved: { $ifNull: ['$leetcodeInfo.yesterdayQuestionsSolved', 0] },
                todayQuestionsSolved: { $ifNull: ['$leetcodeInfo.todayQuestionsSolved', 0] },
                yesterdaySubmissions: { $ifNull: ['$leetcodeInfo.yesterdaySubmissions', 0] },
              }
            }
          ]
        }
      }
    ];

    const result = await User.aggregate(aggregationPipeline);
    
    const data = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: 'success',
      message: 'Leaderboard data retrieved',
      data: data,
      meta: {
        yesterdayDate: new Date(yesterdayTimestamp * 1000).toISOString().split('T')[0],
        yesterdayTimestamp: yesterdayTimestamp,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Health check endpoint
leetcodeRoutes.get('/health', async (req, res) => {
  res.json({ 
    message: 'LeetCode service is running',
    mode: 'incremental_updates',
    updateInterval: 'Every 5 minutes (via external cron)'
  });
});

module.exports = {
  router: leetcodeRoutes,
  updateStaleUsers
};


