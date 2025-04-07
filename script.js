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