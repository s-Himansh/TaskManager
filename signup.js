
// Function to handle user registration and store data in local storage
function registerUser() {
    // Get user input
    const fullName = document.getElementById('fullname').value;
    const email = document.getElementById('mail').value;
    const password = document.getElementById('pass').value;

    // Retrieve existing user data from local storage (if any)
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // Create a new user object
    const newUser = {
        fullName: fullName,
        email: email,
        password: password,
        tasks: [],
    };

    // Add the new user to the array
    users.push(newUser);

    // Save the updated user data back to local storage
    localStorage.setItem('users', JSON.stringify(users));

    // Optionally, you can clear the input fields or perform any other actions
    document.getElementById('fullname').value = '';
    document.getElementById('mail').value = '';
    document.getElementById('pass').value = '';
    document.getElementById('retype').value = '';

    // Provide feedback to the user (e.g., registration success message)
    window.alert('Registration successful!');
}

// Example: Call the registerUser() function when the "Sign Up" button is clicked
document.querySelector('.signup').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission (since it's a single-page example)
    registerUser(); // Call the registration function
});
