const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Activity model
const Activity = require('../models/Activity');
// Profile model
const Profile = require('../models/Profile');
// Plan model
const Plan = require('../models/Plan')

// Validation
const validateActivityInput = require('../validation/activity');

// @route   GET api/activities/test
// @desc    Tests activity route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Activities Works' }));

// @route   GET api/activities
// @desc    Get activities
// @access  Public
router.get('/', (req, res) => {
  Activity.find()
    .sort({ date: -1 })
    .then(activities => res.json(activities))
    .catch(err => res.status(404).json({ noactivitiesfound: 'No activities found' }));
});

// @route   GET api/activities/:id
// @desc    Get activity by id
// @access  Public
router.get('/:id', (req, res) => {
  Activity.findById(req.params.id)
    .then(activity => res.json(activity))
    .catch(err =>
      res.status(404).json({ noactivityfound: 'No activity found with that ID' })
    );
});

// @route   POST api/activities
// @desc    Create activity
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateActivityInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newActivity = new Activity({
      sport: req.body.sport,
      name: req.body.name,
      avatar: req.body.avatar,
      title: req.body.title,
      distance: req.body.distance,
      time: req.body.time,
      pace: req.body.pace,
      notes: req.body.notes,
      elevation: req.body.elevation,
      time: req.body.time,
      completed: req.body.completed,
      stravaActivity: req.body.stravaActivity,
      week: req.body.week,
      day: req.body.day,
      race: req.body.race,
      user: req.user.id,
      plan: req.plan.id
    });

    newActivity.save().then(activity => res.json(activity));
  }
);

// @route   DELETE api/activities/:id
// @desc    Delete activity
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Activity.findById(req.params.id)
        .then(activity => {
          // Check for activity owner
          if (activity.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          // Delete
          activity.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ activitynotfound: 'No activity found' }));
    });
  }
);

// @route   POST api/activities/like/:id
// @desc    Like activity
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Activity.findById(req.params.id)
        .then(activity => {
          if (
            activity.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this activity' });
          }

          // Add user id to likes array
          activity.likes.unshift({ user: req.user.id });

          activity.save().then(activity => res.json(activity));
        })
        .catch(err => res.status(404).json({ activitynotfound: 'No activity found' }));
    });
  }
);

// @route   POST api/activities/unlike/:id
// @desc    Unlike activity
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Activity.findById(req.params.id)
        .then(activity => {
          if (
            activity.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this activity' });
          }

          // Get remove index
          const removeIndex = activity.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          activity.likes.splice(removeIndex, 1);

          // Save
          activity.save().then(activity => res.json(activity));
        })
        .catch(err => res.status(404).json({ activitynotfound: 'No activity found' }));
    });
  }
);

// @route   POST api/activities/comment/:id
// @desc    Add comment to activity
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateActivityInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Activity.findById(req.params.id)
      .then(activity => {
        const newComment = {
          text: req.body.text,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        activity.comments.unshift(newComment);

        // Save
        activity.save().then(activity => res.json(activity));
      })
      .catch(err => res.status(404).json({ activitynotfound: 'No activity found' }));
  }
);

// @route   DELETE api/activities/comment/:id/:comment_id
// @desc    Remove comment from activity
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Activity.findById(req.params.id)
      .then(activity => {
        // Check to see if comment exists
        if (
          activity.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = activity.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        activity.comments.splice(removeIndex, 1);

        activity.save().then(activity => res.json(activity));
      })
      .catch(err => res.status(404).json({ activitynotfound: 'No activity found' }));
  }
);

module.exports = router;
