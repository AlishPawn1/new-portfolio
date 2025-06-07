

// Theme Management
const themeToggle = document.getElementById("theme-toggle")
const body = document.body

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem("theme") || "light"
body.setAttribute("data-theme", currentTheme)

// Update theme toggle icon
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i")
    if (theme === "dark") {
        icon.className = "fas fa-sun"
    } else {
        icon.className = "fas fa-moon"
    }
}

// Initialize theme icon
updateThemeIcon(currentTheme)

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
    const currentTheme = body.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"

    body.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    updateThemeIcon(newTheme)
})

// Mobile Navigation Toggle
const hamburger = document.getElementById("hamburger")
const navMenu = document.getElementById("nav-menu")

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active")
    navMenu.classList.toggle("active")
})

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-link").forEach((n) =>
    n.addEventListener("click", () => {
        hamburger.classList.remove("active")
        navMenu.classList.toggle("active")
    }),
)

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start",
            })
        }
    })
})

// Navbar background change on scroll
window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar")
    if (window.scrollY > 100) {
        navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
        navbar.style.boxShadow = "none"
    }
})

// CV Download functionality - Updated to use actual PDF
const downloadButtons = document.querySelectorAll("#download-cv, #download-cv-main, #modal-download-cv")

downloadButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
        e.preventDefault()

        // Method 1: Direct PDF file download (recommended)
        downloadPDFFile()

        // Show success message
        showNotification("CV download started!", "success")
    })
})

// Method 1: Download actual PDF file
function downloadPDFFile() {
    const link = document.createElement("a")
    link.href = "./assets/Alish_Pawn_CV.pdf" // Path to your PDF file
    link.download = "Alish_Pawn_CV.pdf"
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

// Method 2: Alternative - Open PDF in new tab
function openPDFInNewTab() {
    window.open("./assets/Alish_Pawn_CV.pdf", "_blank")
}

// Method 3: Embed PDF in modal for preview
function showPDFPreview() {
    const modal = document.getElementById("cv-modal")
    const modalBody = modal.querySelector(".modal-body")

    // Clear existing content
    modalBody.innerHTML = `
      <div class="pdf-container">
        <embed src="./assets/Alish_Pawn_CV.pdf" type="application/pdf" width="100%" height="500px">
        <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">
          If the PDF doesn't display, <a href="./assets/Alish_Pawn_CV.pdf" target="_blank" style="color: var(--primary-color);">click here to open it in a new tab</a>.
        </p>
      </div>
    `

    modal.style.display = "block"
}

// Update the view CV button to show PDF preview
const viewCVButton = document.getElementById("view-cv")
viewCVButton.addEventListener("click", (e) => {
    e.preventDefault()
    showPDFPreview()
})

// CV Modal functionality
const cvModal = document.getElementById("cv-modal")
const closeModal = document.getElementById("close-modal")

closeModal.addEventListener("click", () => {
    cvModal.style.display = "none"
})

window.addEventListener("click", (e) => {
    if (e.target === cvModal) {
        cvModal.style.display = "none"
    }
})

// Notification system
function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 5px;
          color: white;
          font-weight: 500;
          z-index: 2000;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
      `

    if (type === "success") {
        notification.style.background = "#10b981"
    } else if (type === "error") {
        notification.style.background = "#ef4444"
    } else {
        notification.style.background = "#3b82f6"
    }

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
        notification.style.opacity = "1"
        notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = "0"
        notification.style.transform = "translateX(100%)"
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 300)
    }, 3000)
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1"
            entry.target.style.transform = "translateY(0)"
        }
    })
}, observerOptions)

// Observe all sections for animation
document.querySelectorAll("section").forEach((section) => {
    section.style.opacity = "0"
    section.style.transform = "translateY(30px)"
    section.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(section)
})

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0
    element.innerHTML = ""

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i)
            i++
            setTimeout(type, speed)
        }
    }

    type()
}

// Initialize typing animation when page loads
window.addEventListener("load", () => {
    const heroTitle = document.querySelector(".hero-title")
    if (heroTitle) {
        const originalText = heroTitle.textContent
        typeWriter(heroTitle, originalText, 50)
    }
})

// Add scroll-to-top functionality
const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    })
}

// Create scroll-to-top button
const createScrollToTopButton = () => {
    const button = document.createElement("button")
    button.innerHTML = '<i class="fas fa-arrow-up"></i>'
    button.className = "scroll-to-top"

    button.addEventListener("click", scrollToTop)
    document.body.appendChild(button)

    // Show/hide button based on scroll position
    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            button.style.opacity = "1"
            button.style.visibility = "visible"
        } else {
            button.style.opacity = "0"
            button.style.visibility = "hidden"
        }
    })
}

// Initialize scroll-to-top button
createScrollToTopButton()

// Add counter animation for stats
const animateCounters = () => {
    const counters = document.querySelectorAll(".stat-item h3")

    counters.forEach((counter) => {
        const target = Number.parseInt(counter.textContent)
        const increment = target / 100
        let current = 0

        const updateCounter = () => {
            if (current < target) {
                current += increment
                counter.textContent = Math.ceil(current) + "+"
                setTimeout(updateCounter, 20)
            } else {
                counter.textContent = target + "+"
            }
        }

        // Start animation when element is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    updateCounter()
                    observer.unobserve(entry.target)
                }
            })
        })

        observer.observe(counter)
    })
}

// Initialize counter animation
animateCounters()

// Add loading animation
window.addEventListener("load", () => {
    document.body.style.opacity = "0"
    document.body.style.transition = "opacity 0.5s ease"

    setTimeout(() => {
        document.body.style.opacity = "1"
    }, 100)
})

const projectFilter = document.querySelectorAll('.project-filter .filter-btn');
const projectCards = document.querySelectorAll('.project-card');

projectFilter.forEach(button => {
    button.addEventListener('click', function () {
        // Remove active class from all buttons
        projectFilter.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        // Show/hide project cards based on filter
        projectCards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Console message for developers
console.log(`
  🚀 Welcome to Alish Pawn's Portfolio!
  📧 Contact: alishpawn00@gmail.com
  🌐 GitHub: https://github.com/AlishPawn1
  💼 LinkedIn: https://www.linkedin.com/in/alish-pawn-06a10a346/
  
  Thanks for checking out the code! 😊
  `)

// Keyboard navigation for accessibility
document.addEventListener("keydown", (e) => {
    // Close modal with Escape key
    if (e.key === "Escape" && cvModal.style.display === "block") {
        cvModal.style.display = "none"
    }

    // Toggle theme with Ctrl+Shift+T
    if (e.ctrlKey && e.shiftKey && e.key === "T") {
        themeToggle.click()
    }
})

// Add focus management for modal
cvModal.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        const focusableElements = cvModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus()
                e.preventDefault()
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus()
                e.preventDefault()
            }
        }
    }
})

    // Preload theme preference
    ; (() => {
        const savedTheme = localStorage.getItem("theme")
        if (savedTheme) {
            document.body.setAttribute("data-theme", savedTheme)
        }
    })()

// Add smooth transitions for theme switching
document.documentElement.style.setProperty("--transition-duration", "0.3s")

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Debounced scroll handler
const debouncedScrollHandler = debounce(() => {
    const navbar = document.querySelector(".navbar")
    const scrollToTopBtn = document.querySelector(".scroll-to-top")

    if (window.scrollY > 100) {
        navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)"
    } else {
        navbar.style.boxShadow = "none"
    }

    if (window.scrollY > 300) {
        scrollToTopBtn.style.opacity = "1"
        scrollToTopBtn.style.visibility = "visible"
    } else {
        scrollToTopBtn.style.opacity = "0"
        scrollToTopBtn.style.visibility = "hidden"
    }
}, 10)

window.addEventListener("scroll", debouncedScrollHandler)



// Splide initialization helper
function initializeSplide(selector, options, extensions) {
    const splideInstances = [];

    document.querySelectorAll(selector).forEach(element => {
        if (element.querySelector('.splide__track') && element.querySelector('.splide__list')) {
            const splide = new Splide(element, options).mount(extensions);
            splideInstances.push(splide);
        } else {
            console.error(`Splide initialization failed: Missing required elements in ${selector}`);
        }
    });

    return splideInstances;
}

// Initialize Splide sliders
if (document.querySelector('.education-slider')) {
    initializeSplide('.education-slider', {
        type: 'loop',
        perPage: 1,
        arrows: false,
        pagination: true,
        // autoplay: true,
        interval: 2000,
        gap: 30,
        autoScroll: {
            speed: 0.5,
        },
    });
}
