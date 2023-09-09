function loginUser() {
    // Get user input
    const email = document.getElementById('mail1').value;
    const password = document.getElementById('pass1').value;

    // Retrieve the array of users from local storage
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if there's a user with the provided email and password
    const user = users.find(u => u.email == email && u.password == password);

    if (user) {
        // Successful login: Redirect or perform other actions
        // history.pushState(null, '', 'trashUse.html');
        // location.reload();
        localStorage.setItem('loggedInUserEmail', user.email);
        history.pushState(null, '', 'trashUse.html');
        location.reload();
        // You can redirect to another page or update the UI here
    } else {
        // Failed login: Show an error message
        window.alert('Invalid email or password. Please try again.');
    }
}

// Example: Call the loginUser() function when the "Login" button is clicked
document.querySelector('.logins').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission (since it's a single-page example)
    loginUser(); // Call the login function
});