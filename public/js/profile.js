// JavaScript source code

let thisUser;

window.onload = getUser

function getUser() {
    fetch('/current-user')
        .then((res) => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert('Error loading user');
            }
        }).then((user) => {

            initializeProfile(user);
            populateGenre(user.artists);
            populateCheckedArtists(user.artists);
            populateSearchHistory(user.searchHistory);
            thisUser = user;
        })
}

 

function initializeProfile(user) {
    document.querySelector("#username").innerHTML = user.username
    //document.querySelector("#profilePicture").setAttribute("src", thisUser.profilePic)
    document.querySelector("#profilePicture").setAttribute("alt", user.username)
}

function populateGenre(artists) {
    const div = document.querySelector("#top-genre");
    const arr = {};

    if (typeof artists === 'undefined') {
        return;
    }

    artists.forEach(((art) => {
        if (arr[art.genre] !== undefined) {
            arr[art.genre]++;
        } else {
            arr[art.genre] = 1;
        }
    }));

    const genres = [];
    Object.keys(arr).forEach((g) => {
        genres.push([g, arr[g]]);
    });

    genres.sort(function(a, b) {
        return b[1] - a[1];
    });


    genres.forEach((g) => {
        const genre = g[0];
        const button = document.createElement("button");

        button.innerHTML = genre;
        button.className = "text genre";
        button.onclick = function (event) {
            if (this.style.background === "rgb(184, 216, 216)") {
                this.style.background = "cornflowerblue";
                fetch('/current-user')
                    .then((res) => {
                        if (res.status === 200) {
                            return res.json();
                        } else {
                            alert('Error loading user');
                        }
                    }).then((user) => {
                        const artists = user.artists.filter(a => a.genre === genre);
                        populateCheckedArtists(artists);
                         for (let i = 0; i < div.children.length; i++) {
                            if (div.children[i].innerHTML !== genre) {
                                div.children[i].disabled = true;
                                div.children[i].style.opacity = "0.5";
                            }
                         }
                })
            } else {
                this.style.background = "#B8D8D8";
                fetch('/current-user')
                    .then((res) => {
                        if (res.status === 200) {
                            return res.json();
                        } else {
                            alert('Error loading user');
                        }
                    }).then((user) => {
                        populateCheckedArtists(user.artists);
                        for (let i = 0; i < div.children.length; i++) {
                            div.children[i].disabled = false;
                            div.children[i].style.opacity = "1";
                        }
                })
            }

        };
        div.appendChild(button);
    });

}

function populateCheckedArtists(artists) {
    const div = document.querySelector("#checked");

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    artists.forEach((artist) => {
        const newArtistEl = document.createElement("div");
        newArtistEl.classList.add("container");
        newArtistEl.classList.add("checkedArtist");

        const img = document.createElement("img");
        img.classList.add("image");
        img.src = artist.image;
        img.alt = artist.name;

        const middle = document.createElement("div");
        middle.className = "middle";

        const button = document.createElement("button");
        button.className = "button checkButton";
        button.onclick = function(){
            uncheckArtist(artist.spotify_id);
            const div = this.parentElement.parentElement;
            div.remove()
        };

        const checkIcon = document.createElement("i");
        checkIcon.className = "fa fa-check-circle checkIcon";
        checkIcon.setAttribute("aria-hidden", "true");

        const uncheckIcon = document.createElement("i");
        uncheckIcon.className = "fa fa-times-circle uncheckIcon";
        uncheckIcon.setAttribute("aria-hidden", "true");

        const link = document.createElement("a");
        link.className = "checkedArtistName";
        link.classList.add("align-middle");
        link.href = 'https://open.spotify.com/artist/' + artist.spotify_id;
        link.innerText = artist.name;

        button.appendChild(checkIcon);
        button.appendChild(uncheckIcon);
        middle.appendChild(button);
        newArtistEl.appendChild(img);
        newArtistEl.appendChild(middle);
        newArtistEl.appendChild(link);

        div.appendChild(newArtistEl)
    });
    
}


function populateSearchHistory(searchHistory) {
    const searchHist = document.getElementById("search-history")
    const visited = []
    let i = searchHistory.length - 1
    let count = 20
    while (i >= 0 && count >= 0) {
        const search = searchHistory[i];
        if (visited.includes(search)) {
            i -= 1;
            continue;
        }

        const link = document.createElement("span")

        //link.href = "searchView/search.html"
        link.innerHTML = searchHistory[i]
        link.className = "text search-history-text"
        searchHist.appendChild(link)
        visited.push(search);

        i -= 1
        count -= 1
    }
}


function uncheckArtist(spotify_id) {
    const url = '/checkedArtist/' + spotify_id ;
    // Create our request constructor with all the parameters we need
    const request = new Request(url, {
        method: 'delete',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });
    fetch(request)
        .then(function(res) {
            if (res.status === 200) {
                //alert('Checked artists deleted')
            } else {
                alert('Uncheck artist not processed')
            }
        }).catch((error) => {
            alert("Error removing artist");
        });
}


function editProfile() {
    const username = document.getElementById("username")
    const input = document.createElement("input")
    input.id = "new-username"
    input.classList.add("username-input")
    input.placeholder = thisUser.username

    input.onfocus = function () {
        input.placeholder = ""
    }

    input.onfocusout = function () {
        if (input.value === "") {
            input.placeholder = thisUser.username
        }
    };

    username.replaceWith(input);

    const passwordInputs = document.querySelectorAll(".password-input");
    for (let i = 0; i < passwordInputs.length; i++) {
        passwordInputs[i].value = "";
        passwordInputs[i].style.display = "block"
    }

    const saveButton = document.querySelector(".save-button");
    saveButton.style.display = "inline";
    const cancelButton = document.querySelector(".cancel-button");
    cancelButton.style.display = "inline";
}

function cancelEdit() {
    const username = document.createElement("h2");
    username.id = "username";
    username.innerHTML = thisUser.username;

    const input = document.querySelector("#new-username");
    input.replaceWith(username);

    const passwordInputs = document.querySelectorAll(".password-input")
    for (let i = 0; i < passwordInputs.length; i++) {
        passwordInputs[i].style.display = "none"
    }

    document.querySelector(".save-button").style.display = "none";
    document.querySelector(".cancel-button").style.display = "none";
}

function saveProfile() {
    const newUsername = document.getElementById("new-username").value
    const newPassword = document.getElementById("new-password").value
    const confirmPassword = document.getElementById("confirm-new-password").value

    if (newPassword.length > 0 && newPassword !== confirmPassword) {
        alert("Passwords do not match!");
        return
    }

    if (newPassword.length < 4 || confirmPassword.length < 4) {
        alert("Password must contain at least 4 characters");
        return
    }

    if (newUsername.length > 0) {
        thisUser.username = newUsername
    }

    if (newPassword.length > 0) {
        thisUser.password = newPassword
    }

    alert("Changes have been saved");


    //Save changes to User object server by requesting POST and reload page
    changeUsername();

    window.location.reload(true)
}

function changeUsername() {
    const url = '/users/update/' + thisUser._id;
    data = { username: thisUser.username, password: thisUser.password };

    const request = new Request(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            return res.json();
        } else {
            alert("Error while updating account");
        }
    }).catch((error) => {
        console.log(error);
    });
}