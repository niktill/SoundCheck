/* User model */
'use strict';

const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: validator.isAlphanumeric,
			message: 'Not valid username'
		}
	}, 
	password: {
		type: String,
		required: true,
    minlength: 4
    },
    artists: {
      type: Array
	},
	searchHistory: {
		type: Array
	},
	admin: {
		type: Number
	}
})
// Error handling middleware for duplicate usernames
UserSchema.post('save', function(error, doc, next) {
	if (error.name === 'MongoError' && error.code === 11000) {
	  next(new Error('Username already exists'));
	} else {
	  next();
	}
  });

// Our own user finding function 
UserSchema.statics.findByUsernamePassword = function(username, password) {
	const User = this

	return User.findOne({username: username}).then((user) => {
		if (!user) {
			return Promise.reject(new Error('Invalid login details'))
		}

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (error, result) => {
				if (result) {
					resolve(user);
				} else {
					reject(new Error('Invalid login details'));
				}
			})
		})
	})
}

// This function runs before saving user to database
UserSchema.pre('save', function(next) {
	const user = this

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (error, salt) => {
			bcrypt.hash(user.password, salt, (error, hash) => {
				user.password = hash
				next()
			})
		})
	} else {
		next();
	}

})

const User = mongoose.model('User', UserSchema)

module.exports = { User }