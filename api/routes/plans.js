const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Plan model
const Plan = require('../models/Plan');
// Profile model
const Profile = require('../models/Profile');
// User model
const User = require('../models/User')

// Validation
const validatePlanInput = require('../validation/plan');

// @route   GET api/plans/test
// @desc    Tests plan route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Plans Works' }));

// @route   GET api/plans
// @desc    Get plans
// @access  Public
router.get('/', (req, res) => {
  Plan.find()
    .sort({ date: -1 })
    .then(plans => res.json(plans))
    .catch(err => res.status(404).json({ noplansfound: 'No plans found' }));
});

// @route   GET api/plans/:id
// @desc    Get plan by id
// @access  Public
router.get('/:id', (req, res) => {
  Plan.findById(req.params.id)
    .then(plan => res.json(plan))
    .catch(err =>
      res.status(404).json({ noplanfound: 'No plan found with that ID' })
    );
});

// @route   POST api/plans
// @desc    Create plan
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePlanInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPlan = new Plan({
      title: req.body.title,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      weekLength: req.body.weekLength,
      weekStart: req.body.weekStart,
      public: req.body.public,
      completed: req.body.completed,
      user: req.user.id,
    });

    newPlan.save().then(plan => res.json(plan));
  }
);

// @route   DELETE api/plans/:id
// @desc    Delete plan
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Plan.findById(req.params.id)
        .then(plan => {
          // Check for plan owner
          if (plan.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          // Delete
          plan.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ plannotfound: 'No plan found' }));
    });
  }
);

// @route   POST api/plans/like/:id
// @desc    Like plan
// @access  Private
router.post(
  '/like/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Plan.findById(req.params.id)
        .then(plan => {
          if (
            plan.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this plan' });
          }

          // Add user id to likes array
          plan.likes.unshift({ user: req.user.id });

          plan.save().then(plan => res.json(plan));
        })
        .catch(err => res.status(404).json({ plannotfound: 'No plan found' }));
    });
  }
);

// @route   POST api/plans/unlike/:id
// @desc    Unlike plan
// @access  Private
router.post(
  '/unlike/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Plan.findById(req.params.id)
        .then(plan => {
          if (
            plan.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this plan' });
          }

          // Get remove index
          const removeIndex = plan.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          plan.likes.splice(removeIndex, 1);

          // Save
          plan.save().then(plan => res.json(plan));
        })
        .catch(err => res.status(404).json({ plannotfound: 'No plan found' }));
    });
  }
);

// @route   POST api/plans/comment/:id
// @desc    Add comment to plan
// @access  Private
router.post(
  '/comment/:id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePlanInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Plan.findById(req.params.id)
      .then(plan => {
        const newComment = {
          text: req.body.text,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          avatar: req.body.avatar,
          user: req.user.id
        };

        // Add to comments array
        plan.comments.unshift(newComment);

        // Save
        plan.save().then(plan => res.json(plan));
      })
      .catch(err => res.status(404).json({ plannotfound: 'No plan found' }));
  }
);

// @route   DELETE api/plans/comment/:id/:comment_id
// @desc    Remove comment from plan
// @access  Private
router.delete(
  '/comment/:id/:comment_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findById(req.params.id)
      .then(plan => {
        // Check to see if comment exists
        if (
          plan.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length === 0
        ) {
          return res
            .status(404)
            .json({ commentnotexists: 'Comment does not exist' });
        }

        // Get remove index
        const removeIndex = plan.comments
          .map(item => item._id.toString())
          .indexOf(req.params.comment_id);

        // Splice comment out of array
        plan.comments.splice(removeIndex, 1);

        plan.save().then(plan => res.json(plan));
      })
      .catch(err => res.status(404).json({ plannotfound: 'No plan found' }));
  }
);

module.exports = router;
