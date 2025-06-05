// Email JS integration
document.addEventListener('DOMContentLoaded', function() {
  // Initialize EmailJS with your user ID
  // Replace 'YOUR_USER_ID' with your actual EmailJS user ID
  emailjs.init('alishpawn00@gmail.com');
  
  const contactForm = document.getElementById('contact-form');
  const submitButton = contactForm.querySelector('button[type="submit"]');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Change button state during sending
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<span>Sending...</span>';
    submitButton.disabled = true;
    
    // Get form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // Prepare template parameters
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject,
      message: message
    };  
    
    // Send email using EmailJS
    // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual EmailJS service and template IDs
    emailjs.send('service_ybmipbr', 'template_p573m6t', templateParams)
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
          <div style="padding: 1rem; background-color: #10B981; color: white; border-radius: 0.5rem; margin-bottom: 1rem;">
            <p style="margin: 0;">Message sent successfully! I'll get back to you soon.</p>
          </div>
        `;
        
        contactForm.prepend(successMessage);
        
        // Reset form
        contactForm.reset();
        
        // Reset button
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Remove success message after 5 seconds
        setTimeout(() => {
          successMessage.remove();
        }, 5000);
      })
      .catch(function(error) {
        console.log('FAILED...', error);
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
          <div style="padding: 1rem; background-color: #EF4444; color: white; border-radius: 0.5rem; margin-bottom: 1rem;">
            <p style="margin: 0;">Failed to send message. Please try again later or contact directly via email.</p>
          </div>
        `;
        
        contactForm.prepend(errorMessage);
        
        // Reset button
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
        
        // Remove error message after 5 seconds
        setTimeout(() => {
          errorMessage.remove();
        }, 5000);
      });
  });
  
  // Form validation - real-time feedback
  const formInputs = contactForm.querySelectorAll('input, textarea');
  
  formInputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateInput(this);
    });
    
    input.addEventListener('input', function() {
      if (this.classList.contains('invalid')) {
        validateInput(this);
      }
    });
  });
  
  function validateInput(input) {
    if (input.value.trim() === '') {
      input.classList.add('invalid');
      input.style.borderColor = '#EF4444';
      
      // Add error message if it doesn't exist
      let errorElement = input.parentNode.querySelector('.error-text');
      
      if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.className = 'error-text';
        errorElement.style.color = '#EF4444';
        errorElement.style.fontSize = '0.75rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.textContent = 'This field is required';
        
        input.parentNode.appendChild(errorElement);
      }
    } else {
      // For email validation
      if (input.type === 'email' && !isValidEmail(input.value)) {
        input.classList.add('invalid');
        input.style.borderColor = '#EF4444';
        
        let errorElement = input.parentNode.querySelector('.error-text');
        
        if (!errorElement) {
          errorElement = document.createElement('span');
          errorElement.className = 'error-text';
          errorElement.style.color = '#EF4444';
          errorElement.style.fontSize = '0.75rem';
          errorElement.style.marginTop = '0.25rem';
          errorElement.textContent = 'Please enter a valid email address';
          
          input.parentNode.appendChild(errorElement);
        } else {
          errorElement.textContent = 'Please enter a valid email address';
        }
      } else {
        input.classList.remove('invalid');
        input.style.borderColor = '';
        
        const errorElement = input.parentNode.querySelector('.error-text');
        if (errorElement) {
          errorElement.remove();
        }
      }
    }
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});

// Instructions for setting up EmailJS:
/*
  1. Sign up for a free account at https://www.emailjs.com/
  2. Create a new email service (e.g., Gmail, Outlook, etc.)
  3. Create an email template
  4. Replace the following in this file:
     - YOUR_USER_ID with your EmailJS user ID
     - YOUR_SERVICE_ID with your EmailJS service ID
     - YOUR_TEMPLATE_ID with your EmailJS template ID
  5. In your email template, use the following variables:
     - {{from_name}} - Sender's name
     - {{from_email}} - Sender's email
     - {{subject}} - Email subject
     - {{message}} - Email message
*/