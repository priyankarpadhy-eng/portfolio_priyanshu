import { db, doc, onSnapshot, collection, addDoc, query, orderBy } from './firebase-config.js';

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
    sphereImage: document.getElementById('sphere-image'),
    clientLogo: document.getElementById('client-logo'),
    clientLabel: document.getElementById('client-label'),
    awardsLabel: document.getElementById('awards-label'),
    experienceLabel: document.getElementById('experience-label'),
    toolsContainer: document.getElementById('tools-container'),
    mainGallery: document.getElementById('main-gallery-grid')
};

// Real-time listener for Firestore data
onSnapshot(doc(db, "portfolio", "main"), (doc) => {
    if (doc.exists()) {
        const data = doc.data();
        if (elements.displayName) elements.displayName.innerHTML = (data.name || "Im,<br>Your<br>Name").replace(/\n/g, '<br>');
        if (elements.displayEmail) elements.displayEmail.innerHTML = `${data.email || "hello@example.com"} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;
        if (elements.portfolioTitle) elements.portfolioTitle.textContent = data.title || "Portfolio";
        if (elements.totalEngagement) elements.totalEngagement.textContent = data.engagement || "0.0M+";
        if (elements.projectsCount) elements.projectsCount.textContent = data.projects || "0";
        if (elements.awardsCount) elements.awardsCount.textContent = data.awards || "0";
        if (elements.globalAwardsCount) elements.globalAwardsCount.textContent = data.globalAwards || "0";
        if (elements.experienceYears) elements.experienceYears.textContent = data.experience || "0+";
        if (data.awardsLabel && elements.awardsLabel) elements.awardsLabel.innerHTML = data.awardsLabel.replace(/\n/g, '<br>');
        if (data.experienceLabel && elements.experienceLabel) elements.experienceLabel.innerHTML = data.experienceLabel.replace(/\n/g, '<br>');
        if (data.clientLabel && elements.clientLabel) elements.clientLabel.textContent = data.clientLabel;
        if (data.clientLogo && elements.clientLogo) elements.clientLogo.textContent = data.clientLogo;
        if (data.videoUrl && elements.videoThumbnail) elements.videoThumbnail.src = data.videoUrl;
        if (data.sphereUrl && elements.sphereImage) elements.sphereImage.src = data.sphereUrl;

        if (data.tools && elements.toolsContainer) {
            elements.toolsContainer.innerHTML = '';
            const toolsList = Array.isArray(data.tools) ? data.tools : data.tools.split(',');
            toolsList.forEach(tool => {
                const toolDiv = document.createElement('div');
                toolDiv.className = 'tool-icon';
                toolDiv.textContent = tool.trim();
                elements.toolsContainer.appendChild(toolDiv);
            });
        }
    }
});

// Fetch Gallery for Landing Page
if (elements.mainGallery) {
    onSnapshot(query(collection(db, "artworks"), orderBy("createdAt", "desc")), (snapshot) => {
        elements.mainGallery.innerHTML = '';
        snapshot.forEach(doc => {
            const art = doc.data();
            const card = document.createElement('div');
            card.className = 'art-card';
            card.innerHTML = `
                <img src="${art.imageUrl}" alt="${art.title}">
                <div class="art-info">
                    <h3>${art.title || 'Untitled'}</h3>
                    <p>${art.description || 'Premium Drawing'}</p>
                </div>
            `;
            elements.mainGallery.appendChild(card);
        });
    });
}

// GSAP Scroll Animation: Paper into Printer
gsap.registerPlugin(ScrollTrigger);

// Ensure smooth height
gsap.set("#gallery-section", { opacity: 0, scale: 0.9, y: 100 });

const tl = gsap.timeline({
    scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
    }
});

tl.to("#hero-section", {
    rotateX: -20,
    scale: 0.85,
    y: "-50%",
    opacity: 0,
    ease: "power1.inOut"
})
.to("#gallery-section", {
    opacity: 1,
    scale: 1,
    y: 0,
    marginTop: "0",
    ease: "power1.out"
}, "<"); // Start together


// Modal Logic
const modal = document.getElementById('modal-overlay');
const openBtn = document.getElementById('open-request-form');
const closeBtn = document.getElementById('close-modal');
const requestForm = document.getElementById('artwork-request-form');

if (openBtn) {
    openBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });
}

if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-request');
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('req-name').value,
            whatsapp: document.getElementById('req-whatsapp').value,
            phone: document.getElementById('req-phone').value,
            imageUrl: document.getElementById('req-image').value,
            address: document.getElementById('req-address').value,
            allowShowcase: document.getElementById('req-showcase').checked,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        try {
            await addDoc(collection(db, "leads"), formData);
            alert("Request sent successfully! We will contact you on WhatsApp soon.");
            requestForm.reset();
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        } catch (error) {
            alert("Error sending request: " + error.message);
        } finally {
            submitBtn.textContent = 'Send Request';
            submitBtn.disabled = false;
        }
    });
}

// Hidden Slider Logic
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
    };

    const handleMove = (clientX) => {
        if (!isDragging) return;
        let move = clientX - startX;
        move = Math.max(0, Math.min(move, 120));
        currentX = move;
        aboutMeTag.style.transform = `translateX(${move}px)`;
        if (move >= 100) {
            isDragging = false;
            aboutMeTag.style.background = '#00b894';
            setTimeout(() => { window.location.href = './auth.html'; }, 200);
        }
    };

    const handleEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        currentX = 0;
        aboutMeTag.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        aboutMeTag.style.transform = 'translateX(0)';
        aboutMeTag.style.scale = '1';
    };

    aboutMeTag.addEventListener('mousedown', (e) => handleStart(e.clientX));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('mouseup', handleEnd);
    aboutMeTag.addEventListener('touchstart', (e) => handleStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', (e) => handleMove(e.touches[0].clientX), { passive: false });
    window.addEventListener('touchend', handleEnd);
}
