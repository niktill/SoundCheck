// user class
// On load get the users from database
function getUsers() {
    const url = '/users';

    fetch(url)
    .then((res) => { 
        if (res.status === 200) {
           return res.json() 
       } else {
            alert('Could not get users')
       }                
    }).then((json)=>{
        populateUserList(json.users)
        
    }).catch((error) => {
        console.log(error)
    })
}
getUsers();

// DOM elements to be manipulated
const userList = document.querySelector('#userList');



// Event listeners
userList.addEventListener("click", removeUser);
userList.addEventListener("click", editDetails);

// DOM function
// This function receives an array of user objects and inserts them into the userList on admin.html
function populateUserList(array) {
    for (let index = 0; index < array.length; index++) {
        const user = array[index];
        
        const card = document.createElement('div');
        card.className = 'card';
        userList.appendChild(card);

        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.innerText = `User ID: ${user._id}`;
        card.appendChild(cardHeader);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        card.appendChild(cardBody);

        const detailsList = document.createElement('ul');
        cardBody.appendChild(detailsList);
        // Username
        const detailEl = document.createElement('li');
        detailsList.appendChild(detailEl);

        let detailsText = document.createElement('p');
        detailsText.innerText = `Username: ${user.username}`;
        detailEl.appendChild(detailsText);

        const usernameForm = document.createElement('form');
        detailEl.appendChild(usernameForm);

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'change username';
        usernameInput.name = 'username';
        usernameForm.appendChild(usernameInput);

        const editUsernameButton = document.createElement('button');
        editUsernameButton.className = 'edit-button';
        usernameForm.appendChild(editUsernameButton);

        const editIcon = document.createElement('i');
        editIcon.className = 'fa fa-pencil';
        editUsernameButton.appendChild(editIcon);
        // Password
        const detailEl2 = document.createElement('li');
        detailsList.appendChild(detailEl2);

        const passwordForm = document.createElement('form');
        detailEl2.appendChild(passwordForm);

        const passwordInput = document.createElement('input');
        passwordInput.type = 'text';
        passwordInput.placeholder = 'change password';
        passwordInput.name = 'password';
        passwordForm.appendChild(passwordInput);

        const editPasswordButton = document.createElement('button');
        editPasswordButton.className = 'edit-button';
        passwordForm.appendChild(editPasswordButton);

        const editIcon2 = document.createElement('i');
        editIcon2.className = 'fa fa-pencil';
        editPasswordButton.appendChild(editIcon2);

        // Footer
        const footer = document.createElement('div');
        footer.className = 'card-footer';
        card.appendChild(footer);

        const removeButton = document.createElement('button');
        removeButton.innerText = 'Remove User';
        footer.appendChild(removeButton);
    }
}

// removes user from the DOM and database
function removeUser(e) {
    e.preventDefault();
    if (e.target.tagName === 'BUTTON' && e.target.innerText === 'Remove User'){
        // remove user from database
        // get user's id
        const str = e.target.parentElement.parentElement.children[0].innerText
        
        const id = str.substring(9, str.length)
        // set url
        const url = '/users/' + id;            
        const request = new Request(url, {
            method: 'delete', 
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
        });
        fetch(request)
        .then(function(res) {
            // Handle response we get from the API
            if (res.status === 200) {
                alert('User deleted')
                return res.json() 
            } else {
                alert('Could not delete username')
            }
        }).then((json)=>{
            const list = e.target.parentElement.parentElement.parentElement;
            return list.parentElement.removeChild(list);
        }).catch((error) => {
            console.log(error)
        })
    }
}

function editDetails(e){
    e.preventDefault();
    if (e.target.className == 'edit-button'){
        if (e.target.previousSibling.name == 'username'){
            //change username of user in database
            // get user's id
            const str = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerText
            const id = str.substring(9, str.length)
            // set url
            const url = '/users/username/' + id;            
            const newUsername = e.target.previousSibling.value;
            data = {
                username: newUsername
            }
            const request = new Request(url, {
                method: 'PATCH', 
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
                    alert('Username updated')
                    return res.json() 
                } else {
                    alert('Could not update username')
                }
            }).then((json)=>{
                return e.target.parentElement.previousSibling.innerText = `Username: ${json.user.username}`;
            }).catch((error) => {
                console.log(error)
            })
        }
        else if (e.target.previousSibling.name === 'password'){
            //change username of user in database
            // get user's id
            const str = e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[0].innerText
            const id = str.substring(9, str.length)
            // set url
            const url = '/users/password/' + id;            
            const newPassword = e.target.previousSibling.value;
            data = {
                password: newPassword
            }
            const request = new Request(url, {
                method: 'PATCH', 
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
                    alert('Password updated!')
                    return res.json() 
                } else {
                    alert('Could not update password')
                }
            }).then((json)=>{
            }).catch((error) => {
                console.log(error)
            })
        }
    }
}