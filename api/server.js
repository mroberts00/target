require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/user");
const users = require("./routes/users");
const passport = require("passport");
const cors = require('cors')
const server = express();

server.use(cors({ origin: process.env.CORS_ORIGINS.split(',') }));