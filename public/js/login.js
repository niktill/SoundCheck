// Document elements we need
// Log In Elements
const logInUsername = document.querySelector("#usernameLogIn");
const logInPassword = document.querySelector("#passwordLogIn");

// Sign Up Elements
const signUpUsername = document.querySelector("#usernameSignUp");
const signUpPassword = document.querySelector("#passwordSignUp");
const confirmPassword = document.querySelector("#confirmPassword");

//Buttons
const signInButton = document.querySelector("#signInButton");
const createAccountButton = document.querySelector("#createAccountButton");

// Event listners
// signInButton.addEventListener("click", signIn);
// createAccountButton.addEventListener("click", createAccount);

// Functions
function signIn(e) {
    e.preventDefault();
    // would check here if username already exists in database or if details are not 
    const username = logInUsername.value;
    const password = logInPassword.value;
    const data = {
        username,
        password
    };
    const url = '/users/login';
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
            
            return alert('Successfully Logged In!')
           
        } else {
            return alert('Invalid account details!')
     
        }        
    }).catch((error) => {
        console.log(error)
    }) 

}

function createAccount(e){
    e.preventDefault();
    // would check here if username already exists in database or if details are not 
    const username = signUpUsername.value;
    const password = signUpPassword.value;
    const password2 = confirmPassword.value;
    // check if pass word confirm is correct
    if (password !== password2){
        return alert('Passwords do not match!')
    }
    const data = {
        username,
        password
    }
    const url = '/users'
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
            return alert('Successfully created account!')
           
        } else {
            return alert('Invalid account creation!')
     
        }        
    }).catch((error) => {
        console.log(error)
    }) 
}

// DOM Functions