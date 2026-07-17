/**
 * Dynamic Content Loader
 * Loads content from content.json and populates the HTML
 * Edit content.json to update your portfolio - no need to touch HTML!
 */

let portfolioContent = null;

// Load content from JSON file
async function loadContent() {
    try {
        const response = await fetch('content.json');
        portfolioContent = await response.json();
        populateContent();
    } catch (error) {
        console.error('Error loading content:', error);
        // Fallback: page will show static HTML content
    }
}

// Populate all dynamic content
function populateContent() {
    if (!portfolioContent) return;
    
    populateSEO();
    populateNavigation();
    populateHero();
    populateAbout();
    populateEducation();
    populateSkills();
    populateProjects();
    populateContact();
    populateFooter();
    populateSocialLinks();
}

// SEO Meta Tags
function populateSEO() {
    const { seo } = portfolioContent;
    document.title = seo.siteTitle;
    document.querySelector('meta[name="title"]').content = seo.siteTitle;
    document.querySelector('meta[name="description"]').content = seo.siteDescription;
    document.querySelector('link[rel="canonical"]').href = seo.canonicalUrl;
}

// Navigation Menu
function populateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    
    const navLinks = portfolioContent.navigation.map(item => 
        `<a href="${item.href}" class="nav-link">${item.label}</a>`
    ).join('');
    
    navMenu.innerHTML = navLinks;
}

// Hero Section
function populateHero() {
    const { personalInfo } = portfolioContent;
    
    // Update name
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.innerHTML = `Hi, I'm <span class="highlight">${personalInfo.name}</span>`;
    }
    
    // Update title/role
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) heroSubtitle.textContent = personalInfo.title;
    
    // Update description
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) heroDescription.textContent = personalInfo.heroDescription;
    
    // Update profile image
    const profileImg = document.querySelector('.profile-img img');
    if (profileImg) {
        profileImg.src = personalInfo.profileImage;
        profileImg.alt = personalInfo.name;
    }
    
    // Update logo
    const navLogo = document.querySelector('.nav-logo a');
    if (navLogo) navLogo.textContent = personalInfo.name;
}

// About Section
function populateAbout() {
    const { about, personalInfo } = portfolioContent;
    
    // Update about text
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        const paragraphs = about.paragraphs.map(p => `<p>${p}</p>`).join('');
        const personalInfo_html = `
            <div class="personal-info">
                <div class="info-item">
                    <i class="fas fa-birthday-cake"></i>
                    <span>${personalInfo.birthday}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <a href="${personalInfo.locationLink}" target="_blank" rel="noopener noreferrer">${personalInfo.location}</a>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <a href="tel:${personalInfo.phone}">${personalInfo.phone}</a>
                </div>
                <div class="info-item">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${personalInfo.email}">${personalInfo.email}</a>
                </div>
            </div>
        `;
        aboutText.innerHTML = paragraphs + personalInfo_html;
    }
    
    // Update stats
    const aboutStats = document.querySelector('.about-stats');
    if (aboutStats) {
        aboutStats.innerHTML = about.stats.map(stat => `
            <div class="stat-item">
                <h3>${stat.number}</h3>
                <p>${stat.label}</p>
            </div>
        `).join('');
    }
}

// Education Section
function populateEducation() {
    const educationList = document.querySelector('.splide__list');
    if (!educationList) return;
    
    educationList.innerHTML = portfolioContent.education.map(edu => `
        <li class="splide__slide">
            <div class="education-item">
                <div class="education-icon">
                    <i class="${edu.icon}"></i>
                </div>
                <div class="education-details">
                    <h3>${edu.degree}</h3>
                    <h4>${edu.institution}</h4>
                    <p class="education-meta">
                        ${edu.period}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}${edu.semester ? ` | ${edu.semester}` : ''}
                    </p>
                    <p class="education-description">${edu.description}</p>
                </div>
            </div>
        </li>
    `).join('');
    
    // Reinitialize Splide slider if it exists
    if (document.querySelector('.education-slider')) {
        initializeSplide('.education-slider', {
            type: 'loop',
            perPage: 1,
            arrows: false,
            pagination: true,
            autoplay: true,
            interval: 2000,
            gap: 30,
            autoScroll: {
                speed: 0.5,
            },
        });
    }
}

// Skills Section
function populateSkills() {
    const skillsContent = document.querySelector('.skills-content');
    if (!skillsContent) return;
    
    skillsContent.innerHTML = Object.entries(portfolioContent.skills).map(([category, skills]) => `
        <div class="skill-category">
            <h3>${category}</h3>
            <div class="skill-items">
                ${skills.map(skill => `
                    <div class="skill-item">
                        <i class="${skill.icon}"></i>
                        <span>${skill.name}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Projects Section
function populateProjects() {
    // Populate filters
    const projectFilter = document.querySelector('.project-filter');
    if (projectFilter) {
        projectFilter.innerHTML = portfolioContent.projectFilters.map((filter, index) => `
            <button class="filter-btn ${index === 0 ? 'active' : ''}" data-filter="${filter.filter}">
                ${filter.label}
            </button>
        `).join('');
    }
    
    // Populate projects
    const projectsGrid = document.querySelector('.projects-grid');
    if (projectsGrid) {
        projectsGrid.innerHTML = portfolioContent.projects.map(project => `
            <div class="item" data-category="${project.category}">
                <div class="project-card">
                    <div class="project-image">
                        <img src="${project.image}" alt="${project.title}">
                    </div>
                    <div class="project-content">
                        <div>
                            <h3>${project.title}</h3>
                            <p>${project.description}</p>
                        </div>
                        <div>
                            <div class="project-tech">
                                ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                            </div>
                            <div class="project-links">
                                ${project.github ? `
                                    <a href="${project.github}" target="_blank">
                                        <i class="fab fa-github"></i> Code
                                    </a>
                                ` : ''}
                                ${project.live ? `
                                    <a href="${project.live}" target="_blank">
                                        <i class="fas fa-external-link-alt"></i> Live
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Initialize project filter functionality
    initializeProjectFilter();
}

// Initialize Project Filter
function initializeProjectFilter() {
    const filterButtons = document.querySelectorAll('.project-filter .filter-btn');
    const projectCards = document.querySelectorAll('.projects-grid .item');
    
    if (!filterButtons.length || !projectCards.length) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
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
}

// Contact Section
function populateContact() {
    const { contact, personalInfo } = portfolioContent;
    
    // Update heading
    const contactTitle = document.querySelector('.contact .section-title');
    if (contactTitle) contactTitle.textContent = contact.heading;
    
    // Update subheading and description
    const contactInfo = document.querySelector('.contact-info');
    if (contactInfo) {
        const h3 = contactInfo.querySelector('h3');
        const p = contactInfo.querySelector('p');
        if (h3) h3.textContent = contact.subheading;
        if (p) p.textContent = contact.description;
        
        // Update contact details
        const contactDetails = contactInfo.querySelector('.contact-details');
        if (contactDetails) {
            contactDetails.innerHTML = `
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <a href="mailto:${personalInfo.email}">${personalInfo.email}</a>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <a href="tel:${personalInfo.phone}">${personalInfo.phone}</a>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <a href="${personalInfo.locationLink}" target="_blank" rel="noopener noreferrer">${personalInfo.location}</a>
                </div>
            `;
        }
    }
}

// Footer Section
function populateFooter() {
    const { footer, personalInfo } = portfolioContent;
    
    // Update footer logo and description
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        const nameParts = personalInfo.name.split(' ');
        footerLogo.innerHTML = `
            <a href="#home">
                <span>${nameParts[0]}</span>${nameParts.slice(1).join(' ')}
            </a>
            <p>${footer.description}</p>
            <p>${footer.tagline}</p>
        `;
    }
    
    // Update footer links
    const footerLinks = document.querySelector('.footer-links ul');
    if (footerLinks) {
        footerLinks.innerHTML = footer.quickLinks.map(link => `
            <li><a href="${link.href}">${link.label}</a></li>
        `).join('');
    }
}

// Social Links (multiple locations)
function populateSocialLinks() {
    const { socialMedia } = portfolioContent;
    
    const socialLinksContainers = document.querySelectorAll('.social-links');
    socialLinksContainers.forEach(container => {
        container.innerHTML = `
            <a href="${socialMedia.github}" target="_blank"><i class="fab fa-github"></i></a>
            <a href="${socialMedia.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
            <a href="${socialMedia.facebook}" target="_blank"><i class="fab fa-facebook"></i></a>
            <a href="${socialMedia.instagram}" target="_blank"><i class="fab fa-instagram"></i></a>
        `;
    });
    
    // Footer social icons (SVG format)
    const footerSocial = document.querySelector('.footer-social .social-icons');
    if (footerSocial) {
        footerSocial.innerHTML = `
            <a href="${socialMedia.github}" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                    <path d="M9 18c-4.51 2-5-2-7-2"></path>
                </svg>
            </a>
            <a href="${socialMedia.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            </a>
            <a href="${socialMedia.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
            </a>
            <a href="mailto:${portfolioContent.personalInfo.email}" aria-label="Email">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
            </a>
        `;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadContent);
} else {
    loadContent();
}
