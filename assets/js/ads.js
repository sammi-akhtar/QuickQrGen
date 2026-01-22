// QuickQRGen - Ads Management
document.addEventListener('DOMContentLoaded', function() {
    // Ad configuration
    const adConfig = {
        adSense: {
            enabled: true,
            scriptUrl: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
            client: 'ca-pub-1234567890123456', // Replace with actual AdSense client ID
            slot: '1234567890', // Replace with actual AdSense slot ID
            adSlot: '1234567890' // Replace with actual AdSense slot ID
        },
        propellerads: {
            enabled: true,
            scriptUrl: 'https://cdn.propellerads.com/1.0/ads.js', // PropellerAds script URL
            zoneId: '1234567890', // Replace with actual PropellerAds zone ID
            fallback: true
        },
        adBlockerDetected: false,
        adsLoaded: false
    };

    // Initialize ads
    function initAds() {
        // Check for ad blocker
        detectAdBlocker();

        // Load ads if not blocked
        if (!adConfig.adBlockerDetected) {
            loadPrimaryAds();
        } else {
            showAdBlockerWarning();
            loadFallbackAds();
        }
    }

    // Detect ad blocker
    function detectAdBlocker() {
        // Create a test ad element
        const testAd = document.createElement('div');
        testAd.className = 'adsbox';
        testAd.style.display = 'none';
        document.body.appendChild(testAd);

        // Check if the test ad is blocked
        setTimeout(() => {
            if (testAd.offsetHeight === 0 || testAd.clientHeight === 0) {
                adConfig.adBlockerDetected = true;
            }
            document.body.removeChild(testAd);
        }, 100);
    }

    // Show ad blocker warning
    function showAdBlockerWarning() {
        const warning = document.createElement('div');
        warning.id = 'adblock-warning';
        warning.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4';
        warning.innerHTML = `
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.493-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm">
                        ⚠️ Ads help keep QuickQRGen free. Please consider disabling your ad blocker. ❤️
                        <button id="dismiss-adblock-warning" class="ml-4 text-sm font-medium text-yellow-800 hover:text-yellow-900">
                            Dismiss
                        </button>
                    </p>
                </div>
            </div>
        `;

        // Insert warning after header
        const header = document.querySelector('header');
        if (header) {
            header.after(warning);

            // Add dismiss functionality
            document.getElementById('dismiss-adblock-warning')?.addEventListener('click', function() {
                warning.style.display = 'none';
            });
        }
    }

    // Load primary ads (AdSense)
    function loadPrimaryAds() {
        if (!adConfig.adSense.enabled) return;

        // Create AdSense script
        const adsenseScript = document.createElement('script');
        adsenseScript.src = adConfig.adSense.scriptUrl;
        adsenseScript.async = true;
        adsenseScript.crossOrigin = 'anonymous';

        // Add AdSense initialization
        adsenseScript.onload = function() {
            window.adsbygoogle = window.adsbygoogle || [];
            window.adsbygoogle.push({
                google_ad_client: adConfig.adSense.client,
                enable_page_level_ads: true
            });

            adConfig.adsLoaded = true;
            loadAdPlacements();
        };

        adsenseScript.onerror = function() {
            console.log('AdSense failed to load, trying fallback');
            loadFallbackAds();
        };

        document.head.appendChild(adsenseScript);
    }

    // Load fallback ads (PropellerAds)
    function loadFallbackAds() {
        if (!adConfig.propellerads.enabled) return;

        const propellerScript = document.createElement('script');
        propellerScript.src = adConfig.propellerads.scriptUrl;
        propellerScript.async = true;

        propellerScript.onload = function() {
            // Initialize PropellerAds
            if (window.PropellerAds) {
                window.PropellerAds.push({
                    zoneId: adConfig.propellerads.zoneId,
                    containerId: 'propeller-ads-container'
                });
            }
            adConfig.adsLoaded = true;
            loadAdPlacements();
        };

        document.head.appendChild(propellerScript);
    }

    // Load ad placements
    function loadAdPlacements() {
        // Footer ad placement
        const footerAd = document.getElementById('ads-footer');
        if (footerAd) {
            if (adConfig.adsLoaded && !adConfig.adBlockerDetected) {
                // AdSense ad
                footerAd.innerHTML = `
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="${adConfig.adSense.client}"
                         data-ad-slot="${adConfig.adSlot}"
                         data-ad-format="auto"
                         data-full-width-responsive="true"></ins>
                    <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
                `;
            } else {
                // Fallback content or PropellerAds
                footerAd.innerHTML = `
                    <div id="propeller-ads-container" class="text-center py-4">
                        <div class="text-gray-500">
                            <p class="text-sm">Support QuickQRGen by disabling your ad blocker</p>
                            <p class="text-xs mt-1">We rely on ads to keep this service free</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    // Register service worker for PropellerAds
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Initialize ads and service worker when DOM is ready
    initAds();
    registerServiceWorker();

    // Expose ad config for debugging
    window.QuickQRGenAds = adConfig;
});
