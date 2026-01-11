const express = require('express');
const User = require('../models/userModel');

const router = express.Router();

// Route 1: Add a single user
router.post('/add-user', async (req, res) => {
  try {
    const { name, leetcodeProfile, leetcodeProfileID } = req.body;

    // Validate required fields
    if (!name || !leetcodeProfile || !leetcodeProfileID) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, leetcodeProfile, leetcodeProfileID) are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { leetcodeProfileID: leetcodeProfileID },
        { leetcodeProfile: leetcodeProfile }
      ]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this LeetCode profile already exists'
      });
    }

    // Create new user
    const newUser = new User({
      name,
      leetcodeProfile,
      leetcodeProfileID
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User added successfully',
      data: savedUser
    });

  } catch (error) {
    console.error('Error adding user:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Route 2: Add multiple users at once
router.post('/add-users', async (req, res) => {
  try {
    const users = req.body;

    // Validate input is an array
    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of users'
      });
    }

    // Validate each user object
    const validationErrors = [];
    const usersToInsert = [];
    const existingUsers = [];

    for (const [index, user] of users.entries()) {
      const { name, leetcodeProfile, leetcodeProfileID } = user;

      // Check required fields
      if (!name || !leetcodeProfile || !leetcodeProfileID) {
        validationErrors.push(`User at index ${index}: All fields are required`);
        continue;
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { leetcodeProfileID: leetcodeProfileID },
          { leetcodeProfile: leetcodeProfile }
        ]
      });

      if (existingUser) {
        existingUsers.push({
          index,
          name,
          leetcodeProfileID,
          message: 'User already exists'
        });
        continue;
      }

      usersToInsert.push({
        name,
        leetcodeProfile,
        leetcodeProfileID
      });
    }

    // If there are validation errors, return them
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        validationErrors,
        existingUsers
      });
    }

    // If no users to insert (all already exist)
    if (usersToInsert.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No new users to add - all users already exist',
        existingUsers
      });
    }

    // Insert all users
    const insertedUsers = await User.insertMany(usersToInsert);

    res.status(201).json({
      success: true,
      message: `${insertedUsers.length} users added successfully`,
      data: insertedUsers,
      existingUsers: existingUsers.length > 0 ? existingUsers : undefined
    });

  } catch (error) {
    console.error('Error adding multiple users:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error in one or more users',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Route 3: Get all users with LeetCode stats
router.get('/users', async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'leetcodes',
          localField: 'leetcodeProfileID',
          foreignField: 'username',
          as: 'leetcodeStats'
        }
      },
      {
        $unwind: {
          path: '$leetcodeStats',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $project: {
          name: 1,
          leetcodeProfileID: 1,
          leetcodeProfile: 1,
          createdAt: 1,
          userAvatar: '$leetcodeStats.userAvatar',
          totalSolved: '$leetcodeStats.totalSolved',
          ranking: '$leetcodeStats.ranking',
          easySolved: '$leetcodeStats.easySolved',
          mediumSolved: '$leetcodeStats.mediumSolved',
          hardSolved: '$leetcodeStats.hardSolved',
          school: '$leetcodeStats.school',
          countryName: '$leetcodeStats.countryName'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Route 4: Get a single user by ID
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Route 5: Bulk Upsert (Check and Update if exists, Create if not)
router.post('/bulk-upsert', async (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be an array of users'
      });
    }

    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      failed: 0,
      details: []
    };

    for (const user of users) {
      const { name, leetcodeProfile, leetcodeProfileID } = user;

      // Basic validation
      if (!name || !leetcodeProfile || !leetcodeProfileID) {
        results.failed++;
        results.details.push({
          leetcodeProfileID: leetcodeProfileID || 'unknown',
          status: 'failed',
          message: 'Missing required fields'
        });
        continue;
      }

      try {
        // Try to find the user first to determine action
        const existingUser = await User.findOne({
          $or: [
            { leetcodeProfileID: leetcodeProfileID },
            { leetcodeProfile: leetcodeProfile },
            { name: name }
          ]
        });

        if (existingUser) {
          // Update
          existingUser.name = name;
          existingUser.leetcodeProfile = leetcodeProfile;
          existingUser.leetcodeProfileID = leetcodeProfileID; // Update ID in case it was found by URL and ID is different
          await existingUser.save();
          
          results.updated++;
          results.details.push({ leetcodeProfileID, status: 'updated' });
        } else {
          // Create
          const newUser = new User({
            name,
            leetcodeProfile,
            leetcodeProfileID
          });
          await newUser.save();
          
          results.created++;
          results.details.push({ leetcodeProfileID, status: 'created' });
        }
        results.processed++;

      } catch (err) {
        results.failed++;
        results.details.push({
          leetcodeProfileID,
          status: 'failed',
          message: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk operation completed. Added: ${results.created}, Updated: ${results.updated}, Failed: ${results.failed}`,
      counts: {
        added: results.created,
        updated: results.updated,
        failed: results.failed,
        total: results.processed
      },
      details: results.details
    });

  } catch (error) {
    console.error('Error in bulk upsert:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Route 6: Delete users with duplicate names
router.delete('/delete-duplicates', async (req, res) => {
  try {
    // 1. Find names that have duplicates
    const duplicates = await User.aggregate([
      {
        $group: {
          _id: "$name", // Group by name
          count: { $sum: 1 },
          ids: { $push: "$_id" }
        }
      },
      {
        $match: {
          count: { $gt: 1 } // Filter for names appearing more than once
        }
      }
    ]);

    if (duplicates.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No duplicate users found by name',
        deletedCount: 0
      });
    }

    // 2. Extract all IDs to delete (delete ALL records for duplicate names)
    const idsToDelete = duplicates.reduce((acc, curr) => {
      return acc.concat(curr.ids);
    }, []);

    const namesToDelete = duplicates.map(d => d._id);

    // 3. Delete the users
    const deleteResult = await User.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({
      success: true,
      message: `Deleted ${deleteResult.deletedCount} users with duplicate names.`,
      deletedCount: deleteResult.deletedCount,
      deletedNames: namesToDelete
    });

  } catch (error) {
    console.error('Error deleting duplicates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;