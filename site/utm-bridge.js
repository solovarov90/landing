/**
 * Smart Posting UTM Bridge Script
 * Propagates UTM parameters from URL to all links pointing to the bridge page.
 */
(function() {
    function initUtmBridge() {
        const urlParams = new URLSearchParams(window.location.search);
        const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const foundUtms = {};
        
        utms.forEach(u => {
            const val = urlParams.get(u);
            if (val) foundUtms[u] = val;
        });
        
        if (Object.keys(foundUtms).length > 0) {
            console.log('[UTM Bridge] Found params:', foundUtms);
            // Target all links that go to our join links
            const links = document.querySelectorAll('a[href*="smart-posting.ru/join/"]');
            
            links.forEach(link => {
                try {
                    const url = new URL(link.href);
                    Object.keys(foundUtms).forEach(u => {
                        url.searchParams.set(u, foundUtms[u]);
                    });
                    link.href = url.toString();
                } catch(e) {
                    console.warn('[UTM Bridge] Could not update link:', link.href, e);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUtmBridge);
    } else {
        initUtmBridge();
    }
})();
