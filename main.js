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

if (aboutMeTag) {
    aboutMeTag.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        aboutMeTag.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        let move = e.clientX - startX;
        move = Math.max(0, Math.min(move, 150)); // Max drag 150px
        
        aboutMeTag.style.transform = `translateX(${move}px)`;
        
        // Check if reached threshold (100px)
        if (move >= 120) {
            isDragging = false;
            aboutMeTag.style.background = '#00b894';
            setTimeout(() => {
                window.location.href = './auth.html';
            }, 300);
        }
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        aboutMeTag.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        aboutMeTag.style.transform = 'translateX(0)';
    });

    // Touch support
    aboutMeTag.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        aboutMeTag.style.transition = 'none';
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        let move = e.touches[0].clientX - startX;
        move = Math.max(0, Math.min(move, 150));
        aboutMeTag.style.transform = `translateX(${move}px)`;
        if (move >= 120) {
            isDragging = false;
            window.location.href = './auth.html';
        }
    });

    document.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        aboutMeTag.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        aboutMeTag.style.transform = 'translateX(0)';
    });
}


