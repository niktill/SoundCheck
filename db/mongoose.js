const mongoose = require('mongoose')

// connect to our database
const mongoURI = process.env.MONGODB_URI ||'mongodb://localhost:27017/soundcheck-database';

mongoose.connect(mongoURI, { useNewUrlParser: true});

module.exports = { mongoose }