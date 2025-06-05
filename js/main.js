// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize variables
  const header = document.getElementById('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelectorAll('.nav-links a');
  const themeToggle = document.getElementById('theme-toggle');
  const backToTop = document.getElementById('back-to-top');
  const skillsFilter = document.querySelectorAll('.skills-filter .filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');
  const projectFilter = document.querySelectorAll('.project-filter .filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  let isMenuOpen = false;

  // Check for saved theme
  if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.body.classList.add('dark-mode');
  }

  // Header scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
      if (window.scrollY > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    } else {
      header.classList.remove('scrolled');
      backToTop.classList.remove('visible');
    }
  });

  // Mobile menu toggle
  menuToggle.addEventListener('click', function() {
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
      // Create mobile menu if it doesn't exist
      if (!document.querySelector('.mobile-menu')) {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        
        // Clone nav links
        const navLinksList = document.querySelector('.nav-links').cloneNode(true);
        mobileMenu.appendChild(navLinksList);
        
        document.body.appendChild(mobileMenu);
        
        // Add event listeners to new links
        mobileMenu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', closeMobileMenu);
        });
      }
      
      document.querySelector('.mobile-menu').classList.add('active');
      document.body.classList.add('menu-open');
      
      // Transform hamburger to X
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      
    } else {
      closeMobileMenu();
    }
  });

  // Close mobile menu function
  function closeMobileMenu() {
    isMenuOpen = false;
    document.querySelector('.mobile-menu').classList.remove('active');
    document.body.classList.remove('menu-open');
    
    // Revert X back to hamburger
    const spans = menuToggle.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }

  // Theme toggle
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    // Save preference to localStorage
    if (document.body.classList.contains('dark-mode')) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerHeight = header.offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // If mobile menu is open, close it
        if (isMenuOpen) {
          closeMobileMenu();
        }
        
        // Update active nav link
        navLinks.forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });

  // Update active nav link on scroll
  window.addEventListener('scroll', function() {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - header.offsetHeight - 100;
      const sectionHeight = section.offsetHeight;
      
      if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // Skills filter
  skillsFilter.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      skillsFilter.forEach(btn => btn.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      const filter = this.getAttribute('data-filter');
      
      // Show/hide skill cards based on filter
      skillCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Projects filter
  projectFilter.forEach(button => {
    button.addEventListener('click', function() {
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

  // Animation on scroll
  function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        } else {
          entry.target.classList.remove('aos-animate');
        }
      });
    }, {
      threshold: 0.1
    });
    
    elements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // Initialize AOS
  initAOS();

  // Initialize skill progress bars animation
  function animateSkillBars() {
    const skillElements = document.querySelectorAll('.skill-card');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target.querySelector('.progress');
          const percentage = entry.target.querySelector('.skill-level').textContent;
          progressBar.style.width = percentage;
        }
      });
    }, {
      threshold: 0.1
    });
    
    skillElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  // Initialize skill bars animation
  animateSkillBars();
});