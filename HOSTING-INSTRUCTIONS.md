# Hosting Instructions for Spark Your Potential

## Quick Local Server (For Testing AI Features)

### Option 1: Python (Easiest)

```bash
cd "/Users/lisagills/spark-your-potential "
python3 -m http.server 8000
```

Then open: `http://localhost:8000/ability-recognition-visual.html`

### Option 2: PHP

```bash
cd "/Users/lisagills/spark-your-potential "
php -S localhost:8000
```

Then open: `http://localhost:8000/ability-recognition-visual.html`

### Option 3: Node.js (npx http-server)

```bash
cd "/Users/lisagills/spark-your-potential "
npx http-server -p 8000
```

Then open: `http://localhost:8000/ability-recognition-visual.html`

---

## Production Hosting Options

### Option A: Upload to Your Website

1. **Upload these files via FTP/SFTP:**
   - `ability-recognition-visual.html`
   - `HTS Icon_trans copy.jpeg`
   - `google-apps-script.js` (reference only)
   - `google-sheets-integration.gs` (reference only)

2. **Access at:**
   - `https://yourwebsite.com/spark-your-potential.html`

### Option B: DigitalOcean App Platform (Recommended)

Since you already use DigitalOcean:

1. Create a new static site app
2. Upload the HTML file and logo
3. Set domain: `spark-tool.harnessthespark.ai`

### Option C: Netlify (Free & Easy)

1. Drag and drop the folder to Netlify.com
2. Get instant URL: `spark-potential.netlify.app`
3. Optional: Add custom domain

### Option D: Integrate into SparkHub

Move this into your existing SparkHub platform:
- Frontend: `neurospark-fe/public/spark-your-potential.html`
- Or convert to React component for full integration

---

## Important Notes

### ✅ What Works from Local Files:
- All form fields and text inputs
- Auto-save to localStorage
- Google Sheets integration
- Instinct Radar visualization
- Download/Email results
- All styling and layout

### ⚠️ What Requires Server Hosting:
- AI analysis buttons (Claude API calls blocked by CORS on file://)
- "Help Me See Patterns with AI"
- "Reveal My Unlock Pattern with AI"

### 🔑 For AI Features to Work:

You need to add your Anthropic API key. Currently the API calls will fail without authentication.

**To enable AI features:**

1. Get API key from: https://console.anthropic.com/
2. Add to the HTML file around line 1540
3. Or proxy through SparkHub backend (more secure)

---

## Current Status

**✅ Ready to host:**
- File is complete and functional
- Shadcn/ui styling applied
- All sections enhanced with icons
- Google Sheets integration configured
- UK English throughout
- Mobile responsive

**📊 Google Sheets:**
- Already connected to your Web App
- Will work immediately once hosted
- No additional configuration needed

**🎨 Branding:**
- Harness the Spark logo included
- SparkHub purple theme
- Professional appearance

---

## Recommended Next Steps

1. **Test locally first:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Verify AI buttons work** (if you add API key)

3. **Test Google Sheets submission**

4. **Deploy to production:**
   - Upload to your website
   - Or integrate into SparkHub

5. **Share with client** via the hosted URL

---

## Client Access

Once hosted, clients can:
- Access via direct URL
- Complete on any device (mobile-friendly)
- Responses auto-save as they type
- Submit to your Google Sheet
- Download/email their results

No login required, no account needed - just a simple, powerful tool!
