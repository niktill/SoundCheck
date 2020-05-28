/* User model */
'use strict';

const mongoose = require('mongoose')
const validator = require('validator')

const ArtistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    checks: {
        type: Number
    },
    spotify_id:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    last_checked:{
        type: String,
    },
    genre:{
        type: String,
    }
});

const Artist = mongoose.model('Artist', ArtistSchema);

module.exports = { Artist };