'use strict'
/// Constants
const spotifyClientID = '79592d0d011f47978e9952cdc43d4289'
const spotifySecret = '3e68ec366e1246dfa08e99161e57d667'
const numberOfSearchResults = '20'
const maxNumSearchHistory = 30
const defaultRandomGenre = 'pop'

////// Modules
const express = require('express')
const port = process.env.PORT || 3000
const bodyParser = require('body-parser')
const session = require('express-session')
const request = require('request')

const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');

// Models
const { User } = require('./models/user');
const { Artist } = require('./models/artist');
const { FeaturedArtist } = require('./models/featuredArtist');

// Middleware
const app = express();
// body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
// set the view library
app.set('view engine', 'hbs');
// static dir
app.use(express.static(__dirname + '/public'));

// Add express sesssion middleware
app.use(session({
	secret: 'oursecret',
	resave: false,
	saveUninitialized: false,
	cookie: {
		httpOnly: true
	}
}));

// 		------ More Middleware ------
// Middleware to check for logged-in users
const sessionChecker = (req, res, next) => {
	if (req.session.user) {
        next();
	} else {
		res.redirect('/login')
	}
};

// Middleware for authentication for resources
const authenticate = (req, res, next) => {
	if (req.session.user) {
		User.findById(req.session.user).then((user) => {
			if (!user) {
				return Promise.reject()
			} else {
				req.user = user;
				next()
			}
		}).catch((error) => {
			res.status(400).redirect('/login')
		})
	} else {
		res.redirect('/login')
	}
};

// ------- ROUTES -------

// main route
app.get('/', sessionChecker, (req, res) => {	
	if (req.session.admin === 1){
		res.sendFile(__dirname + '/adminView/admin-home.html');
	} else {
		res.sendFile(__dirname + '/public/home.html');
	}
});

app.get('/search', sessionChecker, (req, res) => {
	if (req.session.admin === 1){
		res.sendFile(__dirname + '/adminView/admin-search.html');
	} else {
		res.sendFile(__dirname + '/public/search.html');
	}
});

// get an admin page
app.get('/adminView/:adminPage', sessionChecker, (req, res) => {
	if (req.session.admin === 1){
		res.sendFile(__dirname + '/adminView/' + req.params.adminPage);
	} else {
		res.send(404);
	}
});

// 		-------- Authentication Routes --------
//Check if user is admin
app.get('/admin', sessionChecker, (req, res) => {
	if (req.session.admin === 1){
		res.send({"admin" : 1});
	}
	else{
		res.send({"admin" : 0});
	}
});

// login route
app.route('/login').get((req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})

// create new user route
app.post('/users', (req, res) => {
    // check if confirm password is correct
    if (req.body.passwordSignUp !== req.body.confirmPassword){
        return res.status(400).render('login.hbs', {
			errorMessage: 'Passwords do not match'
		})
    }
	 
	// determine if admin or not
	let adminVal
	if (req.body.passwordSignUp === 'team29'){
		adminVal = 1;
	} else {
		adminVal = 0;
	}
    // create new User
    const user = new User({
        username: req.body.usernameSignUp,
        password: req.body.passwordSignUp,
        artists: [],
		searchHistory: [],
		admin: adminVal
    });

    // Save user to the database
	user.save().then((result) => {
        // Add the user to the session cookie that we will
		// send to the client
        req.session.user = user._id;
		req.session.username = user.username;
		req.session.admin = user.admin;
		res.status(200).redirect('/');
	}).catch((error) => {
		res.status(400).render('login.hbs', {
			errorMessage: error.message
		})
    })
});

// login to account route
app.post('/users/login', (req, res) => {
    // get username and password from request    
    const username = req.body.usernameLogIn;
    const password = req.body.passwordLogIn;    
    // check database for username and password
    User.findByUsernamePassword(username, password).then((user) => {
        
		if(!user) {            
			res.status(404).render('login.hbs',{
				errorMessage: 'Login details not valid'
			})
		} else {          
			// Add the user to the session cookie that we will
			// send to the client
			req.session.user = user._id;
			req.session.username = user.username
			req.session.admin = user.admin
			// res.status(200).redirect('/')
			res.status(200).redirect('/');
		}
	}).catch((error) => {		
		res.status(400).render('login.hbs',{
			errorMessage: error.message
		})
	})
})
// log out route
app.get('/users/logout', (req, res) => {
	req.session.destroy((error) => {
		if (error) {
			res.status(500).redirect('/login')
		} else {
			res.redirect('/login')
		}
	})
})
// used for user page to check which user page we should load
app.get('/current-user', (req, res) => {
    User.findOne({ 'username': req.session.username }).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            res.send(user)
        }
    }).catch((error) => {
        res.status(400).send(error);
    })
})

// 			------- SEARCH ROUTE -------
// Get a Spotify Access Token and make a search using Spotify API
// If search for admin: use find item Spotify API https://developer.spotify.com/console/get-search-item/?q=tania%20bowra&type=artist&market=&limit=&offset=
// If search for user:  use find related artists Spotify API https://developer.spotify.com/documentation/web-api/reference/artists/get-related-artists/
// If Spotify API response is 200,add search to user's search history
// If a random search, get genre of random artist and return search result of find item Spotify API using genre
// If random artist has no genre use defaultRandomGenre
// If search was random search, do not add search to search history
app.post('/search', sessionChecker, (req, res) => {
	// determine if randomsearch or not
	const random = req.body.random
	// get artist's name
	const artistName = req.body.artist
	// get web token from spotify
	const url = 'https://accounts.spotify.com/api/token';            
	let data = spotifyClientID + ':3e68ec366e1246dfa08e99161e57d667';  
	let buff = new Buffer(data);  
	let base64data = buff.toString('base64');
	const options = {
		url: url, 
		form: {
			grant_type: 'client_credentials'
		  },
		json: true,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			"Authorization": 'Basic ' + base64data
		},
	}
	// send request to get Spotify access token
	request.post(options, (error, response, body)=>{
		if (error) {
			// error with request
			res.status(400).send()
			console.log(error);
			
		}
		else if (response.statusCode === 200) {
			// Successfully got Spotify Access Token
			// make call to Spotify's API search item to find artist
			const searchURI = encodeURI(artistName)
			const url = 'https://api.spotify.com/v1/search?q=' + searchURI +'&type=artist&limit=' + numberOfSearchResults 
			const access_token = body.access_token       
			const options = {
				url: url,
				headers: { 'Authorization': 'Bearer ' + access_token  },
				json: true
			};
			// make request to spotify API search item
			request.get(options, function(error, response, body) {
				if (error){
					// could not connect to API
					res.status(400).send()
				} else if (response.statusCode === 200){
					// Success					
					// If it is an admin search, send them regular find artist search
					if (req.session.admin === 1){						
						res.status(200).send(body)
					} else {
						// Regular User search
						if (body.artists.items.length === 0){
							res.status(404).send()
						} else {
							// If regular search, using id of found artist, make call to spotify related artists API
							// If random search, make a search on random artist's genre, if no genre make it default genre
							let url
							if (random === 1){
								let genre
								if (!body.artists.items[0].genres[0]){
									genre= defaultRandomGenre
								} else {
									genre = body.artists.items[0].genres[0]
								}
								const genreURI = encodeURI(genre)
								url = 'https://api.spotify.com/v1/search?q=genre:"' + genreURI +'"&type=artist&limit=' + numberOfSearchResults
							} else {
								url = 'https://api.spotify.com/v1/artists/' + body.artists.items[0].id +'/related-artists'
							}		        
							const options = {
								url: url,
								headers: { 'Authorization': 'Bearer ' + access_token },
								json: true
							};
							// make request to spotify API search item
							request.get(options, function(error, response, body) {						
								if (error){
									// could not connect to API
									res.status(400).send()
									
								} else if (response.statusCode === 200){
									// Success, send related artists or genre results back to client
									// Add search to user's search history if not random search
									if (random == 0){
										User.findById(req.session.user).then((user) => {
										if (!user){
											// end session if id is not found
											res.redirect('/users/logout')
										} else {
											// user is found, add their search to their search history
											// remove old search if size of search history is too big
											if (user.searchHistory.length >= maxNumSearchHistory){
												user.searchHistory.shift()
											}
											user.searchHistory.push(artistName);
											user.save().catch((error)=>{
												res.status(400).send()
											})
										}
										}).catch((error) => {		
											res.status(400).send(error)
										})
									}
									// send related artists
									res.status(200).send(body)
								} else {
									// Could not find results for search for related artists or genre search Spotify API				
									res.status(404).send()	
								}
							});
						}
					}
				} else {
					// Could not find results for search for item Spotify API
					res.status(404).send()	
				}
			});
		}
		else {
			// could not get access token
			res.status(400).send()
		}	
	})
})


// get random artist name from user's search history
app.get('/random', (req, res) => {
	const id = req.session.user
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	User.findById(id).then((user) => {
		if (!user){
			res.status(404).send()
		} else {
			if (user.searchHistory.length < 4) {
				res.status(404).send()				
			} else{				
				// remove duplicates from search history to find random artist
				const filteredArray = user.searchHistory.filter((v,i) =>  user.searchHistory.indexOf(v) === i)			
				const artist = filteredArray[Math.floor(Math.random()*filteredArray.length)];			
				res.status(200).send({ artist })
			}
		}
	}, (error) => {
		res.status(500).send(error)
		console.log(error);	
	})
});


// ------ Admin routes ------
app.patch('/users/update/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    const { username, password } = req.body;
    const body = { username, password };

    User.findById(id).then((user) => {
        if (!user) {
            res.status(404).send();
        } else {
            user.username = body.username;
            user.password = body.password;
            user.save();
            req.session.username = body.username;
            res.send(user);
        }
    }).catch((error) => {
        res.status(400).send(error);
    });

})


// update user's username
app.patch('/users/username/:id', (req, res) => {	
	const id = req.params.id;
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	
	User.findByIdAndUpdate(id, {username: req.body.username}, {new: true}).then((user) => {
		if (!user) {
			res.status(404).send()
		} else {
			res.send({ user })
		}
	}).catch((error) => {
		res.status(400).send(error)
	})
})
// update user's password
app.patch('/users/password/:id', (req, res) => {	
	const id = req.params.id
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	
	User.findById(id).then((user) => {
		if (!user) {
			res.status(404).send()
		} else {
			user.password = req.body.password
			user.save().then((user) => {
				res.send({user})
			}).catch((error) => {
				res.status(400).send(error)
			})
		}
	}).catch((error) => {
		res.status(400).send(error)
	})
})

// delete user
app.delete('/users/:id', (req, res) => {	
	const id = req.params.id
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	
	// remove user from databse
	User.findByIdAndRemove(id).then((user) => {
		if (!user) {
			res.status(404).send()
		} else {
			res.status(200).send({ user })
		}
	}).catch((error) => {
		res.status(500).send(error)
	})
})


/// ----- API Routes --------
// get all users
app.get('/users', (req, res) => {
	User.find({}, {password: 0}).then((users) => {
		if (!users){
			res.status(404).send()
		} else {
			res.status(200).send({ users })
		}
	}, (error) => {
		res.status(500).send(error)
	})
});
// get user by id
app.get('/users/:id', (req, res) => {
	// check if valid id
	const id = req.params.id
	
	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}
	User.findById(id, {password: 0}).then((user) => {
		if (!user){
			res.status(404).send()
		} else {
			res.status(200).send({ user })
		}
	}, (error) => {
		res.status(500).send(error)
	})
});

//// Featured Artist

app.get('/featuredArtist', (req, res) => {
	FeaturedArtist.find({}, {password: 0}).then((artists) => {
		res.status(200).send({ artists })
	}, (error) => {
		res.status(500).send(error)
	})
});

app.post('/featuredArtist', (req, res) => {

	// Create a new featured artist
	const artist = new FeaturedArtist({
		name: req.body.name,
		_id: req.body.spotify_id,
		image: req.body.image
	});

	// save user to database
	artist.save().then((result) => {
		res.status(200).send();
	}, (error) => {
		console.log(error);
		res.status(400).send(error); // 400 for bad request
	})

});


app.delete('/featuredArtist/:id', (req, res) => {
    const id = req.params.id;

    // Otheriwse, findByIdAndRemove
    FeaturedArtist.findByIdAndRemove(id).then((artist) => {
        if (!artist) {
			res.status(404).send()
        } else {
            res.status(200).send({ artist })
        }
    }).catch((error) => {
        res.status(500).send(error)
    })
});


app.get('/artist', (req, res) => {
    Artist.find({}, {password: 0}).then((artists) => {
		res.status(200).send({ artists }) // put in object in case we want to add other properties
	}, (error) => {
		res.status(500).send(error)
	})
});

app.get('/artist/:spotify_id', (req, res) => {
	const spotify_id = req.params.spotify_id
	Artist.find({spotify_id:spotify_id}).then((artist) => {
		res.status(200).send(artist)
	}, (error) => {
		res.status(500).send(error)
	})
})



/* 
-----------------------------------------------------------------------------------------
Check artist:
   1. Add to database if current artist has not been checked before
   2. Update the checked list for artist if current artist has already been checked before

   params: spotify_id: spotify id of the artist that user want to check

   Request body expects:
	{
        name: artist name (string),
        image: image link (string),
        last_checked_time: last checked time (string),
        genre: genre of the artist (string)
    }
-----------------------------------------------------------------------------------------
*/

app.post('/checkedArtist/:spotify_id', (req, res) => {
	const spotify_id = req.params.spotify_id;
	const user_id = req.session.user;

	Artist.find().then((artists) => {
		const result_artist = artists.find(checkartist => checkartist.spotify_id === spotify_id);
		
		// Create a new artist if the artist has never been checked before
		// And store that artist into database and user's "checked artist" list
		if(!result_artist){
			const artist = new Artist({
				name: req.body.name,
				checks: 1,
				spotify_id: spotify_id,
				image: req.body.image,
				last_checked:req.body.last_checked_time,
				genre: req.body.genre
			});
			artist.save().then((result) => {
				res.status(200).send();
			}).catch((error) =>{
				res.status(500).send(error)
			})
			User.findByIdAndUpdate(user_id, {$push : {artists: artist}}, {new:true}).then((result)=>{
				res.send(result)
			}).catch((error) => {
				res.status(500).send(error)
			})
		}else{

			// If the artist has been checked before, then increment the checks number and update the checked time.
			// And add it to the user's "checked artist" list
			// updated it in the Artist database
			result_artist.last_checked = req.body.last_checked_time
			result_artist.checks += 1
			User.findByIdAndUpdate(user_id, {$push:{artists: result_artist}}, {new:true}).then((result)=>{

			}).catch((error) => {
				res.status(500).send(error)
			})

			Artist.findOneAndUpdate({spotify_id:spotify_id}, {$set:{checks:result_artist.checks, last_checked:result_artist.last_checked}}, {new:true}).then((result)=>{
				res.send(result)
			}).catch((error) => {
				res.status(500).send(error)
			})
		}
	}).catch((error) => {
		res.status(500).send(error)
	})
})


/* 
-----------------------------------------------------------------------------------------
Uncheck artist:
   1. Remove the artist from the user's "checked artist" list

   params: spotify_id: spotify id of the artist that user want to uncheck
-----------------------------------------------------------------------------------------
*/
app.delete('/checkedArtist/:spotify_id', (req, res) => {
	const spotify_id = req.params.spotify_id;
	const user_id = req.session.user;

	Artist.find().then((artists) => {
		const result_artist = artists.find(checkartist => checkartist.spotify_id === spotify_id);

		if(!result_artist){
			res.status(404).send()
		}else{
			User.findByIdAndUpdate(user_id, {$pull:{artists:{spotify_id:spotify_id}}},{new:true}).then((result)=>{

			}).catch((error) => {
				res.status(500).send(error)
			});

			Artist.findOneAndUpdate({spotify_id:spotify_id}, {$inc:{checks:-1}}).then((result)=>{
				res.status(200).send();
			}).catch((error) => {
				res.status(500).send(error)
			})
		}
	}).catch((error) => {
		res.status(500).send(error)
	})
})
/*
	Three information are returned to client 

	1. If the artist has been checked
	2. Total check number of the artist
	3. Last checked time of the artist
*/
app.get('/checkedArtist/:spotify_id', (req, res) => {
	const spotify_id = req.params.spotify_id
	const user_id = req.session.user

	if (!ObjectID.isValid(user_id)) {
		return res.status(404).send()
	}
	User.findById(user_id).then((user) => {
		if (!user){
			res.status(404).send()
		} else {
			const checked = user.artists.find(function(artist) {
				return artist.spotify_id === spotify_id;
			})
			Artist.find().then((artists) => {
				const result_artist = artists.find(checkartist => checkartist.spotify_id === spotify_id);
				if(!result_artist && !checked){
					res.send({"Checked":0, "checks":0})
				}else if(result_artist && !checked){
					res.send({"Checked":0, "checks":result_artist.checks,"last_checked":result_artist.last_checked})
				}else if(result_artist && checked){
					res.send({"Checked":1, "checks":result_artist.checks,"last_checked":result_artist.last_checked})
				}else{
					res.status(400).send()
				}
			}).catch((error) => {
				res.status(500).send(error)
			})
		}
	}).catch((error) => {
		res.status(500).send(error)
	})
})

app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
});