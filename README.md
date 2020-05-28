## SoundCheck

SOUNDCHECK (https://dry-island-15572.herokuapp.com)

#### Overview of routes

------

1. /login: User authentication

2. /users: GET/UPDATE user accounts

3. /current-user: GET user in session

4. /admin: Check if user is admin

5. /search: Search for Artists

6. /random: Do random search for artists

7. /featuredArtist: GET/UPDATE featured artists

8. /checkedArtist: GET/UPDATE checked artists of users

   

#### Edits/New features made

------

###### New features:

1. "I'm Feeling Lucky" search (like the Google search engine)
   - Based on current checked artists by user
   - Search artists based on a random genre
2. Sort genres based on checked artists
3. Filter checked artists based on selected genre
4. Users can see how many checks an artists has got and the most recent time they were checked so that they have an idea of the "recency" of that check
5. Ability to search for artists directly by their name (in Admin accounts), and dynamically adding/removing them from "Featured Artists" section

#### HOW TO USE

------

###### Regular USER

------

As as regular user to access the website, create an account by clicking on the "create 
an account" button on the login page. Please note that passwords must have a length of at least 4 and usernames
must be unique and only contain alphanumeric characters (the login page will notify you is these rules are violated). 
After successfully logging in or creating an account, you will be directed to the homepage.

###### Home Page

On the home page a regular user can view featured artists that are added by admins of the website and the artists 
that have the most checks from all users. On the navagation bar at the top are links to the search page, 
the user's profile and a log out button.

###### Search Page

On the search page a regular user can use the search bar to find related artists to the artist that they input
to the search bar. As this uses the Spotify API, inserting a correct artist name is required. Clicking on the dice
button beside the search bar will perform a random search that will return artists within a genre that is the same
as a randomly selected artist from the user's searh history. There are also links to the user's profile and 
a log out button as well.

In the search result, regular users can see the Spotify picture of an artist, the total checks it has from all users, its
genre, the last time the artist was checked and its Spotify link to listen to their music. Hovering over and clicking on 
the artist's picture will allow the user to check the artist which will add the artist the the user's checked 
artists list that can be found on their profile, change the last checked time of the artist, and add 
to the artist's total checks. Unchecking an artist on the search page will remove this artist from the 
user's checked artists list and subtract one check from the artist's total checks.

###### User Profile Page

One the user profile, a user can change their username and password by clicking on the edit pencil button beside the "Profile" header. This will open up a form where the user can insert new login information they wish to change to. The users search history is accessible on the bottom left of the page. On the right side of the page, the user's checked artists along with their Spotify links can be accessed. Hovering over a checked artist's picture and clicking on the "x" will remove the artist from the user's checked artist list.

Above the checked artists list are genres of the artists that are in the user's checked artist list. The genres in
this list are in a decreasing order of how many artists have that share this genre in the user's checked 
artist list. That is, the genre that is most common amoung the checked artists will be first and so on. Clickling
on these genres apply a filter to the checked artists list and will show only the checked artists within that genre.

##### Admin

------

As an admin. To access the website, create an admin account by clicking on the "create 
an account" button on the login page. Please note that passwords must have a length of at least 4 and usernames
must be unique and only contain alphanumeric characters (the login page will notify you is these rules are violated).
To create an admin account, make the password 'team29'. 
After successfully logging in or creating an admin account, you will be directed to the homepage.

###### Admin Home Page

On the home page as an admin they can view featured artists and remove them by clicking on their picture. Admins
can also view the most checked artists as well on their home page. On the navagation bar at the top are links 
to the admin search page, the admin page and a log out button.

--------- Admin Search Page --------
On the admin search page an admin they can use the search bar to find artists by name. As this uses the Spotify API, 
inserting a correct artist name is required. There are also links to the admin page and 
a log out button as well.

In the search result, an admin can see the Spotify picture of an artist, the total checks it has from all users, its
genre, the last time the artist was checked and its Spotify link to listen to their music. Hovering over and clicking on 
the artist's picture will allow the admin to add the aritst to the featured artist list which is viewable 
to all users on the homepage. Unchecking an artist will remove the artist from the featured aritst list.

###### Admin Page

On the admin page, an admin can view all of the users, their user ids for the database, and their usernames.
Admins are able to change the username or password of a user, as well as remove a user on this page.
