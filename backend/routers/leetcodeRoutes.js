const { LeetCode } = require("leetcode-query");
const express = require('express');
const cron = require('node-cron');
const LeetCodeModel = require('../models/leetcodeModel');
const User = require('../models/userModel');
const Metadata = require('../models/metadataModel');

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
      
      // Badges and achievements
      badges: matchedUserData.badges || [],
      upcomingBadges: matchedUserData.upcomingBadges || [],
      activeBadge: matchedUserData.activeBadge || { id: '' },
      
      // Submission calendar - parse JSON string to object
      submissionCalendar: matchedUserData.submissionCalendar 
        ? (typeof matchedUserData.submissionCalendar === 'string' 
            ? JSON.parse(matchedUserData.submissionCalendar) 
            : matchedUserData.submissionCalendar)
        : {},
      
      // Recent submissions (limit to last 10)
      recentSubmissions: userProfile.recentSubmissionList ? 
        userProfile.recentSubmissionList.slice(0, 10).map(sub => ({
          title: sub.title || '',
          titleSlug: sub.titleSlug || '',
          timestamp: sub.timestamp || 0,
          statusDisplay: sub.statusDisplay || '',
          lang: sub.lang || ''
        })) : (matchedUserData.recentSubmissionList ? 
          matchedUserData.recentSubmissionList.slice(0, 10).map(sub => ({
            title: sub.title || '',
            titleSlug: sub.titleSlug || '',
            timestamp: sub.timestamp || 0,
            statusDisplay: sub.statusDisplay || '',
            lang: sub.lang || ''
          })) : []),
      
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching LeetCode data for user', username, ':', error.message);
    throw new Error(`Failed to fetch data for user ${username}: ${error.message}`);
  }
}

// Function to update all users' LeetCode data
async function updateAllUsersLeetCodeData() {
  try {
    
    // Get all users from the database
    const users = await User.find();
    
    if (users.length === 0) {
      return { success: 0, failed: 0 };
    }

    const results = [];
    const errors = [];

    for (const user of users) {
      try {
        // Fetch LeetCode data using the leetcodeProfileID
        const leetcodeData = await fetchLeetCodeUserData(user.leetcodeProfileID);
        
        // Save or update in LeetCode collection
        const existingLeetCodeUser = await LeetCodeModel.findOne({ username: user.leetcodeProfileID });
        
        if (existingLeetCodeUser) {
          Object.assign(existingLeetCodeUser, leetcodeData);
          await existingLeetCodeUser.save();
          results.push({
            username: user.leetcodeProfileID,
            status: 'updated'
          });
        } else {
          const newLeetCodeUser = new LeetCodeModel(leetcodeData);
          await newLeetCodeUser.save();
          results.push({
            username: user.leetcodeProfileID,
            status: 'created'
          });
        }
      } catch (error) {
        errors.push({
          username: user.leetcodeProfileID,
          error: error.message
        });
      }
    }

    
    // Update global last update timestamp in metadata
    await Metadata.findOneAndUpdate(
      { key: 'last_global_update' },
      { value: new Date(), lastUpdated: new Date() },
      { upsert: true }
    );
    
    if (errors.length > 0) {
      console.error('Errors during update:', errors);
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error in updateAllUsersLeetCodeData:', error);
    throw error;
  }
}

// Schedule automatic updates twice daily at 12:00 AM and 12:00 PM
cron.schedule('0 0,12 * * *', async () => {
  try {
    const result = await updateAllUsersLeetCodeData();
  } catch (error) {
    console.error('Error in scheduled update:', error);
  }
});

// Manual trigger endpoint for testing
leetcodeRoutes.post('/update-all-now', async (req, res) => {
  try {
    const result = await updateAllUsersLeetCodeData();
    
    res.json({
      message: 'Manual update completed',
      result
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to update users',
      details: error.message 
    });
  }
});

// Get LeetCode data for a specific user
leetcodeRoutes.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Try to get data from our database first
    const leetcodeData = await LeetCodeModel.findOne({ username });
    
    if (leetcodeData) {
      return res.json({
        status: 'success',
        message: 'Data retrieved from database',
        data: {
          totalSolved: leetcodeData.totalSolved,
          totalQuestions: leetcodeData.totalQuestions,
          easySolved: leetcodeData.easySolved,
          totalEasy: leetcodeData.totalEasy,
          mediumSolved: leetcodeData.mediumSolved,
          totalMedium: leetcodeData.totalMedium,
          hardSolved: leetcodeData.hardSolved,
          totalHard: leetcodeData.totalHard,
          acceptanceRate: leetcodeData.acceptanceRate,
          ranking: leetcodeData.ranking,
          reputation: leetcodeData.reputation,
          contributionPoints: leetcodeData.contributionPoints
        }
      });
    }
    
    // If not in database, fetch from LeetCode API
    const freshData = await fetchLeetCodeUserData(username);
    
    // Save to database for future use
    const newLeetCodeUser = new LeetCodeModel(freshData);
    await newLeetCodeUser.save();
    
    res.json({
      status: 'success',
      message: 'Data fetched from LeetCode API',
      data: {
        totalSolved: freshData.totalSolved,
        totalQuestions: freshData.totalQuestions,
        easySolved: freshData.easySolved,
        totalEasy: freshData.totalEasy,
        mediumSolved: freshData.mediumSolved,
        totalMedium: freshData.totalMedium,
        hardSolved: freshData.hardSolved,
        totalHard: freshData.totalHard,
        acceptanceRate: freshData.acceptanceRate,
        ranking: freshData.ranking,
        reputation: freshData.reputation,
        contributionPoints: freshData.contributionPoints
      }
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
    const leaderboardData = await User.aggregate([
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
      {
        $project: {
          _id: 1,
          name: 1,
          leetcodeProfile: 1,
          leetcodeProfileID: 1,
          totalSolved: { $ifNull: ['$leetcodeInfo.totalSolved', 0] },
          ranking: { $ifNull: ['$leetcodeInfo.ranking', 2147483647] }, // High number for those without ranking
          leetcodeData: {
            totalSolved: { $ifNull: ['$leetcodeInfo.totalSolved', 0] },
            ranking: { $ifNull: ['$leetcodeInfo.ranking', 2147483647] }
          }
        }
      },
      {
        $sort: {
          totalSolved: -1,
          ranking: 1
        }
      }
    ]);

    res.json({
      status: 'success',
      message: 'Leaderboard data retrieved',
      data: leaderboardData
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
  const lastUpdate = await Metadata.findOne({ key: 'last_global_update' });
  res.json({ 
    message: 'LeetCode cron service is running',
    lastGlobalUpdate: lastUpdate ? lastUpdate.value : 'Never',
    nextUpdate: 'Twice daily at 12:00 AM and 12:00 PM'
  });
});

// Function to check and run update on startup if stale
async function checkAndRunStartupUpdate() {
  try {
    const lastUpdate = await Metadata.findOne({ key: 'last_global_update' });
    
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    const now = new Date();
    
    if (!lastUpdate || (now - new Date(lastUpdate.value)) > TWELVE_HOURS) {
      // Run in background without awaiting to not block startup
      updateAllUsersLeetCodeData().catch(err => console.error('Startup update failed:', err));
    }
  } catch (error) {
    console.error('Error during startup update check:', error);
  }
}

module.exports = {
  router: leetcodeRoutes,
  checkAndRunStartupUpdate,
  updateAllUsersLeetCodeData
};


