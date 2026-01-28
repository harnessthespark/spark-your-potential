/**
 * Shared utilities for Spark Your Potential tools
 * - Preview mode (shows blank tool when ?preview=true)
 * - Download/Print functionality
 */

const ToolUtils = {
    // Check if in preview mode
    isPreviewMode: function() {
        const params = new URLSearchParams(window.location.search);
        return params.get('preview') === 'true';
    },

    // Initialize preview mode - call this early in your script
    initPreviewMode: function() {
        if (this.isPreviewMode()) {
            // Add preview banner
            const banner = document.createElement('div');
            banner.id = 'preview-banner';
            banner.innerHTML = `
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; text-align: center; font-family: 'Inter', sans-serif; position: fixed; top: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                    <span style="font-weight: 600;">📋 Preview Mode</span>
                    <span style="margin-left: 15px; opacity: 0.9;">This is a blank preview - no data will be saved</span>
                    <button onclick="ToolUtils.downloadPDF()" style="margin-left: 20px; background: white; color: #667eea; border: none; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer;">
                        📥 Download PDF
                    </button>
                    <button onclick="window.print()" style="margin-left: 10px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer;">
                        🖨️ Print
                    </button>
                </div>
            `;
            document.body.insertBefore(banner, document.body.firstChild);
            document.body.style.paddingTop = '60px';

            // Add print styles
            const printStyles = document.createElement('style');
            printStyles.textContent = `
                @media print {
                    #preview-banner { display: none !important; }
                    body { padding-top: 0 !important; }
                    .nav-tabs, .save-indicator, .data-source, .back-btn { display: none !important; }
                    .section-card { display: block !important; page-break-inside: avoid; margin-bottom: 20px; }
                    body { background: white !important; }
                    .container { max-width: 100% !important; }
                }
            `;
            document.head.appendChild(printStyles);

            return true;
        }
        return false;
    },

    // Skip loading saved data in preview mode
    shouldLoadData: function() {
        return !this.isPreviewMode();
    },

    // Download as PDF using html2pdf library
    downloadPDF: function() {
        // Hide preview banner temporarily
        const banner = document.getElementById('preview-banner');
        if (banner) banner.style.display = 'none';

        // Get page title for filename
        const title = document.title.split(' - ')[0].replace(/[^a-zA-Z0-9]/g, '_') || 'tool';

        // Check if html2pdf is available
        if (typeof html2pdf !== 'undefined') {
            const element = document.querySelector('.container') || document.body;
            const opt = {
                margin: 10,
                filename: title + '.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                if (banner) banner.style.display = 'block';
            });
        } else {
            // Fallback to print
            window.print();
            if (banner) banner.style.display = 'block';
        }
    },

    // Add download button to non-preview pages
    addDownloadButton: function(containerId) {
        if (this.isPreviewMode()) return; // Already has buttons in banner

        const container = document.getElementById(containerId) || document.querySelector('.header');
        if (!container) return;

        const btn = document.createElement('button');
        btn.innerHTML = '📥 Download PDF';
        btn.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 25px; font-weight: 600; cursor: pointer; margin-top: 15px;';
        btn.onclick = () => this.downloadPDF();
        container.appendChild(btn);
    }
};

// Auto-load html2pdf library if not present
(function() {
    if (typeof html2pdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        document.head.appendChild(script);
    }
})();
