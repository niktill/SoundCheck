const log = console.log;
//  Search result class
class SearchResult{
	constructor(Image, Name, SpotifyId, Genre){
		this.Image = Image;
		this.Name = Name;
		this.SpotifyId = SpotifyId;
		this.Genre = Genre;
        this.Checks = 0;
	}
}

// DOM elements
const artistNameInput = document.querySelector("#artist");
const searchButton = document.querySelector("#search");
const randomSearchButton = document.querySelector("#randomSearch");
const Result = document.querySelector('#SearchResult');


// Event Listners
searchButton.addEventListener('click', search);
if (randomSearchButton !== null) {
    randomSearchButton.addEventListener('click', search);
}

// ------FUNCTIONS-----

// Search for Artists by making call to server
// if admin: Search for artist based on artist name
// if regular user: Search for related Artists based on artist name
// if random search get the genre of a random artist from users search history
async function search(e) {
    e.preventDefault();
    let artistName
    let random
    // is it a random search? if so get random search from user's search history to make search
    if (e.target.id === 'randomSearch') {       
        random = 1 
        artistName = await getRandomArtist()
        if (!artistName){
            return
        } 
    } else {
        random = 0
        artistName = artistNameInput.value
        if (artistName === ""){
            return alert('Invalid input')
        }
    }
    // check if user is admin for what type of search we are performing
    let admin
    fetch('/admin').then((result) =>{
        if (result.status === 200){
            return result.json()
        } else {
            alert('Not signed in')
        }
    }).then((json)=>{
        if (json.admin === 1){
            return 1
        } else {
            return 0
        }
    }).then((adm)=>{
        admin = adm
        // make request to our server
        const url = '/search';
        data = {
            random: random,
            artist: artistName
        }            
        const request = new Request(url, {
            method: 'post', 
            body: JSON.stringify(data),
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        });
        fetch(request)
        .then(function(res) {
            // Handle response we get from the API
            if (res.status === 200) {
                return res.json() 
            } else if (res.status === 404 || res.status === 400) {
                alert('Artist not found')
            } else {
                alert('Unable to connect to Spotify API')
            }
        }).then((json)=>  {
            // check is results are empty and notify client
            if (!json){
                return
            }
            // check if results are empty
            let array
            // check what type of serach we did
            if (admin === 1 || random === 1){
                array = json.artists.items;
                if (array.length === 0){
                    return alert('Artist not found')
                }
            } else {
                array = json.artists;
                if (array.length === 0){
                    return alert('No related artists found')
                }
            }
            // remove previous search result
            const results = document.querySelector('#SearchResult')
            results.innerHTML = ""
            let searchResult = []
            // build up results
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                let imageURL
                if (element.images.length !== 0){
                    imageURL = element.images[0].url
                } else {
                    imageURL = '../img/profile.png'
                }
                let genre
                if (element.genres.length !== 0){
                    genre = element.genres[0]
                } else {
                    genre = 'N/A'
                }
                let artist = new SearchResult(imageURL, element.name, element.id, genre)
                
                searchResult.push(artist)
            }        
            // add results to DOM
            if (admin === 1) {
                fetch('/featuredArtist')
                    .then((res) => {
                        if (res.status === 200) {
                            return res.json()
                        } else {
                            alert('Could not get artists')
                        }
                    }).then((json) =>
                        populateSearchResult(searchResult, json.artists, admin));
            } else {
                //TODO
                // if random search show what genre they searched up
                if(random === 1){
                    artistNameInput.value = searchResult[0].Genre;
                }
                populateSearchResult(searchResult, [], 0)
            }

        })
    }).catch((error)=>{
        console.log(error);
    })

}
// Get Random Artist
// makes a request to our server to get a random artist name from user
async function getRandomArtist(){
    let artist;
    await fetch('/random').then((result) => {
        if (result.status === 200){
            return result.json()
        } else if (result.status === 404){
            alert('Perform more searches to use random search')
        }
        else {
            alert('Could not perform random search')
        }
    }).then((json) => {
        if (json){
            artist = json.artist
        }
    }).catch((error) => {
        console.log(error);
    });
    return artist
}

// Check or Uncheck Artist
// Result.dispatchEvent(event);
/*Check if the "check" button is clicked*/

/*Populate all the search result to the page
check if any of the search result items are in user's check artists, if they are start with a red check on it
*/
function populateSearchResult(searchResultList ,checkedArtists, admin){
    const cardgroup = document.createElement('div');
    cardgroup.className = 'card-deck';

    for (let i = 0; i < searchResultList.length; i++) {
        const card = document.createElement('div');
        card.className = 'card text-center';

        const img = document.createElement('img');
        img.src = searchResultList[i].Image;
        img.className = 'card-img-top';

        const middle = document.createElement('div');


        const button = document.createElement('button');
        button.className = 'checkButton';
        const j = document.createElement('i');
        const span2checks = document.createElement('span');
        span2checks.className = 'badge badge-light';

        const h5lastCheck = document.createElement('h5');
        const span1lastCheck = document.createElement('div');
        span1lastCheck.className = 'feature';
        const lastCheck = document.createTextNode('Last Checked: ');
        const span2lastCheck = document.createElement('span');
        span2lastCheck.className = 'badge badge-light';
        if (admin === 0) {
            const url = '/checkedArtist/' + searchResultList[i].SpotifyId;
            fetch(url).then((res) => {
                if (res.status === 200) {
                    return res.json()
                } else {
                    alert('Could not check if current artist is checked or not')
                }
            }).then((json) => {
                // Handle the case that artist has not been checked
                if(json.Checked === 0){
                    j.className = 'fa fa-check-circle checkIcon';
                    middle.className = 'middle';
                    span2checks.innerText = json.checks;
                    if(!json.last_checked){
                        span2lastCheck.innerText = 'N/A'
                    }else{
                        span2lastCheck.innerText = json.last_checked;
                    }
                // Handle the case that artist has been checked
                } else {
                    j.className = 'fa fa-check-circle checkIcon red';
                    middle.className = 'middlered';
                    span2checks.innerText = json.checks;
                    span2lastCheck.innerText = json.last_checked;
                }
            });
        } else {            
            const url = '/artist/' + searchResultList[i].SpotifyId;
            fetch(url).then((res) => {
                if (res.status === 200) {
                    return res.json()
                } else {
                    alert('Could not check if current artist is checked or not')
                }
            }).then((json) => {
                if(json[0]){
                    span2checks.innerText = json[0].checks;
                    span2lastCheck.innerText = json[0].last_checked;
                }else{
                    span2checks.innerText = 0;
                    span2lastCheck.innerText = 'N/A';
                }
            }).catch((error) => {
                log(error)
            })
            j.className = 'fa fa-check-circle checkIcon';
            middle.className = 'middle';
            if (checkedArtists.find(a => a._id === searchResultList[i].SpotifyId) !== undefined) {
                j.classList.add('red');
                middle.classList.replace('middle', 'middlered');
            }
        }
        console.log(j);
        
        j.onclick = function() {            
            const time = new Date()
            const last_checked_time = time.getFullYear() + "/" + ("0" + (time.getMonth() + 1)).slice(-2) + "/" + ("0" + time.getDate()).slice(-2) + " " + ("0" + time.getHours()).slice(-2) + ":" + ("0" + time.getMinutes()).slice(-2)
            
            // Figuring out the event is check or uncheck
            const check = checkAndUncheck(j, searchResultList[i].Name, searchResultList[i].SpotifyId, searchResultList[i].Image, searchResultList[i].Genre, admin, last_checked_time);
            let check_num = Number(span2checks.innerHTML)
            
            if(admin === 0){
                // Event is check
                if(check === 1){
                    check_num += 1
                    span2checks.innerHTML = check_num
                    span2lastCheck.innerText = last_checked_time
                }
                // Event is uncheck
                if(check === 0){
                check_num -= 1
                span2checks.innerHTML = check_num
                }
            }
        
        };
        button.appendChild(j);
        middle.appendChild(button);

        const cardbody = document.createElement('div');
        cardbody.className = 'card-body';

        const h4 = document.createElement('h4');
        h4.className= 'card-title';
        h4.innerText = searchResultList[i].Name;

        const h5checks = document.createElement('h5');
        const h5genre = document.createElement('h5');
        const span1checks = document.createElement('span');
        span1checks.className = 'feature';
        const span1genre = document.createElement('div');
        span1genre.className = 'feature';
        const span2genre = document.createElement('span');
        span2genre.className = 'badge badge-light';


        span2genre.innerText = searchResultList[i].Genre;

        const checks = document.createTextNode('Checks: ');
        const genre = document.createTextNode('Genre: ');

        span1checks.appendChild(checks)
        span1genre.appendChild(genre)
        span1checks.appendChild(span2checks)
        span1genre.appendChild(span2genre)
        span1lastCheck.appendChild(lastCheck)
        span1lastCheck.appendChild(span2lastCheck)
        h5checks.appendChild(span1checks)
        h5genre.appendChild(span1genre)
        h5lastCheck.appendChild(span1lastCheck)

        const a = document.createElement('a');
        const link_div = document.createElement('div')
        link_div.className = 'link_div'
        a.href = 'https://open.spotify.com/artist/' + searchResultList[i].SpotifyId;
        a.target = "_blank";
        a.className = 'spotifyLink';
        a.innerText = "View Spotify Page";
        a.onclick = function () {
            window.open(a.href);
        };
        const cardFooter =  document.createElement('div');
        cardFooter.className = 'card-footer';

        link_div.appendChild(a)
        cardFooter.appendChild(link_div);
        cardbody.appendChild(h4);
        cardbody.appendChild(h5checks);
        cardbody.appendChild(h5genre);
        cardbody.appendChild(h5lastCheck);
        

        card.appendChild(img);
        card.appendChild(middle);;
        card.appendChild(cardbody);
        card.appendChild(cardFooter);

        cardgroup.appendChild(card);
    }
    Result.appendChild(cardgroup);
}

/*Change the check button to red*/
function checkAndUncheck(button, name, spotify_id, image, genre, admin, last_checked_time){
    let middle = button.parentNode.parentNode;
    if(button.classList.contains('red')){
        button.classList.remove('red');
        middle.classList.replace('middlered', 'middle');
        if (admin === 1) {
            deleteFeatured(spotify_id);
        } else {
            UncheckArtist(spotify_id)
        }
        return 0
    }else{
        button.classList.add('red')
        middle.classList.replace('middle', 'middlered');
        if (admin === 1) {
            addFeatured(name, spotify_id, image);
        } else {
            CheckArtist(name, spotify_id, image, genre, last_checked_time)
        }
        return 1
    }
}

/* Add/Delete featured artists for admin */
function deleteFeatured(spotify_id) {
    const url = '/featuredArtist/' + spotify_id;

    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'delete',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            if (res.status === 200) {

            } else {
                alert('Could not delete featured artist')
            }
        }).catch((error) => {
        alert('Could not delete featured artist');
    })
}

function addFeatured(name, spotify_id, image) {
    const url = '/featuredArtist';

    let data = {
        name: name,
        spotify_id: spotify_id,
        image: image
    };

    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            // Handle response we get from the API
            // Usually check the error codes to see what happened
            if (res.status !== 200) {
                alert('Featured artists not added')
            }

        }).catch((error) => {
            alert(error);
    })
}


/* Check/Uncheck artists for user */
function CheckArtist(name, spotify_id, image, genre, last_checked_time) {
    const url = '/checkedArtist/' + spotify_id;

    let data = {
        name: name,
        image: image,
        last_checked_time: last_checked_time,
        genre: genre
    };
    const request = new Request(url, {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            // Handle response we get from the API
            // Usually check the error codes to see what happened
            if (res.status === 200) {
                log('Checked artists added')
            } else {
                log('Checked artists not processed')
            }
        }).catch((error) => {
        console.log(error)
    })
}

function UncheckArtist(spotify_id) {
    const url = '/checkedArtist/' + spotify_id ;
    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'delete',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            if (res.status === 200) {
                log('Checked artists deleted')
            } else {
                log('Uncheck artist not processed')
            }
        }).catch((error) => {
            console.log(error);
    })
}







