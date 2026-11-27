// ===== Hamburger menu for small screens =====
const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

// Only run if both elements exist on the page
if (menuToggle && mainNav) {
  // Each click adds or removes the class "open", which shows or hides the menu
  menuToggle.addEventListener("click", function () {
    mainNav.classList.toggle("open");
  });
}