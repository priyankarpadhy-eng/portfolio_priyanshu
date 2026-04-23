import { 
    db, doc, onSnapshot, collection, addDoc, query, orderBy, getDocs 
} from './firebase-config.js';

// UI Elements
const displayName = document.getElementById('display-name');
const cardName = document.getElementById('card-name');
const cardTitle = document.getElementById('card-title');
const totalEngagement = document.getElementById('total-engagement');
const projectsCount = document.getElementById('projects-count');
const awardsCount = document.getElementById('awards-count');
const globalAwardsCount = document.getElementById('global-awards-count');
const toolsContainer = document.getElementById('tools-container');
const videoThumbnail = document.getElementById('video-thumbnail');
const sphereImage = document.getElementById('sphere-image');
const mainGalleryGrid = document.getElementById('main-gallery-grid');

// Animation Elements
const card = document.getElementById('portfolio-card');
const gallery = document.getElementById('gallery-section');
const slotTop = document.getElementById('printer-slot');
const slotBot = document.getElementById('printer-slot-bottom');
const feedLines = document.querySelectorAll('.feed-line');

// Register GSAP
gsap.registerPlugin(ScrollTrigger);

// Initialize Printer Effect Timeline
function initPrinterAnimation() {
    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: '#printer-zone',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
        }
    });

    // 0–20%: printer slots fade in
    tl.to([slotTop, slotBot], { opacity: 1, duration: 0.2 }, 0)
      .to(feedLines, { opacity: 1, duration: 0.2 }, 0)

    // 0–50%: card scales down + squishes (paper feeding into printer)
      .to(card, {
        scaleX: 0.82,
        scaleY: 0.14,
        borderRadius: '8px',
        opacity: 0,
        filter: 'blur(3px)',
        ease: 'power2.in',
        duration: 0.5,
      }, 0)

    // 50%: slots/feed lines fade out
      .to([slotTop, slotBot, feedLines], { opacity: 0, duration: 0.1 }, 0.5)

    // 55%+: gallery fades in
      .to(gallery, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.2,
      }, 0.55);

    // Subtle continuous paper feed texture on card during mid-scroll
    ScrollTrigger.create({
        trigger: '#printer-zone',
        start: 'top top',
        end: '40% bottom',
        onUpdate: self => {
            const p = self.progress;
            if (p > 0.05 && p < 0.9) {
                const offset = (p * 400) % 16;
                feedLines.forEach(fl => {
                    fl.style.backgroundPositionY = offset + 'px';
                });
            }
        }
    });
}

// Real-time Data Sync
onSnapshot(doc(db, "portfolio", "main"), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Header & Bio
        if (data.name) {
            displayName.innerHTML = data.name;
            cardName.textContent = data.name.replace(/<br>/g, ' ').split(' ')[0];
        }
        if (data.title) cardTitle.textContent = data.title;
        
        // Stats
        if (data.engagement) totalEngagement.textContent = data.engagement;
        if (data.projects) projectsCount.textContent = data.projects;
        if (data.awards) awardsCount.textContent = data.awards;
        if (data.globalAwards) globalAwardsCount.textContent = data.globalAwards;

        // Assets
        if (data.videoUrl) videoThumbnail.src = data.videoUrl;
        if (data.sphereUrl) sphereImage.src = data.sphereUrl;

        // Tools
        if (data.tools) {
            toolsContainer.innerHTML = '';
            const toolsList = Array.isArray(data.tools) ? data.tools : data.tools.split(',');
            toolsList.forEach(tool => {
                const pill = document.createElement('div');
                pill.className = 'tool-pill';
                pill.textContent = tool.trim();
                toolsContainer.appendChild(pill);
            });
        }
    }
});

// Load Gallery dynamically from Firestore
async function loadGallery() {
    const q = query(collection(db, "artworks"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    mainGalleryGrid.innerHTML = '';

    snapshot.forEach((docSnap, index) => {
        const artwork = docSnap.data();
        const item = document.createElement('div');
        item.className = 'g-item';
        
        // Set dynamic grid spanning
        const spans = [
            'grid-column: 1/6; grid-row: 1/4;',
            'grid-column: 6/9; grid-row: 1/3;',
            'grid-column: 9/13; grid-row: 1/3;',
            'grid-column: 6/9; grid-row: 3/5;',
            'grid-column: 9/11; grid-row: 3/5;',
            'grid-column: 11/13; grid-row: 3/5;',
            'grid-column: 1/4; grid-row: 4/6;',
            'grid-column: 4/7; grid-row: 4/6;',
            'grid-column: 7/10; grid-row: 5/7;',
            'grid-column: 10/13; grid-row: 5/7;',
            'grid-column: 1/5; grid-row: 6/8;',
            'grid-column: 5/8; grid-row: 6/8;'
        ];
        item.style.cssText = spans[index % spans.length];

        item.innerHTML = `
            <img src="${artwork.url}" alt="${artwork.title}">
            <div class="g-label">${artwork.title}</div>
        `;
        mainGalleryGrid.appendChild(item);
    });

    // Animate gallery items after loading
    gsap.set('.g-item', { opacity: 0, y: 30, scale: 0.92 });
    gsap.to('.g-item', {
        scrollTrigger: {
            trigger: '#gallery-section',
            start: 'top 60%',
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.05,
        ease: 'back.out(1.4)'
    });
}

// Modal Logic
const modal = document.getElementById('modal-overlay');
const openBtn = document.getElementById('open-request-form');
const closeBtn = document.getElementById('close-modal');

openBtn.onclick = () => modal.classList.add('modal-active');
closeBtn.onclick = () => modal.classList.remove('modal-active');
window.onclick = (e) => { if (e.target == modal) modal.classList.remove('modal-active'); };

// Form Submission
const requestForm = document.getElementById('artwork-request-form');
requestForm.onsubmit = async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submit-request');
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    const leadData = {
        name: document.getElementById('req-name').value,
        whatsapp: document.getElementById('req-whatsapp').value,
        phone: document.getElementById('req-phone').value,
        imageUrl: document.getElementById('req-image').value,
        address: document.getElementById('req-address').value,
        allowShowcase: document.getElementById('req-showcase').checked,
        createdAt: new Date().toISOString(),
        status: 'new'
    };

    try {
        await addDoc(collection(db, "leads"), leadData);
        alert('Request sent successfully! I will contact you on WhatsApp soon.');
        requestForm.reset();
        modal.classList.remove('modal-active');
    } catch (error) {
        console.error("Error adding document: ", error);
        alert('Error sending request. Please try again.');
    } finally {
        submitBtn.textContent = 'Send Request';
        submitBtn.disabled = false;
    }
};

// Initialize
initPrinterAnimation();
loadGallery();
