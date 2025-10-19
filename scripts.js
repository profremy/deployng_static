// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-bs-theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('theme', newTheme);
});

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-bs-theme', savedTheme);
themeToggle.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';

// Navbar shrink on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('shrink', window.scrollY > 50);
});

// Fetch and render blog posts
const blogPostsContainer = document.getElementById('blog-posts');
const songSelect = document.getElementById('song-select');

async function loadBlogPosts() {
    try {
        const response = await fetch('blog-posts.json');
        if (!response.ok) throw new Error('Failed to fetch blog posts');
        const blogData = await response.json();

        // Populate dropdown with song titles
        blogData.forEach(post => {
            const option = document.createElement('option');
            option.value = post.title;
            option.textContent = post.title;
            songSelect.appendChild(option);
        });

        // Handle song selection
        songSelect.addEventListener('change', () => {
            const selectedTitle = songSelect.value;
            blogPostsContainer.innerHTML = '';

            // Loop through blogData to find matching title
            for (const post of blogData) {
                if (post.title === selectedTitle) {
                    const postElement = document.createElement('div');
                    postElement.classList.add('col-12', 'blog-post');
                    postElement.innerHTML = `
                        <h3>${post.title}</h3>
                        <pre>${post.lyrics}</pre>
                        <p><strong>Breakdown:</strong> ${post.breakdown}</p>
                        <ul>
                            ${post.comments.map(comment => `<li>${comment}</li>`).join('')}
                        </ul>
                        <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#lyricsModal-${post.title.replace(/\s/g, '')}" aria-label="View ${post.title} in modal">View in Modal</button>
                    `;
                    blogPostsContainer.appendChild(postElement);

                    // Create modal for the selected post
                    const modal = document.createElement('div');
                    modal.classList.add('modal', 'fade');
                    modal.id = `lyricsModal-${post.title.replace(/\s/g, '')}`;
                    modal.tabIndex = -1;
                    modal.setAttribute('aria-labelledby', 'lyricsModalLabel');
                    modal.setAttribute('aria-hidden', 'true');
                    modal.innerHTML = `
                        <div class="modal-dialog modal-fullscreen-sm-down">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="lyricsModalLabel">${post.title}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <pre>${post.lyrics}</pre>
                                    <p>${post.breakdown}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    // Remove existing lyric modals to avoid duplicates
                    document.querySelectorAll('.modal[id^="lyricsModal-"]').forEach(m => m.remove());
                    document.body.appendChild(modal);
                    break; // Exit loop once match is found
                }
            }
        });

        // Render first song by default if available
        if (blogData.length > 0) {
            songSelect.value = blogData[0].title;
            songSelect.dispatchEvent(new Event('change'));
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        blogPostsContainer.innerHTML = '<p class="text-danger">Failed to load blog posts. Please try again later.</p>';
    }
}

// Load posts and set up event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();

    // Accessibility for modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('shown.bs.modal', () => {
            modal.querySelector('.modal-body').focus();
        });
    });

    // Prevent pinch zoom
    document.addEventListener('touchmove', e => {
        if (e.scale !== 1) e.preventDefault();
    }, { passive: false });
});