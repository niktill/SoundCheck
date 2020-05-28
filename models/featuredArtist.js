/* User model */
'use strict';

const mongoose = require('mongoose')
const validator = require('validator')

const FeaturedArtistSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    _id:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    }
});

const FeaturedArtist = mongoose.model('FeaturedArtist', FeaturedArtistSchema);

module.exports = { FeaturedArtist };