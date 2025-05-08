/* ================================================================================================ */
// DEFINING VARIABLES
/* ================================================================================================ */

// General elements
const body = document.body;
const header = document.querySelector(".page-header");

// Page scrollbar width, calculated dynamically later each time the relevant function is executed
let scrollbarWidth;

// Navigation button and list from the header
const navMenuBtn = document.querySelector(".page-header-controls-navmenubtn");
const navigation = document.querySelector(".page-header-navigation");

/* ================================================================================================ */
// DEFINING FUNCTIONS
/* ================================================================================================ */

function displayNavigationMenu() {
        // Calculates the scrollbar width each time the function is executed in case it has changed
        scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // Adds/removes pre-defined class in the CSS file to style the navigation list
        navigation.classList.toggle("page-header-navigation-menuactive");

        // Check for removing/returning the page scrollbar using a pre-defined class in the CSS file
        // The conditions also change the button icon from a hamburger menu to a X icon when the menu is open
        if (navigation.classList.contains("page-header-navigation-menuactive")) {
                body.classList.add("page-header-navigation-bodyactive"); // Removes scrollbar
                body.style.paddingRight = `${scrollbarWidth}px`; // Fixes layout shift
                navMenuBtn.innerHTML = "&#10005;"; // Changes button icon
        } else {
                body.classList.remove("page-header-navigation-bodyactive"); // Returns scrollbar
                body.style.paddingRight = "0"; // Fixes layout shift
                navMenuBtn.innerHTML = "&#9776;"; // Changes button icon
        }
}

function lowerHeaderOpacity() {
        // Checks if the user has scrolled the page and adds/removes a pre-defined opacity adjustment CSS class to/from the header
        if (window.scrollY > 0) {
                header.classList.add("page-header-sticky");
        } else {
                header.classList.remove("page-header-sticky");
        }
}

/* ================================================================================================ */
// MAIN SCRIPT AND EVENT LISTENERS
/* ================================================================================================ */

// Listens for clicks on the navigation menu button to execute a function which displays/hides the list
navMenuBtn.addEventListener("click", displayNavigationMenu);

// Listens for user scrolling the page to execute a function which makes the sticky header slightly transparent
window.addEventListener("scroll", lowerHeaderOpacity);

/* ================================================================================================ */
// SIGN IN & SIGN UP MAIN SCRIPT
/* ================================================================================================ */

// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Get form elements
    const signUpForm = document.querySelector('.sign-up-form');
    const signInForm = document.querySelector('.sign-in-form');
    
    // Add event listeners to forms
    if (signUpForm) {
        console.log('Sign up form found');
        signUpForm.addEventListener('submit', handleSignUp);
    }
    
    if (signInForm) {
        console.log('Sign in form found');
        signInForm.addEventListener('submit', handleSignIn);
    }
    
    // Check if user is logged in
    checkAuthStatus();
});

// Handle sign up form submission
async function handleSignUp(event) {
    event.preventDefault();
    console.log('Sign up form submitted');
    
    // Get form inputs
    const emailInput = document.getElementById('sign-up-form-emailaddress');
    const passwordInput = document.getElementById('sign-up-form-password');
    const emailGuideline = document.querySelector('.sign-up-form-emailaddressguideline');
    const passwordGuideline = document.querySelector('.sign-up-form-passwordguideline');
    
    // Reset error messages
    emailGuideline.style.display = 'none';
    passwordGuideline.style.display = 'none';
    emailInput.classList.remove('sign-up-form-inputerror');
    passwordInput.classList.remove('sign-up-form-inputerror');
    
    // Get values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Track errors and first error field for focus
    let hasErrors = false;
    let firstErrorField = null;
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        // Use the original error message in the HTML
        emailGuideline.innerHTML = '<span class="sign-up-form-guideline-icon">!</span> You need to provide a valid (youremail@example.com) email address.';
        emailGuideline.style.display = 'block';
        emailInput.classList.add('sign-up-form-inputerror');
        hasErrors = true;
        firstErrorField = firstErrorField || emailInput;
    } else {
        // Email format is valid, check if it already exists
        try {
            const checkResponse = await fetch('/api/check-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const checkData = await checkResponse.json();
            
            if (checkData.exists) {
                emailGuideline.innerHTML = '<span class="sign-up-form-guideline-icon">!</span> The email address you entered is already registered, please sign in instead.';
                emailGuideline.style.display = 'block';
                emailInput.classList.add('sign-up-form-inputerror');
                hasErrors = true;
                firstErrorField = firstErrorField || emailInput;
            }
        } catch (error) {
            console.error('Email check error:', error);
        }
    }
    
    // Validate password
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        // Use the original error message in the HTML
        passwordGuideline.innerHTML = '<span class="sign-up-form-guideline-icon">!</span> The password you entered does not meet the minimum complexity requirements (min. 8 characters, min. 1 digit, min. 1 uppercase letter), please create another one.';
        passwordGuideline.style.display = 'block';
        passwordInput.classList.add('sign-up-form-inputerror');
        hasErrors = true;
        firstErrorField = firstErrorField || passwordInput;
    }
    
    // If there are validation errors, focus on the first error field and stop
    if (hasErrors) {
        if (firstErrorField) firstErrorField.focus();
        return;
    }
    
    // Continue with server validation if client-side validation passes
    try {
        // Send registration request
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Registration response:', data);
        
        if (!data.success) {
            // Handle server-side errors
            if (data.errors) {
                if (data.errors.email) {
                    emailGuideline.innerHTML = `<span class="sign-up-form-guideline-icon">!</span> ${data.errors.email}`;
                    emailGuideline.style.display = 'block';
                    emailInput.classList.add('sign-up-form-inputerror');
                    firstErrorField = firstErrorField || emailInput;
                }
                
                if (data.errors.password) {
                    passwordGuideline.innerHTML = `<span class="sign-up-form-guideline-icon">!</span> ${data.errors.password}`;
                    passwordGuideline.style.display = 'block';
                    passwordInput.classList.add('sign-up-form-inputerror');
                    firstErrorField = firstErrorField || passwordInput;
                }
                
                if (firstErrorField) firstErrorField.focus();
            } else {
                // Fallback for general error
                emailGuideline.innerHTML = '<span class="sign-up-form-guideline-icon">!</span> The email address you entered is already registered, please sign in instead.';
                emailGuideline.style.display = 'block';
                emailInput.classList.add('sign-up-form-inputerror');
                emailInput.focus();
            }
            return;
        }
        
        // Registration successful, redirect to home page
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

// Handle sign in form submission
async function handleSignIn(event) {
    event.preventDefault();
    console.log('Sign in form submitted');
    
    // Get form inputs
    const emailInput = document.getElementById('sign-in-form-emailaddress');
    const passwordInput = document.getElementById('sign-in-form-password');
    const emailGuideline = document.querySelector('.sign-in-form-emailaddressguideline');
    const passwordGuideline = document.querySelector('.sign-in-form-passwordguideline');
    
    // Reset error messages
    emailGuideline.style.display = 'none';
    passwordGuideline.style.display = 'none';
    emailInput.classList.remove('sign-in-form-inputerror');
    passwordInput.classList.remove('sign-in-form-inputerror');
    
    // Get values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Track errors and first error field for focus
    let hasErrors = false;
    let firstErrorField = null;
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        emailGuideline.innerHTML = '<span class="sign-in-form-guideline-icon">!</span> The email address you entered is not associated with an account, please sign up first.';
        emailGuideline.style.display = 'block';
        emailInput.classList.add('sign-in-form-inputerror');
        hasErrors = true;
        firstErrorField = firstErrorField || emailInput;
    }
    
    // Validate password (check for complexity requirements)
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
        passwordGuideline.innerHTML = '<span class="sign-in-form-guideline-icon">!</span> The password you entered is incorrect, please try again.';
        passwordGuideline.style.display = 'block';
        passwordInput.classList.add('sign-in-form-inputerror');
        hasErrors = true;
        firstErrorField = firstErrorField || passwordInput;
    }
    
    // If there are validation errors, focus on the first error field and stop
    if (hasErrors) {
        if (firstErrorField) firstErrorField.focus();
        return;
    }
    
    // Continue with server validation if client-side validation passes
    try {
        // Send login request
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (!data.success) {
            // Show appropriate error messages based on error types
            if (data.errors) {
                // Handle multiple errors from server
                if (data.errors.email) {
                    emailGuideline.innerHTML = `<span class="sign-in-form-guideline-icon">!</span> ${data.errors.email}`;
                    emailGuideline.style.display = 'block';
                    emailInput.classList.add('sign-in-form-inputerror');
                    firstErrorField = firstErrorField || emailInput;
                }
                
                if (data.errors.password) {
                    passwordGuideline.innerHTML = `<span class="sign-in-form-guideline-icon">!</span> ${data.errors.password}`;
                    passwordGuideline.style.display = 'block';
                    passwordInput.classList.add('sign-in-form-inputerror');
                    firstErrorField = firstErrorField || passwordInput;
                }
                
                if (firstErrorField) firstErrorField.focus();
            } else if (data.errorType === 'email') {
                emailGuideline.innerHTML = '<span class="sign-in-form-guideline-icon">!</span> The email address you entered is not associated with an account, please sign up first.';
                emailGuideline.style.display = 'block';
                emailInput.classList.add('sign-in-form-inputerror');
                emailInput.focus();
            } else if (data.errorType === 'password') {
                passwordGuideline.innerHTML = '<span class="sign-in-form-guideline-icon">!</span> The password you entered is incorrect, please try again.';
                passwordGuideline.style.display = 'block';
                passwordInput.classList.add('sign-in-form-inputerror');
                passwordInput.focus();
            } else {
                alert(data.message || 'Login failed');
            }
            return;
        }
        
        // Login successful, redirect to home page
        window.location.href = '/index.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
}

// Check if user is logged in
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();
        
        if (data.success) {
            // User is logged in
            updateUI(data.user);
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
}

// Update UI based on authentication status
function updateUI(user) {
    if (!user) return;
    
    console.log('Updating UI for user:', user);
    
    // Get the sign-in links with their specific classes
    const signInInsideContainer = document.querySelector('.sign-in-inside');
    const signInOutsideContainer = document.querySelector('.sign-in-outside');
    
    // Handle the inside link (for navigation menu)
    if (signInInsideContainer) {
        const insideLink = signInInsideContainer.querySelector('.sign-in-link');
        if (insideLink) {
            // Create profile container
            const profileContainer = document.createElement('div');
            profileContainer.className = 'profile-container';
            
            // Create profile picture
            const profilePic = document.createElement('div');
            profilePic.className = 'profile-picture';
            profilePic.textContent = user.email.charAt(0).toUpperCase();
            profilePic.addEventListener('click', toggleDropdown);
            
            // Add profile picture to container
            profileContainer.appendChild(profilePic);
            
            // Replace only the link while preserving the parent li element and its classes
            signInInsideContainer.innerHTML = '';
            signInInsideContainer.appendChild(profileContainer);
            
            // Make sure the parent li still has the sign-in-inside class for CSS media queries
            if (!signInInsideContainer.classList.contains('sign-in-inside')) {
                signInInsideContainer.classList.add('sign-in-inside');
            }
        }
    }
    
    // Handle the outside link (for header controls)
    if (signInOutsideContainer) {
        // Create profile container
        const profileContainer = document.createElement('div');
        profileContainer.className = 'profile-container sign-in-outside'; // Keep the sign-in-outside class
        
        // Create profile picture
        const profilePic = document.createElement('div');
        profilePic.className = 'profile-picture';
        profilePic.textContent = user.email.charAt(0).toUpperCase();
        profilePic.addEventListener('click', toggleDropdown);
        
        // Add profile picture to container
        profileContainer.appendChild(profilePic);
        
        // Replace sign in link with profile container
        const parent = signInOutsideContainer.parentNode;
        parent.replaceChild(profileContainer, signInOutsideContainer);
    }
    
    // Add click event to document to close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.profile-dropdown');
        const profilePic = document.querySelector('.profile-picture');
        
        if (dropdown && profilePic && !profilePic.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.remove();
        }
    });
}

// Toggle dropdown menu
function toggleDropdown(event) {
    console.log('Toggle dropdown');
    
    // Check if dropdown already exists
    let dropdown = document.querySelector('.profile-dropdown');
    
    if (dropdown) {
        // Remove dropdown if it exists
        dropdown.remove();
        return;
    }
    
    // Create dropdown
    dropdown = document.createElement('div');
    dropdown.className = 'profile-dropdown';
    
    // Get user email
    fetch('/api/user')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const user = data.user;
                const emailParts = user.email.split('@');
                const emailUsername = emailParts[0];
                
                // Add email and logout button to dropdown
                dropdown.innerHTML = `
                    <div class="profile-email">${emailUsername}</div>
                    <button class="logout-button">Log Out</button>
                `;
                
                // Add logout event listener
                dropdown.querySelector('.logout-button').addEventListener('click', handleLogout);
                
                // Add dropdown to profile container
                event.target.parentNode.appendChild(dropdown);
            }
        })
        .catch(error => {
            console.error('Error fetching user:', error);
        });
}

// Handle logout
async function handleLogout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        });
        
        const data = await response.json();
        console.log('Logout response:', data);
        
        if (data.success) {
            // Reload page
            window.location.reload();
        } else {
            alert(data.message || 'Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout. Please try again.');
    }
}