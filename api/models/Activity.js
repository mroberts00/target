const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ActivitySchema = new Schema({
  plan: {
    type: Schema.Types.ObjectId,
    ref: 'plans'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  name: {
    type: String
  },
  avatar: {
    type: String
  },
  sport: {
    type: String,
    enum: ["running", "cycling", "swimming", "strength"],
    default: "running"
  },
  title: {
    type: String
  },
  distance: {
    type: Number,
  },
  time: {
    type: Number,
  },
  pace: {
    type: String,
  },
  notes: {
    type: String
  },
  elevation: {
    type: Number
  },
  time: {
    type: String,
    enum: ['am', 'pm']
  },
  completed: {
    type: Boolean,
    default: false
  },
  stravaActivity: {
    type: String,
  },
  week: {
    type: Number,
    required: true
  },
  day: {
    type: Number
  },
  race: {
    type: Boolean,
    default: false
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      firstName: {
        type: String
      },
      lastName: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
})

module.exports = Activity = mongoose.model("activity", ActivitySchema);