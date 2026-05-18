/**
 * Smart Posting UTM Bridge Script
 * Propagates UTM parameters from URL to all links pointing to the bridge page.
 */
(function() {
    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function initUtmBridge() {
        const urlParams = new URLSearchParams(window.location.search);
        const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
        const foundUtms = {};
        
        utms.forEach(u => {
            const val = urlParams.get(u);
            if (val) foundUtms[u] = val;
        });

        // Bridge Facebook Pixel browser and click cookies
        try {
            const fbp = getCookie('_fbp');
            let fbc = getCookie('_fbc');
            const fbclid = urlParams.get('fbclid');
            
            if (!fbc && fbclid) {
                fbc = 'fb.1.' + Date.now() + '.' + fbclid;
            }
            
            if (fbp) foundUtms['fbp'] = fbp;
            if (fbc) foundUtms['fbc'] = fbc;
        } catch (cookieErr) {
            console.warn('[UTM Bridge] Cookie reading failed:', cookieErr);
        }
        
        if (Object.keys(foundUtms).length > 0) {
            console.log('[UTM Bridge] Found params:', foundUtms);
            
            // Target links: join links and internal links
            const links = document.querySelectorAll('a');
            
            links.forEach(link => {
                try {
                    const href = link.getAttribute('href');
                    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

                    const isJoinLink = href.includes('smart-posting.ru/join/');
                    const isInternalLink = href.startsWith('/') || 
                                         href.startsWith('./') || 
                                         href.includes(window.location.hostname) ||
                                         (!href.includes('://') && !href.startsWith('mailto:') && !href.startsWith('tel:'));

                    if (isJoinLink || isInternalLink) {
                        const url = new URL(link.href);
                        Object.keys(foundUtms).forEach(u => {
                            url.searchParams.set(u, foundUtms[u]);
                        });
                        link.href = url.toString();
                    }
                } catch(e) {
                    // console.warn('[UTM Bridge] Could not update link:', link.href, e);
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
