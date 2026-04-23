import { 
    db, auth, doc, getDoc, setDoc, onSnapshot, 
    collection, addDoc, query, orderBy, deleteDoc 
} from './firebase-config.js';

const dashboardContainer = document.getElementById('dashboard-container');
const logoutBtn = document.getElementById('logout-btn');
const saveAllBtn = document.getElementById('save-all');
const addArtBtn = document.getElementById('add-art-btn');

// Inputs Map
const inputs = {
    name: document.getElementById('edit-name'),
    email: document.getElementById('edit-email'),
    title: document.getElementById('edit-title'),
    engagement: document.getElementById('edit-engagement'),
    projects: document.getElementById('edit-projects'),
    awards: document.getElementById('edit-awards'),
    globalAwards: document.getElementById('edit-global-awards'),
    experience: document.getElementById('edit-experience'),
    videoUrl: document.getElementById('edit-video-url'),
    sphereUrl: document.getElementById('edit-sphere-url'),
    tools: document.getElementById('edit-tools'),
    experienceLabel: document.getElementById('edit-experience-label'),
    awardsLabel: document.getElementById('edit-awards-label'),
    clientLabel: document.getElementById('edit-client-label'),
    clientLogo: document.getElementById('edit-client-logo')
};

// Check Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        dashboardContainer?.classList.remove('dashboard-hidden');
        loadData();
        listenToGallery();
        listenToLeads();
    } else {
        window.location.href = './auth.html';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = './index.html';
    });
});

// Load Portfolio Data
async function loadData() {
    const docSnap = await getDoc(doc(db, "portfolio", "main"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        for (const key in inputs) {
            if (inputs[key]) inputs[key].value = data[key] || "";
        }
    }
}

// Save Portfolio Data
saveAllBtn.addEventListener('click', async () => {
    saveAllBtn.textContent = "Updating...";
    const data = { updatedAt: new Date().toISOString() };
    for (const key in inputs) {
        if (inputs[key]) data[key] = inputs[key].value;
    }
    await setDoc(doc(db, "portfolio", "main"), data);
    alert("Site settings published!");
    saveAllBtn.textContent = "Publish Site Settings";
});

// Gallery Management
addArtBtn.addEventListener('click', async () => {
    const title = document.getElementById('art-title').value;
    const imageUrl = document.getElementById('art-url').value;
    if (!imageUrl) return alert("Please provide an image URL");

    await addDoc(collection(db, "artworks"), {
        title, imageUrl, createdAt: new Date().toISOString()
    });
    document.getElementById('art-title').value = '';
    document.getElementById('art-url').value = '';
});

function listenToGallery() {
    onSnapshot(query(collection(db, "artworks"), orderBy("createdAt", "desc")), (snapshot) => {
        const list = document.getElementById('gallery-list');
        list.innerHTML = '';
        snapshot.forEach(docSnap => {
            const art = docSnap.data();
            const item = document.createElement('div');
            item.className = 'art-item';
            item.innerHTML = `
                <img src="${art.imageUrl}">
                <button class="delete-art" data-id="${docSnap.id}">&times;</button>
            `;
            list.appendChild(item);
        });

        document.querySelectorAll('.delete-art').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("Delete this artwork from gallery?")) {
                    await deleteDoc(doc(db, "artworks", btn.dataset.id));
                }
            };
        });
    });
}

// Leads Management
function listenToLeads() {
    onSnapshot(query(collection(db, "leads"), orderBy("createdAt", "desc")), (snapshot) => {
        const container = document.getElementById('leads-container');
        container.innerHTML = '';
        snapshot.forEach(docSnap => {
            const lead = docSnap.data();
            const card = document.createElement('div');
            card.className = 'lead-card';
            card.innerHTML = `
                <div class="lead-badge ${lead.allowShowcase ? 'allow' : ''}">
                    ${lead.allowShowcase ? 'Showcase OK' : 'Private'}
                </div>
                <h4>${lead.name}</h4>
                <p><b>WhatsApp:</b> ${lead.whatsapp}</p>
                <p><b>Address:</b> ${lead.address}</p>
                <p><b>Date:</b> ${new Date(lead.createdAt).toLocaleDateString()}</p>
                ${lead.imageUrl ? `<img src="${lead.imageUrl}" class="lead-img">` : ''}
                <button class="dash-btn btn-danger delete-lead" data-id="${docSnap.id}" style="width: 100%; margin-top: 10px;">Archive Lead</button>
            `;
            container.appendChild(card);
        });

        document.querySelectorAll('.delete-lead').forEach(btn => {
            btn.onclick = async () => {
                if (confirm("Archive/Delete this request?")) {
                    await deleteDoc(doc(db, "leads", btn.dataset.id));
                }
            };
        });
    });
}
