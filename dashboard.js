import { 
    db, auth, doc, getDoc, setDoc, 
    onAuthStateChanged, signOut 
} from './firebase-config.js';

const dashboardContainer = document.getElementById('dashboard-container');
const logoutBtn = document.getElementById('logout-btn');
const saveAllBtn = document.getElementById('save-all');

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
        dashboardContainer.classList.remove('dashboard-hidden');
        loadData();
    } else {
        window.location.href = './auth.html';
    }
});

// Logout
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        window.location.href = './index.html';
    });
});

// Load Data from Firestore
async function loadData() {
    const docRef = doc(db, "portfolio", "main");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
        const data = docSnap.data();
        for (const key in inputs) {
            if (inputs[key]) {
                inputs[key].value = data[key] || "";
            }
        }
    }
}

// Save Data to Firestore
saveAllBtn.addEventListener('click', async () => {
    saveAllBtn.textContent = "Updating...";
    saveAllBtn.disabled = true;
    
    const data = { updatedAt: new Date().toISOString() };
    for (const key in inputs) {
        if (inputs[key]) {
            data[key] = inputs[key].value;
        }
    }
    
    try {
        await setDoc(doc(db, "portfolio", "main"), data);
        alert("Portfolio updated successfully!");
    } catch (err) {
        alert("Error updating portfolio: " + err.message);
    } finally {
        saveAllBtn.textContent = "Update All Content";
        saveAllBtn.disabled = false;
    }
});
