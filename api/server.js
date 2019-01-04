require("dotenv").config();
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const users = require('./routes/users')
const profile = require('./routes/profile')
const plans = require('./routes/plans')
const activities = require('./routes/activities')

const app = express()

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//DB config
const db = process.env.MONGO_URL

//connect to mongodb
mongoose.connect(db).then(() => console.log("mongo db conencted"))

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

//User routes
app.use('/users', users)
app.use('/profile', profile)
app.use('/plans', plans)
app.use('/activities', activities)


const port = process.env.PORT || 5000

app.listen(port, () => console.log(`server running on port ${port}`))