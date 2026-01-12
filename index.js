<!DOCTYPE html>
<html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Join the SparkHub Beta | Organise Your Beautiful Brain</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            <style>
                * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

                :root {
                --gradient-start: #8B5CF6;
                --gradient-mid: #A855F7;
                --gradient-end: #EC4899;
                --yellow-accent: #FACC15;
                --white: #FFFFFF;
                --dark: #1F1F1F;
            }

                body {
                font-family: 'Plus Jakarta Sans', sans-serif;
                min-height: 100vh;
                background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-mid) 50%, var(--gradient-end) 100%);
                color: var(--white);
                overflow-x: hidden;
            }

                .container {
                max-width: 680px;
                margin: 0 auto;
                padding: 3rem 1.5rem;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

                /* Animated background elements */
                .bg-shapes {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
                z-index: 0;
            }

                .shape {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.05);
                animation: float 20s infinite ease-in-out;
            }

                .shape:nth-child(1) {
                width: 400px;
                height: 400px;
                top: -100px;
                right: -100px;
                animation-delay: 0s;
            }

                .shape:nth-child(2) {
                width: 300px;
                height: 300px;
                bottom: -50px;
                left: -100px;
                animation-delay: -5s;
            }

                .shape:nth-child(3) {
                width: 200px;
                height: 200px;
                top: 50%;
                left: 10%;
                animation-delay: -10s;
            }

                @keyframes float {
                0%, 100% { transform: translate(0, 0) scale(1); }
                33% { transform: translate(30px, -30px) scale(1.05); }
                66% { transform: translate(-20px, 20px) scale(0.95); }
            }

                .content {
                position: relative;
                z-index: 1;
            }

                /* Logo */
                .logo {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 2.5rem;
                animation: fadeInDown 0.6s ease-out;
            }

                .logo-icon {
                width: 48px;
                height: 48px;
                background: var(--white);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

                .logo-text {
                font-size: 1.5rem;
                font-weight: 800;
                letter-spacing: -0.02em;
            }

                /* Hero */
                .hero-badge {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                padding: 0.5rem 1rem;
                border-radius: 100px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                animation: fadeInUp 0.6s ease-out 0.1s both;
            }

                .badge-dot {
                width: 8px;
                height: 8px;
                background: #4ADE80;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

                @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

                h1 {
                font-size: clamp(2.25rem, 6vw, 3.5rem);
                font-weight: 800;
                line-height: 1.1;
                letter-spacing: -0.03em;
                margin-bottom: 1.25rem;
                animation: fadeInUp 0.6s ease-out 0.2s both;
            }

                .highlight {
                color: var(--yellow-accent);
            }

                .subtitle {
                font-size: 1.125rem;
                line-height: 1.6;
                opacity: 0.9;
                margin-bottom: 2.5rem;
                animation: fadeInUp 0.6s ease-out 0.3s both;
            }

                /* Thinking Modes */
                .modes {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
                margin-bottom: 2.5rem;
                animation: fadeInUp 0.6s ease-out 0.4s both;
            }

                .mode-tag {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                padding: 0.625rem 1rem;
                border-radius: 100px;
                font-size: 0.875rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: all 0.3s ease;
            }

                .mode-tag:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateY(-3px);
            }

                /* Form */
                .signup-form {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 20px;
                padding: 2rem;
                animation: fadeInUp 0.6s ease-out 0.5s both;
            }

                .form-title {
                font-size: 1.25rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
            }

                .input-group {
                margin-bottom: 1rem;
            }

                .input-group label {
                display: block;
                font-size: 0.875rem;
                font-weight: 500;
                margin-bottom: 0.5rem;
                opacity: 0.9;
            }

                .input-group input,
                .input-group select {
                width: 100%;
                padding: 0.875rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: var(--white);
                font-family: inherit;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

                .input-group input::placeholder {
                color: rgba(255, 255, 255, 0.5);
            }

                .input-group input:focus,
                .input-group select:focus {
                outline: none;
                border-color: var(--yellow-accent);
                background: rgba(255, 255, 255, 0.15);
            }

                .input-group select option {
                background: var(--gradient-mid);
                color: var(--white);
            }

                .submit-btn {
                width: 100%;
                padding: 1rem 2rem;
                background: var(--pink-accent);
                color: var(--dark);
                font-family: inherit;
                font-size: 1rem;
                font-weight: 700;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 0.5rem;
            }

                .submit-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(250, 204, 21, 0.3);
            }

                .submit-btn:active {
                transform: translateY(0);
            }

                /* What you get */
                .benefits {
                margin-top: 2.5rem;
                animation: fadeInUp 0.6s ease-out 0.6s both;
            }

                .benefits-title {
                font-size: 0.875rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                opacity: 0.7;
                margin-bottom: 1rem;
            }

                .benefit-list {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

                .benefit-item {
                display: flex;
                align-items: flex-start;
                gap: 0.75rem;
                font-size: 0.9375rem;
                line-height: 1.5;
            }

                .benefit-icon {
                width: 24px;
                height: 24px;
                background: rgba(74, 222, 128, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                margin-top: 2px;
            }

                .benefit-icon svg {
                width: 14px;
                height: 14px;
                color: #4ADE80;
            }

                /* Footer */
                .footer {
                margin-top: 3rem;
                padding-top: 2rem;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                gap: 1rem;
                animation: fadeInUp 0.6s ease-out 0.7s both;
            }

                .founder-img {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                overflow: hidden;
            }

                .founder-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

                .founder-info {
                flex: 1;
            }

                .founder-name {
                font-weight: 700;
                margin-bottom: 0.25rem;
            }

                .founder-title {
                font-size: 0.875rem;
                opacity: 0.8;
            }

                /* Animations */
                @keyframes fadeInDown {
                from {
                opacity: 0;
                transform: translateY(-20px);
            }
                to {
                opacity: 1;
                transform: translateY(0);
            }
            }

                @keyframes fadeInUp {
                from {
                opacity: 0;
                transform: translateY(20px);
            }
                to {
                opacity: 1;
                transform: translateY(0);
            }
            }

                /* Success state */
                .success-message {
                display: none;
                text-align: center;
                padding: 2rem;
            }

                .success-message.show {
                display: block;
            }

                .success-icon {
                width: 64px;
                height: 64px;
                background: rgba(74, 222, 128, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 1.5rem;
            }

                .success-icon svg {
                width: 32px;
                height: 32px;
                color: #4ADE80;
            }

                .form-content.hidden {
                display: none;
            }

                /* Responsive */
                @media (max-width: 480px) {
                .container {
                padding: 2rem 1rem;
            }

                .signup-form {
                padding: 1.5rem;
            }

                .modes {
                gap: 0.5rem;
            }

                .mode-tag {
                padding: 0.5rem 0.75rem;
                font-size: 0.8125rem;
            }
            }
            </style>
        </head>
        <body>
        <div class="bg-shapes">
            <div class="shape"></div>
            <div class="shape"></div>
            <div class="shape"></div>
        </div>

        <div class="container">
            <div class="content">
                <div class="logo">
                    <div class="logo-icon">⚡</div>
                    <span class="logo-text">SparkHub</span>
                </div>

                <div class="hero-badge">
                    <span class="badge-dot"></span>
                    Beta now open
                </div>

                <h1>Organise your <span class="highlight">beautiful brain</span></h1>

                <p class="subtitle">
                    The first productivity platform designed for how neurodivergent minds actually work.
                    Stop fighting tools built for someone else's brain.
                </p>

                <div class="modes">
                    <span class="mode-tag">⚡ High Energy</span>
                    <span class="mode-tag">🔍 Detail-Focused</span>
                    <span class="mode-tag">🔄 Hybrid</span>
                    <span class="mode-tag">⚖️ Standard</span>
                </div>

                <div class="signup-form">
                    <div class="form-content">
                        <h2 class="form-title">Join the beta</h2>

                        <form id="betaForm">
                            <div class="input-group">
                                <label for="name">Your name</label>
                                <input type="text" id="name" name="name" placeholder="First name" required>
                            </div>

                            <div class="input-group">
                                <label for="email">Email address</label>
                                <input type="email" id="email" name="email" placeholder="you@example.com" required>
                            </div>

                            <div class="input-group">
                                <label for="role">What best describes you?</label>
                                <select id="role" name="role" required>
                                    <option value="">Select one...</option>
                                    <option value="entrepreneur">Entrepreneur / Founder</option>
                                    <option value="freelancer">Freelancer / Self-employed</option>
                                    <option value="employee">Employee (ND professional)</option>
                                    <option value="coach">Coach / Consultant</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <button type="submit" class="submit-btn">Get early access →</button>
                        </form>
                    </div>

                    <div class="success-message" id="successMessage">
                        <div class="success-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 class="form-title">You're on the list! 🎉</h2>
                        <p style="opacity: 0.9;">Check your inbox for next steps. Welcome to SparkHub.</p>
                    </div>
                </div>

                <div class="benefits">
                    <h3 class="benefits-title">What you'll get</h3>
                    <div class="benefit-list">
                        <div class="benefit-item">
                            <div class="benefit-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span>Early access to the full platform — productivity, learning & community in one place</span>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span>Direct input into features that actually help (your feedback shapes the product)</span>
                        </div>
                        <div class="benefit-item">
                            <div class="benefit-icon">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <span>Connection with other ND professionals who get it</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="founder-img">
                        <!-- Placeholder for founder image -->
                        <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #a855f7, #ec4899); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">L</div>
                    </div>
                    <div class="founder-info">
                        <div class="founder-name">Lisa Gills</div>
                        <div class="founder-title">AuDHD Founder • 13 years in advertising</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            document.getElementById('betaForm').addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value
        };

            console.log('Beta signup:', formData);

            // Show success message
            document.querySelector('.form-content').classList.add('hidden');
            document.getElementById('successMessage').classList.add('show');

            // Here you would normally send to your backend
            // fetch('/api/beta-signup', { method: 'POST', body: JSON.stringify(formData) })
        });
        </script>
        </body>
    </html>