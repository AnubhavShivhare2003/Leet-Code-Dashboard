const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  leetcodeProfile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https:\/\/leetcode\.com\/u\/[A-Za-z0-9_-]+\/?$/
;
      },
      message: props => `${props.value} is not a valid LeetCode profile URL!`
    }
  },
  leetcodeProfileID: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[\w\d_\-]+$/.test(v);
      },
      message: props => `${props.value} is not a valid LeetCode profile ID!`
    }
  }
}, {
  timestamps: true
});

// Create index for better query performance
userSchema.index({ leetcodeProfileID: 1 }, { unique: true });
userSchema.index({ name: 1 });

module.exports = mongoose.model('User', userSchema);