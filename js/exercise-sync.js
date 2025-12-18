/**
 * SparkHub Exercise Auto-Save Utility
 * Syncs exercise data to PostgreSQL with localStorage fallback.
 *
 * Usage:
 *   const sync = new ExerciseSync('energy');
 *   await sync.load();  // Load data from PostgreSQL
 *   sync.save(data);    // Auto-save to PostgreSQL
 */

const API_BASE = 'https://sparkhub-be-qtmmb.ondigitalocean.app';

class ExerciseSync {
    constructor(exerciseType) {
        this.exerciseType = exerciseType;
        this.localStorageKey = `audhd_${exerciseType}`;
        this.saveTimeout = null;
        this.lastSaveTime = 0;
    }

    /**
     * Get auth token from localStorage
     */
    getAuthToken() {
        return localStorage.getItem('syp_token');
    }

    /**
     * Load exercise data from PostgreSQL (with localStorage fallback)
     * @returns {Object} The exercise data
     */
    async load() {
        const token = this.getAuthToken();

        // Try PostgreSQL first
        if (token) {
            try {
                const response = await fetch(`${API_BASE}/api/crm/syp/exercises/${this.exerciseType}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data || {};

                    // Update localStorage cache
                    localStorage.setItem(this.localStorageKey, JSON.stringify(data));
                    console.log(`✅ ${this.exerciseType} loaded from PostgreSQL`);
                    return { data, source: 'postgresql' };
                }
            } catch (error) {
                console.log(`⚠️ PostgreSQL unavailable for ${this.exerciseType}:`, error.message);
            }
        }

        // Fallback to localStorage
        const cached = localStorage.getItem(this.localStorageKey);
        if (cached) {
            console.log(`📦 ${this.exerciseType} loaded from localStorage cache`);
            return { data: JSON.parse(cached), source: 'localStorage' };
        }

        return { data: {}, source: 'empty' };
    }

    /**
     * Save exercise data to PostgreSQL (with localStorage backup)
     * Debounced to prevent excessive API calls
     * @param {Object} data - The exercise data to save
     */
    save(data) {
        // Always save to localStorage immediately
        localStorage.setItem(this.localStorageKey, JSON.stringify(data));

        // Debounce PostgreSQL saves (wait 1 second after last change)
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => this._saveToPostgres(data), 1000);
    }

    /**
     * Force immediate save to PostgreSQL (no debounce)
     * @param {Object} data - The exercise data to save
     */
    async saveNow(data) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(data));
        return await this._saveToPostgres(data);
    }

    /**
     * Internal: Save to PostgreSQL
     */
    async _saveToPostgres(data) {
        const token = this.getAuthToken();
        if (!token) {
            console.log(`💾 ${this.exerciseType} saved locally (no auth token)`);
            return { success: false, source: 'localStorage' };
        }

        try {
            const response = await fetch(`${API_BASE}/api/crm/syp/exercises/${this.exerciseType}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data })
            });

            if (response.ok) {
                console.log(`✅ ${this.exerciseType} saved to PostgreSQL`);
                this.lastSaveTime = Date.now();
                return { success: true, source: 'postgresql' };
            }
        } catch (error) {
            console.log(`⚠️ PostgreSQL save failed for ${this.exerciseType}:`, error.message);
        }

        return { success: false, source: 'localStorage' };
    }

    /**
     * Show save confirmation in UI
     * @param {HTMLElement} element - Button or element to update
     * @param {string} message - Success message
     */
    showSaveConfirmation(element, message = '✅ Saved!') {
        if (!element) return;

        const originalText = element.innerHTML;
        const originalBg = element.style.background;

        element.innerHTML = message;
        element.style.background = '#16a34a';

        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.background = originalBg || '';
        }, 2000);
    }
}

// Export for use in HTML files
window.ExerciseSync = ExerciseSync;
