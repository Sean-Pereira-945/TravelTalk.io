// DOM Elements
const blogGrid = document.getElementById('blogGrid');
const blogForm = document.getElementById('blogForm');
const contactForm = document.getElementById('contactForm');
const searchInput = document.getElementById('searchInput');

// API URL (change this to your deployed backend URL when deploying)
const API_URL = `http://localhost:${window.location.port || '3000'}/api`;

// Load blogs when the page loads
document.addEventListener('DOMContentLoaded', loadBlogs);

// Load blogs function
async function loadBlogs() {
    try {
        const response = await fetch(`${API_URL}/blogs`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error loading blogs');
        }
        
        if (data.length === 0) {
            displayEmptyState();
        } else {
            displayBlogs(data);
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        showNotification(error.message || 'Error loading blogs', 'error');
        displayEmptyState();
    }
}

// Display empty state
function displayEmptyState() {
    blogGrid.innerHTML = `
        <div class="empty-state">
            <h3>No blogs found</h3>
            <p>Be the first to create a blog post!</p>
        </div>
    `;
}

// Display blogs function
function displayBlogs(blogs) {
    blogGrid.innerHTML = '';
    blogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        blogCard.innerHTML = `
            <img src="${blog.imageUrl}" alt="${blog.title}" class="blog-image" onerror="this.src='https://via.placeholder.com/400x200?text=Historical+Blogs'">
            <div class="blog-content">
                <h3>${blog.title}</h3>
                <p>${blog.content.substring(0, 150)}${blog.content.length > 150 ? '...' : ''}</p>
                <button class="read-more-btn">Read More</button>
            </div>
        `;
        
        // Add click event to show blog modal
        blogCard.querySelector('.read-more-btn').addEventListener('click', () => {
            showBlogModal(blog);
        });
        
        blogGrid.appendChild(blogCard);
    });
}

// Show blog modal
function showBlogModal(blog) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <img src="${blog.imageUrl}" alt="${blog.title}" class="modal-image" onerror="this.src='https://via.placeholder.com/800x400?text=Historical+Blogs'">
            <div class="modal-body">
                <h2>${blog.title}</h2>
                <p class="blog-date">${formattedDate}</p>
                <div class="blog-text">${blog.content}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Function to close modal and restore scrolling
    const closeModal = () => {
        document.body.style.overflow = '';
        modal.remove();
    };
    
    // Close modal when clicking the close button or outside the modal
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Handle escape key press
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
    
    // Prevent scrolling of background when modal is open
    document.body.style.overflow = 'hidden';
}

// Handle blog form submission
blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('blogTitle').value,
        content: document.getElementById('blogContent').value,
        imageUrl: document.getElementById('imageUrl').value || 'https://via.placeholder.com/400x200?text=Historical+Blogs'
    };

    try {
        const response = await fetch(`${API_URL}/blogs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(blogData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to post blog');
        }

        showNotification('Blog posted successfully!', 'success');
        blogForm.reset();
        loadBlogs();
    } catch (error) {
        console.error('Error posting blog:', error);
        showNotification(error.message || 'Error posting blog', 'error');
    }
});

// Handle contact form submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contactData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to send message');
        }

        showNotification('Message sent successfully!', 'success');
        contactForm.reset();
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification(error.message || 'Error sending message', 'error');
    }
});

// Search functionality
searchInput.addEventListener('input', debounce(async (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    try {
        const response = await fetch(`${API_URL}/blogs`);
        const blogs = await response.json();
        
        if (!response.ok) {
            throw new Error('Error searching blogs');
        }

        if (searchTerm === '') {
            displayBlogs(blogs);
            return;
        }
        
        const filteredBlogs = blogs.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm) || 
            blog.content.toLowerCase().includes(searchTerm)
        );
        
        if (filteredBlogs.length === 0) {
            blogGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No matching blogs found</h3>
                    <p>Try a different search term</p>
                </div>
            `;
        } else {
            displayBlogs(filteredBlogs);
        }
    } catch (error) {
        console.error('Error searching blogs:', error);
        showNotification('Error searching blogs', 'error');
    }
}, 300));

// Utility function to debounce search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Notification system
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add notification and empty state styles
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 5px;
        color: white;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    }
    
    .notification.success {
        background-color: #4caf50;
    }
    
    .notification.error {
        background-color: #f44336;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        grid-column: 1 / -1;
    }

    .empty-state h3 {
        color: #333;
        margin-bottom: 1rem;
    }

    .empty-state p {
        color: #666;
    }

    .read-more-btn {
        background-color: #6a11cb;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 1rem;
        transition: background-color 0.3s;
    }

    .read-more-btn:hover {
        background-color: #5a0fb0;
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal-content {
        background-color: white;
        border-radius: 10px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
    }

    @keyframes modalSlideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .close-modal {
        position: absolute;
        right: 20px;
        top: 20px;
        font-size: 28px;
        font-weight: bold;
        color: white;
        cursor: pointer;
        z-index: 1;
        text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    .modal-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .modal-body {
        padding: 2rem;
    }

    .modal-body h2 {
        color: #333;
        margin-bottom: 0.5rem;
    }

    .blog-date {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 1.5rem;
    }

    .blog-text {
        color: #444;
        line-height: 1.6;
        white-space: pre-line;
    }

    @media (max-width: 768px) {
        .modal-content {
            width: 95%;
        }

        .modal-image {
            height: 200px;
        }

        .modal-body {
            padding: 1rem;
        }
    }
`;
document.head.appendChild(style); 