// Dom elements to manipulate
const featuredArtistList = document.querySelector("#featuredArtistsList");
const mostCheckedArtistsList = document.querySelector("#mostCheckedArtistsList");

// DOM Function
// We assume that our database will provide use with the featured artists already
// This function will add the Artists objects inside array to the featuredArtistsList on index page
function populateFeaturedArtists(name, id, image, admin) {
    const div = document.createElement('div');
    div.className = 'container';

    const img = document.createElement('img');


    img.src = image;
    img.alt = name;
    img.className = 'image';

    const middle = document.createElement('div');
    middle.className = 'middle';

    if (admin === 1) {
        const button = document.createElement('button');
        button.className = 'closeButton';
        button.onclick = function() {
            //removes artist from the DOM
            const list = this.parentElement.parentElement.parentElement;
            featuredArtistList.removeChild(list);
            deleteFeatured(id);
        };
        const inner = document.createElement('i');
        inner.className = 'fa fa-close';
        button.appendChild(inner);
        middle.appendChild(button);
    } else {
        const a = document.createElement('a');
        a.className = 'text';
        a.innerText = name;
        a.href = 'https://open.spotify.com/artist/' + id;
        a.target = '_blank';

        middle.appendChild(a);
    }

    div.appendChild(img);
    div.appendChild(middle);

    const listEl = document.createElement('li');
    listEl.appendChild(div);

    featuredArtistList.appendChild(listEl);
}


// DOM Function
// We assume that our database will provide use with the most checked artists (in the right order) already
// This function will add the Artists objects inside array to the mostCheckedArtistsList on index page
function populateMostLikedArtists(name, spotify_id, image, total_check) {
    // create new card to add to mostCheckedArtistsList
    const listEl = document.createElement('li');
    const artistCard = document.createElement('div');
    artistCard.className = 'card';

    const artistImage = document.createElement('img');
    artistImage.src = image;

    artistImage.alt = name;

    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    const artistName = document.createElement('h4');
    artistName.className = 'title';
    artistName.innerText = name;

    const checks = document.createElement('h5');

    const checksSpan = document.createElement('span');
    checksSpan.className = 'checks';
    checksSpan.innerText = 'Checks: ';

    const checksNumSpan = document.createElement('span');
    checksNumSpan.className = 'badge badge-light';
    checksNumSpan.innerText = total_check;

    const spotifyLink = document.createElement('a');
    spotifyLink.className = 'spotifyLink';
    spotifyLink.innerText = 'View Spotify Page';
    spotifyLink.href = 'https://open.spotify.com/artist/' + spotify_id;
    spotifyLink.target = '_blank';

    artistCard.appendChild(artistImage);
    artistCard.appendChild(cardBody);
    cardBody.appendChild(artistName);
    cardBody.appendChild(checks);
    checks.appendChild(checksSpan);
    checksSpan.appendChild(checksNumSpan);
    cardBody.appendChild(spotifyLink);

    listEl.appendChild(artistCard);
    mostCheckedArtistsList.appendChild(listEl);
}

function getLikedArtist() {
    const url = '/artist';

    fetch(url)
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            } else {
                alert('Could not get featured artists')
            }
        })
        .then((json) => {
            const sorted_artist_list = json.artists.sort((function(artist_a, artist_b){
                return artist_b.checks - artist_a.checks;
            }))
            sorted_artist_list.slice(0, 4).map((s)=>{
                if(s.checks !== 0){
                    populateMostLikedArtists(s.name, s.spotify_id, s.image, s.checks)
                }
            })
        }).catch((error) => {
            alert("Error adding most liked artist");
    })
}

function getFeaturedArtist() {
    fetch('/admin')
        .then((res) => {
            if (res.status === 200) {
                return res.json()
            } else {
                alert('Could not check if user is admin')
            }
        }).then((json) => {
            fetch('/featuredArtist')
                .then((res) => {
                    if (res.status === 200) {
                        return res.json()
                    } else {
                        alert('Could not get artists')
                    }
                })
                .then((j) => {
                    j.artists.map((s) => {
                        populateFeaturedArtists(s.name, s._id, s.image, json.admin);
                    })
                }).catch((error) => {
                    alert(error.stack);
                })
        }
    );
}

function deleteFeatured(spotify_id) {
    const url = '/featuredArtist/' + spotify_id;

    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'delete',
        body: JSON.stringify({spotify_id: spotify_id}),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            if (res.status === 200) {

            } else {
                alert('Could not delete featured artist');
            }
        }).catch((error) => {
        alert('Could not delete featured artist');
    })
}
getFeaturedArtist();
getLikedArtist();