'use strict';

/**
 * Add event listener to multiple elements
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
}

/**
 * Preloader
 */
const preloader = document.querySelector("[data-preloader]");
const heroBanner = document.querySelector("[data-hero-banner]"); // Get the hero banner
const heroText = document.querySelector(".hero-text"); // Get the hero text element
let originalHeroTextContent = ''; // Declare here to be accessible

// Canvas for particle animation
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');
let particlesArray;

// Particle object
class Particle {
  constructor(x, y, directionX, directionY, size, color) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  // Draw individual particle
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  // Update particle position and size
  update() {
    // Reverse direction if particle hits canvas edge
    if (this.x + this.size > canvas.width || this.x - this.size < 0) {
      this.directionX = -this.directionX;
    }
    if (this.y + this.size > canvas.height || this.y - this.size < 0) {
      this.directionY = -this.directionY;
    }

    this.x += this.directionX;
    this.y += this.directionY;

    this.draw();
  }
}

// Initialize particles
function initParticles() {
  particlesArray = [];
  let numberOfParticles = (canvas.width * canvas.height) / 9000; // Adjust density
  if (window.innerWidth < 768) { // Reduce particles on smaller screens
    numberOfParticles /= 2;
  }
  
  for (let i = 0; i < numberOfParticles; i++) {
    const size = (Math.random() * 2) + 0.5; // Particle size between 0.5 and 2.5
    const x = Math.random() * (canvas.width - size * 2) + size; // Ensure particles are within bounds
    const y = Math.random() * (canvas.height - size * 2) + size; // Ensure particles are within bounds
    const directionX = (Math.random() * 0.5) - 0.25; // Slower movement
    const directionY = (Math.random() * 0.5) - 0.25; // Slower movement
    const color = 'rgba(255, 255, 255, ' + (Math.random() * 0.4 + 0.1) + ')'; // Varying transparency

    particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
  }
}

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// Animation loop
function animateParticles() {
  requestAnimationFrame(animateParticles);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear entire canvas

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
  }
}


window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded"); // Allow scrolling after preloader fades

  // Ensure canvas is correctly sized and particles initialized after all content is loaded
  resizeCanvas();
  initParticles();
  animateParticles(); // Start the particle animation loop

  // Store original text content AFTER the DOM is fully loaded and text is available
  originalHeroTextContent = heroText.textContent;

  // Clear hero text initially for typing effect
  heroText.textContent = '';

  // Animate hero banner after preloader fades
  setTimeout(() => {
    heroBanner.classList.add("show"); // Assuming "show" class applies initial styles/animation
    // Animate hero text character by character after hero banner appears
    setTimeout(() => {
      typeWriter(heroText, originalHeroTextContent, 0);
    }, 500); // Small delay after banner animation completes
  }, 600); // Matches preloader transition duration
});


/**
 * Typing effect function for hero text
 */
function typeWriter(element, text, i) {
  if (i < text.length) {
    element.textContent += text.charAt(i);
    setTimeout(() => typeWriter(element, text, i + 1), 50); // Adjust typing speed here (ms per character)
  }
}


/**
 * Side Navbar toggle (triggered by 'More' button on bottom nav)
 */
const navbar = document.querySelector("[data-navbar]"); // This is the side menu that slides in
// Selecting any element with data-nav-toggler, which is currently the 'More' button and the overlay
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector(".overlay"); // Target specifically the overlay element

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active"); // Toggle overlay class
  document.body.classList.toggle("nav-active"); // Prevents scrolling when side nav is open
}

addEventOnElements(navTogglers, "click", toggleNavbar);


/**
 * Back to top button visibility on scroll
 * The main header's active state logic is removed as the header is now hidden globally.
 */
const backToTopBtn = document.querySelector("[data-back-to-top]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) { // Check scroll position for back-to-top button visibility
    backToTopBtn.classList.add("active");
  } else {
    backToTopBtn.classList.remove("active");
  }
});


/**
 * Smooth scroll for navigation links and back-to-top button
 */
document.querySelectorAll('.navbar-link, .bottom-navbar-item, .back-to-top').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    // If the clicked item is the 'More' button (data-nav-toggler on bottom-navbar-item),
    // it should only toggle the side menu, not scroll.
    if (this.classList.contains('bottom-navbar-item') && this.dataset.navToggler !== undefined) {
        toggleNavbar(); // Toggle the side menu
        return; // Exit to prevent default scroll behavior for this specific button
    }

    // For all other links, prevent default behavior and scroll smoothly
    e.preventDefault();

    const targetId = this.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop, // No fixed top header, so no offset to subtract
        behavior: 'smooth'
      });

      // Close mobile side navbar if open after clicking a link (unless it's the 'More' button)
      if (navbar.classList.contains('active')) {
        toggleNavbar(); // This will close the side nav and hide the overlay
      }

      // Update active class for all navigation links (both side menu and bottom bar)
      document.querySelectorAll('.navbar-link, .bottom-navbar-item').forEach(link => {
        link.classList.remove('active');
      });
      // Add active class to the clicked link (and its counterpart if it exists, e.g., in side menu)
      document.querySelectorAll(`[href="#${targetId}"]`).forEach(link => {
        link.classList.add('active');
      });
    }
  });
});

/**
 * Handle active class for navigation bars on scroll
 */
const sections = document.querySelectorAll("section[id]");
// Selects all links that belong to either the side navbar or the bottom navbar
const allNavLinks = document.querySelectorAll(".navbar-list .navbar-link, .bottom-navbar-item");

const scrollSpy = function () {
  sections.forEach(section => {
    // Determine scroll position relative to the section start
    // A small buffer (e.g., 50px) can make the active state switch a bit before the section fully enters the viewport,
    // which can feel more responsive. Adjust as needed.
    const scrollBuffer = 50;
    const sectionTop = section.offsetTop - scrollBuffer;
    const sectionBottom = sectionTop + section.offsetHeight;

    if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
      allNavLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") && link.getAttribute("href").includes(section.id)) {
          link.classList.add("active");
        }
      });
    }
  });
}

// Attach scroll spy to window scroll and load events
window.addEventListener("scroll", scrollSpy);
window.addEventListener("load", scrollSpy); // Also run on load to set the initial active section

// Event listeners for resizing and re-initialization of particles
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles(); // Re-initialize particles to fill new canvas size
});
