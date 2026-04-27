// HikeBuddy - Tab Navigation Script

document.addEventListener('DOMContentLoaded', function() {
    // Get all tab buttons and content sections
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to switch tabs
    function switchTab(tabName) {
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked button
        const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Show corresponding content
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        // Update URL hash for direct linking
        window.location.hash = tabName;
    }

    // Add click event listeners to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Function to switch subtabs
    function switchSubtab(subtabName, parentTab) {
        const parent = parentTab || document.querySelector('.tab-content.active');
        if (!parent) return;

        // Remove active class from subtab buttons and contents within parent
        parent.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
        parent.querySelectorAll('.subtab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked subtab button
        const activeSubBtn = parent.querySelector(`.subtab-btn[data-subtab="${subtabName}"]`);
        if (activeSubBtn) {
            activeSubBtn.classList.add('active');
        }

        // Show corresponding subtab content
        const activeSubContent = parent.querySelector(`#${subtabName}`);
        if (activeSubContent) {
            activeSubContent.classList.add('active');
        }
    }

    // Add click event listeners to all subtab buttons
    document.querySelectorAll('.subtab-btn').forEach(button => {
        button.addEventListener('click', function() {
            const subtabName = this.getAttribute('data-subtab');
            const parentTab = this.closest('.tab-content');
            switchSubtab(subtabName, parentTab);
        });
    });

    // Check URL hash on page load for direct linking
    function checkHash() {
        const hash = window.location.hash.substring(1);
        if (hash && document.getElementById(hash)) {
            switchTab(hash);
        }
    }

    // Check hash on initial load
    checkHash();

    // Listen for hash changes (browser back/forward)
    window.addEventListener('hashchange', checkHash);

    // Smooth scroll for anchor links within content
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active state to external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function() {
            console.log('External link clicked:', this.href);
        });
    });

    // Keyboard navigation for tabs
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const allTabs = Array.from(tabButtons);
                const currentIndex = allTabs.indexOf(activeTab);
                let newIndex;

                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : allTabs.length - 1;
                } else {
                    newIndex = currentIndex < allTabs.length - 1 ? currentIndex + 1 : 0;
                }

                const newTab = allTabs[newIndex];
                const tabName = newTab.getAttribute('data-tab');
                switchTab(tabName);
                newTab.focus();
            }
        }
    });

    // Load hikes data from JSON file
    loadHikesData();

    console.log('HikeBuddy website loaded successfully!');
});

// Function to generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHTML = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }

    // Half star
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }

    return `<span class="star-rating" title="${rating} out of 5 stars">${starsHTML} <span class="rating-number">${rating}</span></span>`;
}

// Function to create a hike card
function createHikeCard(hike) {
    const difficultyClass = hike.difficulty.toLowerCase();
    const notesHTML = hike.notes ? `<p class="hike-notes"><i class="fas fa-quote-left"></i> ${hike.notes}</p>` : '';
    const imageHTML = hike.image ? `
        <div class="hike-image">
            <img src="${hike.image}" alt="${hike.name} - Scenic view" loading="lazy">
        </div>` : '';

    return `
        <div class="hike-card ${difficultyClass}">
            ${imageHTML}
            <div class="hike-header">
                <h4 class="hike-name">${hike.name}</h4>
                ${hike.recommended ? '<span class="recommended-badge"><i class="fas fa-star"></i> Recommended</span>' : ''}
            </div>
            <div class="hike-details">
                <span class="hike-miles"><i class="fas fa-route"></i> ${hike.miles} miles</span>
                <span class="hike-difficulty ${difficultyClass}">${hike.difficulty}</span>
            </div>
            <div class="hike-rating">
                ${generateStarRating(hike.rating)}
            </div>
            ${notesHTML}
            <a href="${hike.link}" target="_blank" class="hike-link">
                <i class="fas fa-external-link-alt"></i> View on AllTrails
            </a>
        </div>
    `;
}

// Function to load and display hikes data
function loadHikesData() {
    fetch('resources/completedhikes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load hikes data');
            }
            return response.json();
        })
        .then(data => {
            const hikes = data.completedHikes || [];

            // Separate recommended hikes
            const recommendedHikes = hikes.filter(hike => hike.recommended);
            const easyHikes = hikes.filter(hike => hike.difficulty === 'Easy');
            const moderateHikes = hikes.filter(hike => hike.difficulty === 'Moderate');
            const hardHikes = hikes.filter(hike => hike.difficulty === 'Hard');

            // Populate recommended hikes
            const recommendedContainer = document.getElementById('recommended-hikes');
            if (recommendedContainer) {
                if (recommendedHikes.length > 0) {
                    recommendedContainer.innerHTML = recommendedHikes.map(hike => createHikeCard(hike)).join('');
                } else {
                    recommendedContainer.innerHTML = '<p class="no-hikes">No recommended hikes yet.</p>';
                }
            }

            // Populate easy hikes
            const easyContainer = document.getElementById('easy-hikes');
            if (easyContainer) {
                if (easyHikes.length > 0) {
                    easyContainer.innerHTML = easyHikes.map(hike => createHikeCard(hike)).join('');
                } else {
                    easyContainer.innerHTML = '<p class="no-hikes">No easy hikes completed yet.</p>';
                }
            }

            // Populate moderate hikes
            const moderateContainer = document.getElementById('moderate-hikes');
            if (moderateContainer) {
                if (moderateHikes.length > 0) {
                    moderateContainer.innerHTML = moderateHikes.map(hike => createHikeCard(hike)).join('');
                } else {
                    moderateContainer.innerHTML = '<p class="no-hikes">No moderate hikes completed yet.</p>';
                }
            }

            // Populate hard hikes
            const hardContainer = document.getElementById('hard-hikes');
            if (hardContainer) {
                if (hardHikes.length > 0) {
                    hardContainer.innerHTML = hardHikes.map(hike => createHikeCard(hike)).join('');
                } else {
                    hardContainer.innerHTML = '<p class="no-hikes">No hard hikes completed yet.</p>';
                }
            }
        })
        .catch(error => {
            console.error('Error loading hikes data:', error);
            const containers = ['recommended-hikes', 'easy-hikes', 'moderate-hikes', 'hard-hikes'];
            containers.forEach(id => {
                const container = document.getElementById(id);
                if (container) {
                    container.innerHTML = '<p class="error">Failed to load hikes data. Please try again later.</p>';
                }
            });
        });
}
