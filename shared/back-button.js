/**
 * Shared back button functionality for all client tool pages
 * Include this script and call initBackButton() to add a back button
 */

// Smart navigation back to correct portal
function goBackToPortal() {
    const savedUser = localStorage.getItem('syp_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            const access = user.programme_access || user.programme_type || 'career';
            if (access === 'audhd') {
                window.location.href = getBasePath() + 'audhd-dashboard.html';
            } else {
                window.location.href = getBasePath() + 'client-portal.html';
            }
            return;
        } catch(e) {}
    }
    window.location.href = getBasePath() + 'client-portal.html';
}

// Calculate base path (handles files in subfolders)
function getBasePath() {
    const path = window.location.pathname;
    const depth = (path.match(/\//g) || []).length - 1;
    if (depth <= 1) return '';
    return '../'.repeat(depth - 1);
}

// Inject back button into page header
function initBackButton() {
    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
        .back-btn {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255,255,255,0.2);
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
            font-family: inherit;
            transition: all 0.3s ease;
            z-index: 100;
        }
        .back-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        .header, .hero, [class*="header"] {
            position: relative;
        }
    `;
    document.head.appendChild(style);

    // Find header and add button
    const header = document.querySelector('.header, .hero, [class*="header"]');
    if (header) {
        // Check if button already exists
        if (!header.querySelector('.back-btn')) {
            const btn = document.createElement('button');
            btn.className = 'back-btn';
            btn.textContent = '← Back to Portal';
            btn.onclick = goBackToPortal;
            header.insertBefore(btn, header.firstChild);
        }
    }
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackButton);
} else {
    initBackButton();
}
