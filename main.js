import { db, doc, onSnapshot } from './firebase-config.js';

// Elements to update
const elements = {
    displayName: document.getElementById('display-name'),
    displayEmail: document.getElementById('display-email'),
    portfolioTitle: document.getElementById('portfolio-title'),
    totalEngagement: document.getElementById('total-engagement'),
    projectsCount: document.getElementById('projects-count'),
    awardsCount: document.getElementById('awards-count'),
    globalAwardsCount: document.getElementById('global-awards-count'),
    experienceYears: document.getElementById('experience-years'),
    videoThumbnail: document.getElementById('video-thumbnail'),
    sphereImage: document.getElementById('sphere-image')
};

// Check if Firebase is configured
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// We check the config in firebase-config.js, but here we just catch failures
try {
const unsub = onSnapshot(doc(db, "portfolio", "main"), (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        
        if (data.name) elements.displayName.innerHTML = data.name.replace(/\n/g, '<br>');
        if (data.email) elements.displayEmail.innerHTML = `${data.email} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
        if (data.title) elements.portfolioTitle.textContent = data.title;
        if (data.engagement) elements.totalEngagement.textContent = data.engagement;
        if (data.projects) elements.projectsCount.textContent = data.projects;
        if (data.awards) elements.awardsCount.textContent = data.awards;
        if (data.globalAwards) elements.globalAwardsCount.textContent = data.globalAwards;
        if (data.experience) elements.experienceYears.textContent = data.experience;
        
        // Handle images (could be Backblaze B2 URLs)
        if (data.videoUrl) elements.videoThumbnail.src = data.videoUrl;
        if (data.sphereUrl) elements.sphereImage.src = data.sphereUrl;
    }
});
} catch (e) {
    console.warn("Firebase not configured. Using local defaults.");
}

// Subtle interactions
document.querySelectorAll('.stat-card, .video-card, .clients-card, .awards-card, .extra-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 10px 30px rgba(255, 102, 196, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = 'none';
    });
});

// Hidden Slider Logic (Secret Entrance)
const aboutMeTag = document.getElementById('about-me-tag');
let isDragging = false;
let startX = 0;
let currentX = 0;

if (aboutMeTag) {
    const handleStart = (clientX) => {
        isDragging = true;
        startX = clientX - currentX;
        aboutMeTag.style.transition = 'none';
        aboutMeTag.style.scale = '1.05';
        aboutMeTag.style.boxShadow = '0 10px 30px rgba(108, 92, 231, 0.4)';
    };

    const handleMove = (clientX) => {
        if (!isDragging) return;
        
        let move = clientX - startX;
        move = Math.max(0, Math.min(move, 120)); // Max drag 120px
        currentX = move;
        
        aboutMeTag.style.transform = `translateX(${move}px)`;
        
        // Success Threshold
        if (move >= 100) {
            isDragging = false;
            aboutMeTag.style.background = '#00b894';
            aboutMeTag.style.transform = 'translateX(100px) scale(0.9)';
            setTimeout(() => {
                window.location.href = './auth.html';
            }, 200);
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        currentX = 0;
        aboutMeTag.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        aboutMeTag.style.transform = 'translateX(0)';
        aboutMeTag.style.scale = '1';
        aboutMeTag.style.boxShadow = '0 4px 15px rgba(108, 92, 231, 0.2)';
        aboutMeTag.style.background = ''; // Reset to CSS default
    };

    // Mouse Events
    aboutMeTag.addEventListener('mousedown', (e) => handleStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('mouseup', handleEnd);

    // Touch Events
    aboutMeTag.addEventListener('touchstart', (e) => {
        handleStart(e.touches[0].clientX);
    }, { passive: true });
    
    window.addEventListener('touchmove', (e) => {
        handleMove(e.touches[0].clientX);
    }, { passive: false });
    
    window.addEventListener('touchend', handleEnd);
}



