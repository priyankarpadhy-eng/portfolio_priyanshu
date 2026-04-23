import { 
    db, auth, doc, getDoc, setDoc, 
    signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from './firebase-config.js';

const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const saveAllBtn = document.getElementById('save-all');

// Inputs
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
    sphereUrl: document.getElementById('edit-sphere-url')
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
        inputs.name.value = data.name || "";
        inputs.email.value = data.email || "";
        inputs.title.value = data.title || "";
        inputs.engagement.value = data.engagement || "";
        inputs.projects.value = data.projects || "";
        inputs.awards.value = data.awards || "";
        inputs.globalAwards.value = data.globalAwards || "";
        inputs.experience.value = data.experience || "";
        inputs.videoUrl.value = data.videoUrl || "";
        inputs.sphereUrl.value = data.sphereUrl || "";
    }
}

// Save Data to Firestore
saveAllBtn.addEventListener('click', async () => {
    saveAllBtn.textContent = "Updating...";
    saveAllBtn.disabled = true;
    
    const data = {
        name: inputs.name.value,
        email: inputs.email.value,
        title: inputs.title.value,
        engagement: inputs.engagement.value,
        projects: inputs.projects.value,
        awards: inputs.awards.value,
        globalAwards: inputs.globalAwards.value,
        experience: inputs.experience.value,
        videoUrl: inputs.videoUrl.value,
        sphereUrl: inputs.sphereUrl.value,
        updatedAt: new Date().toISOString()
    };
    
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
