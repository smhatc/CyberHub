/* ================================================================================================ */
// DEFINING VARIABLES
/* ================================================================================================ */

// General elements
const body = document.body;
const header = document.querySelector(".page-header");

// Page scrollbar width, calculated dynamically later each time the relevant function is executed
let scrollbarWidth;

// Sign in / sign up forms
const signInForm = document.querySelector(".sign-in-form");
const signUpForm = document.querySelector(".sign-up-form");

// Navigation button and list from the header
const navMenuBtn = document.querySelector(".page-header-controls-navmenubtn");
const navigation = document.querySelector(".page-header-navigation");

// Input fields, not extracting the values yet
const signInEmailAddressInput = document.querySelector("#sign-in-form-emailaddress");
const signInPasswordInput = document.querySelector("#sign-in-form-password");
const signUpEmailAddressInput = document.querySelector("#sign-up-form-emailaddress");
const signUpPasswordInput = document.querySelector("#sign-up-form-password");

// Error message containers
const signInEmailAddressGuideline = document.querySelector(".sign-in-form-emailaddressguideline");
const signInPasswordGuideline = document.querySelector(".sign-in-form-passwordguideline");
const signUpEmailAddressGuideline = document.querySelector(".sign-up-form-emailaddressguideline");
const signUpPasswordGuideline = document.querySelector(".sign-up-form-passwordguideline");

// Tracking the first error to receive focus by the displayErrors() function to prevent later errors from receiving focus instead, defined outside the function to prevent redefinition each time
let firstErrorFocused = false;

// Input check patterns
const passwordRegex = /^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]{8,}$/; // Validates a password, ensuring it has at least 8 characters, with at least one digit and one uppercase letter
const emailAddressRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Validates an email address, ensuring it has a standard format with a local part, "@" symbol, domain, and top-level domain of at least 2 characters

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

function displaySignUpFormErrors(guideline, checkCondition, formInputField) {
        // Reset the error messages and box-shadow error effects before each check in case of solved errors
        guideline.style.display = "none";
        formInputField.classList.remove("sign-up-form-inputerror");

        if (checkCondition) {
                // Displays the invisible HTML error message if the provided condition returns true using display = block
                guideline.style.display = "block";

                // Adds a pre-defined CSS class to the specified input if the provided condition returns true, adding a red hover and focus box-shadow effect
                formInputField.classList.add("sign-up-form-inputerror");

                // Gives the first detected error focus
                if (!firstErrorFocused) {
                        formInputField.focus(); // Focus the first invalid input
                        firstErrorFocused = true; // Prevent later invalid inputs from receiving focus
                }
        }
}

function validateSignUpForm(event) {
        // To prevent the form from executing its default submission behavior
        event.preventDefault();

        // Setting and updating the container variables for the input fields' values each time the function is executed
        // .trim(): remove heading and trailing whitespace from the input values
        const signUpEmailAddress = signUpEmailAddressInput.value.trim();
        const signUpPassword = signUpPasswordInput.value.trim();

        // Resetting the status of an invalid input having been focused before checking for errors again, allowing for a different input to receive focus
        // Done here instead of in the displayErrors() function so that the value is not reset each time a new input is checked
        firstErrorFocused = false;

        // Check specific errors using an external displayErrors() function for code maintainability
        displaySignUpFormErrors(signUpEmailAddressGuideline, !emailAddressRegex.test(signUpEmailAddress), signUpEmailAddressInput);
        displaySignUpFormErrors(signUpPasswordGuideline, !passwordRegex.test(signUpPassword), signUpPasswordInput);
}

function displaySignInFormErrors(guideline, checkCondition, formInputField) {
        // Reset the error messages and box-shadow error effects before each check in case of solved errors
        guideline.style.display = "none";
        formInputField.classList.remove("sign-in-form-inputerror");

        if (checkCondition) {
                // Displays the invisible HTML error message if the provided condition returns true using display = block
                guideline.style.display = "block";

                // Adds a pre-defined CSS class to the specified input if the provided condition returns true, adding a red hover and focus box-shadow effect
                formInputField.classList.add("sign-in-form-inputerror");

                // Gives the first detected error focus
                if (!firstErrorFocused) {
                        formInputField.focus(); // Focus the first invalid input
                        firstErrorFocused = true; // Prevent later invalid inputs from receiving focus
                }
        }
}

function validateSignInForm(event) {
        // To prevent the form from executing its default submission behavior
        event.preventDefault();

        // Setting and updating the container variables for the input fields' values each time the function is executed
        // .trim(): remove heading and trailing whitespace from the input values
        const signInEmailAddress = signInEmailAddressInput.value.trim();
        const signInPassword = signInPasswordInput.value.trim();

        // Resetting the status of an invalid input having been focused before checking for errors again, allowing for a different input to receive focus
        // Done here instead of in the displayErrors() function so that the value is not reset each time a new input is checked
        firstErrorFocused = false;

        // Check specific errors using an external displayErrors() function for code maintainability
        // displaySignInFormErrors(signInEmailAddressGuideline, !emailAddressRegex.test(signInEmailAddress), signInEmailAddressInput);
        // displaySignInFormErrors(signInPasswordGuideline, !passwordRegex.test(signInPassword), signInPasswordInput);
}

/* ================================================================================================ */
// MAIN SCRIPT AND EVENT LISTENERS
/* ================================================================================================ */

// Listens for clicks on the navigation menu button to execute a function which displays/hides the list
navMenuBtn.addEventListener("click", displayNavigationMenu);

// Listens for user scrolling the page to execute a function which makes the sticky header slightly transparent
window.addEventListener("scroll", lowerHeaderOpacity);

// Check for the existence of the sign up/in forms first before adding the event listeners to prevent errors
if (signUpForm) {
        // Listens for form submission to execute a function which validates the input values provided by the user
        signUpForm.addEventListener("submit", validateSignUpForm);
}

if (signInForm) {
        signInForm.addEventListener("submit", validateSignInForm);
}