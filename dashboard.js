import { 
    db, auth, doc, getDoc, setDoc, onSnapshot, 
    collection, query, orderBy, deleteDoc 
} from './firebase-config.js';

// UI Elements
const dashName = document.getElementById('dash-name');
const welcomeName = document.getElementById('welcome-name');
const dashTitle = document.getElementById('dash-title');
const dashEngagement = document.getElementById('dash-engagement');
const dashProjects = document.getElementById('dash-projects');
const dashAwards = document.getElementById('dash-awards');
const dashGlobalAwards = document.getElementById('dash-global-awards');
const dashExperience = document.getElementById('dash-experience');
const dashAvatar = document.getElementById('dash-avatar');
const dashTools = document.getElementById('dash-tools');

const editorOverlay = document.getElementById('editor-overlay');
const closeEditor = document.getElementById('close-editor');
const saveAllBtn = document.getElementById('save-all');
const logoutBtn = document.getElementById('logout-btn');

// Editor Inputs
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
    avatarUrl: document.getElementById('edit-avatar')
};

// Check Auth State
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadData();
        listenToLeads();
    } else {
        window.location.href = './auth.html';
    }
});

// Load Portfolio Data
async function loadData() {
    const docSnap = await getDoc(doc(db, "portfolio", "main"));
    if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Update Dashboard View
        dashName.textContent = (data.name || "Kristin Watson").replace(/\\n/g, ' ');
        welcomeName.textContent = `Welcome, ${(data.name || "Kristin").split(/\\n| /)[0]}`;
        dashTitle.textContent = data.title || "Design Manager";
        dashEngagement.textContent = data.engagement || "0.0M+";
        dashProjects.textContent = data.projects || "0";
        dashAwards.textContent = data.awards || "0";
        dashGlobalAwards.textContent = data.globalAwards || "0%";
        dashExperience.textContent = data.experience || "0%";
        if (data.avatarUrl) dashAvatar.src = data.avatarUrl;

        // Tools
        if (data.tools) {
            dashTools.innerHTML = '';
            const toolsList = Array.isArray(data.tools) ? data.tools : data.tools.split(',');
            toolsList.slice(0, 4).forEach(tool => {
                const pill = document.createElement('div');
                pill.className = 'tool-pill';
                pill.textContent = tool.trim().substring(0, 2);
                dashTools.appendChild(pill);
            });
            if (toolsList.length > 4) {
                const more = document.createElement('div');
                more.className = 'tool-pill';
                more.textContent = '...';
                dashTools.appendChild(more);
            }
        }

        // Populate Editor
        for (const key in inputs) {
            if (inputs[key]) inputs[key].value = data[key] || "";
        }
    }
}

// Leads Management (Top Right Sidebar)
function listenToLeads() {
    onSnapshot(query(collection(db, "leads"), orderBy("createdAt", "desc")), (snapshot) => {
        const container = document.getElementById('leads-container');
        container.innerHTML = '';
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="color: #888; font-size: 0.8rem;">No new requests</p>';
            return;
        }

        snapshot.forEach(docSnap => {
            const lead = docSnap.data();
            const date = new Date(lead.createdAt);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' });

            const item = document.createElement('div');
            item.className = 'request-item';
            item.innerHTML = `
                <div class="r-date">${dateStr} <br> <b>${timeStr}</b></div>
                <div class="r-info">
                    <h4>${lead.name}</h4>
                    <p><span>📞</span> ${lead.whatsapp || 'WhatsApp'}</p>
                </div>
                <div class="r-arrow" style="cursor: pointer;" data-id="${docSnap.id}">↗</div>
            `;
            container.appendChild(item);
        });

        // Click on lead to see details (simple alert for now or just archive)
        document.querySelectorAll('.r-arrow').forEach(btn => {
            btn.onclick = async () => {
                const leadId = btn.dataset.id;
                const leadSnap = await getDoc(doc(db, "leads", leadId));
                if (leadSnap.exists()) {
                    const lead = leadSnap.data();
                    const details = `
                        Name: ${lead.name}
                        WhatsApp: ${lead.whatsapp}
                        Address: ${lead.address}
                        Showcase OK: ${lead.allowShowcase}
                        
                        Archive this lead?
                    `;
                    if (confirm(details)) {
                        await deleteDoc(doc(db, "leads", leadId));
                    }
                }
            };
        });
    });
}

// Interaction Logic
document.querySelector('.profile-card').addEventListener('click', () => {
    editorOverlay.classList.remove('editor-hidden');
    editorOverlay.classList.add('editor-active');
});

closeEditor.addEventListener('click', () => {
    editorOverlay.classList.add('editor-hidden');
    editorOverlay.classList.remove('editor-active');
});

saveAllBtn.addEventListener('click', async () => {
    saveAllBtn.textContent = "Saving...";
    const data = { updatedAt: new Date().toISOString() };
    for (const key in inputs) {
        if (inputs[key]) data[key] = inputs[key].value;
    }
    await setDoc(doc(db, "portfolio", "main"), data);
    alert("Portfolio data updated successfully!");
    saveAllBtn.textContent = "Save Changes";
    editorOverlay.classList.add('editor-hidden');
    editorOverlay.classList.remove('editor-active');
    loadData();
});

logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = './index.html';
    });
});
