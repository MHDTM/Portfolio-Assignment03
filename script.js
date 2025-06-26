// Dark mode toggle (optional)
let darkMode = false;

function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? "#121212" : "#ffffff";
  document.body.style.color = darkMode ? "#f5f5f5" : "#222222"; 
  document.body.classList.toggle("dark-mode");
}

// Show/hide the button on scroll
window.onscroll = function () {
  let btn = document.getElementById("backToTopBtn");
  if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
    btn.style.display = "block";
  } else {
    btn.style.display = "none";
  }
};

// Scroll to top on click
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

