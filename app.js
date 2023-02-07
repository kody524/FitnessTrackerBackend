require("dotenv").config()
const express = require("express")
const app = express()

const morgan = require('morgan');
const cors = require('cors');


app.use(cors())
app.use(morgan('dev'));
// Setup your Middleware and API Router here
const apiRouter = require('./api')
app.use('/api', apiRouter);

module.exports = app;
