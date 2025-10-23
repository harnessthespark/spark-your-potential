# Spark Your Potential - Setup Instructions

**A powerful ability recognition tool from Harness the Spark**

This interactive HTML exercise helps clients discover their extraordinary abilities through guided reflection and pattern recognition.

---

## 📁 What's Included

Your "spark-your-potential" folder contains:

1. **ability-recognition-visual.html** - The main interactive exercise (UK English, SparkHub-branded)
2. **google-apps-script.js** - Google Sheets integration code
3. **google-sheets-integration.gs** - Alternative integration with detailed documentation
4. **HTS Icon_trans copy.jpeg** - Harness the Spark logo
5. **SETUP-INSTRUCTIONS.md** - This file

---

## 🚀 Quick Start (No Setup Required)

The simplest way to use this tool:

1. **Open the HTML file** in any web browser (Chrome, Safari, Firefox, Edge)
2. **Start using it immediately** - No installation needed!
3. **Auto-save works automatically** - Responses save to your browser's local storage
4. **Save locally** - Use "Save My Results" button to download a text file
5. **Email results** - Use "Email My Results" or "Send to Lisa" buttons

**Perfect for:** Quick personal use, testing the tool, single-user scenarios

---

## 📊 Google Sheets Integration (Optional)

Connect the tool to Google Sheets to collect and analyse multiple client responses automatically.

### Benefits:
- Automatically collect all client responses in one spreadsheet
- Analyse patterns across multiple clients
- No manual downloading or emailing needed
- Perfect for coaches working with multiple clients

### Setup Steps:

#### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"Blank"** to create a new spreadsheet
3. Name it: **"Spark Your Potential Responses"**
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   The ID is the long string between `/d/` and `/edit`

#### Step 2: Set Up the Script

1. In your Google Sheet, click **Extensions > Apps Script**
2. Delete any default code in the editor
3. Open the **google-apps-script.js** file from this folder
4. **Copy all the code** and **paste it** into the Apps Script editor
5. Click **💾 Save** (or press Cmd+S / Ctrl+S)

#### Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the **⚙️ settings icon** next to "Select type"
3. Choose **"Web app"**
4. Configure the deployment:
   - **Description:** "Spark Your Potential Form Handler"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone" ⚠️ (Required for form submissions)
5. Click **"Deploy"**
6. **Authorise the script** when prompted:
   - Click "Authorise access"
   - Choose your Google account
   - Click "Advanced" if you see a warning
   - Click "Go to [Project Name] (unsafe)" - this is your own script, it's safe
   - Click "Allow"
7. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/LONG_SCRIPT_ID_HERE/exec
   ```

#### Step 4: Connect to Your HTML File

1. Open **ability-recognition-visual.html** in a text editor (VS Code, Sublime, Notepad++)
2. Find **line 741** (search for `GOOGLE_SHEETS_URL`)
3. Replace `YOUR_SCRIPT_ID_HERE` with your complete Web App URL:
   ```javascript
   // Before:
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';

   // After:
   const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```
4. Save the file

#### Step 5: Test It!

1. Open **ability-recognition-visual.html** in your browser
2. Fill in at least the "Your name" field and one or two responses
3. Click **"Save to Google Sheets"**
4. Check your Google Sheet - you should see a new row with your data!
5. The first time it runs, it creates headers automatically

---

## 🎨 Customisation Options

### Change Lisa's Email Address

To send results to a different email:

1. Open **ability-recognition-visual.html** in a text editor
2. Search for: `lisa@harnessthespark.com`
3. Replace with your preferred email address
4. Save the file

### Change Brand Colours

Current colour scheme uses SparkHub's purple gradient. To customise:

1. Open **ability-recognition-visual.html** in a text editor
2. Search for the `<style>` section (around line 7-283)
3. Look for colour codes like `#667eea`, `#764ba2`, `#2c3e50`, etc.
4. Replace with your brand colours (use hex codes)
5. Save and refresh your browser

### Update the Logo

1. Replace **HTS Icon_trans copy.jpeg** with your logo image
2. Keep the same filename, or update line 289 in the HTML:
   ```html
   <img src="YOUR-LOGO-FILENAME.jpg" alt="Your Logo">
   ```

---

## 💡 How to Use with Clients

### Option 1: Send Directly to Clients

1. **Send the HTML file** via email or file-sharing service
2. **Instruct clients** to:
   - Download the file
   - Double-click to open in their browser
   - Complete the exercise
   - Click "Email My Results" to send back to you

### Option 2: Host on a Website

1. **Upload the HTML file** to your website hosting
2. **Share the URL** with clients (e.g., `yourwebsite.com/spark-potential.html`)
3. **Clients complete online** - no download needed
4. **Results auto-save** to your Google Sheet (if configured)

### Option 3: Integrate into SparkHub Platform

This tool can be integrated into the SparkHub platform as a React component:

1. Contact your developer to convert the HTML to a React component
2. Connect to SparkHub's Django backend for data persistence
3. Integrate with the Beautiful Brain Blueprint programme
4. Enable as part of the Spark Challenge or coaching pathway

---

## 🔧 Troubleshooting

### "Google Sheets Not Configured" Alert

**Solution:** Follow the Google Sheets Integration setup steps above, particularly Step 4 (updating line 741 in the HTML file).

### Nothing Saves to Google Sheets

**Check:**
- ✓ Web app is deployed with "Who has access: Anyone"
- ✓ You copied the complete Web App URL (including `https://` and `/exec`)
- ✓ The URL is correctly pasted on line 741
- ✓ You saved the HTML file after editing

**Test the script:**
1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Select the **testSetup** function from the dropdown
4. Click **Run**
5. Check the **Execution log** for success messages

### Button Clicks Don't Work

**Solution:** Make sure you're opening the HTML file in a modern browser (Chrome, Safari, Firefox, Edge). Internet Explorer is not supported.

### Auto-Save Not Working

**Solution:** Check that your browser allows localStorage. In private/incognito mode, localStorage might be disabled.

---

## 📧 Support

For questions or technical support:

- **Email:** lisa@harnessthespark.com
- **Website:** [harnessthespark.com](https://harnessthespark.com)
- **Platform:** [app.harnessthespark.ai](https://app.harnessthespark.ai)

---

## 🌟 What This Tool Does

**Spark Your Potential** helps clients discover abilities they've been underestimating through:

### 1. Evidence Collection
Gather concrete examples of client outcomes and successes

### 2. Instinct Radar
Interactive visualisation of intuitive abilities and pattern recognition

### 3. Effortless Ability Recognition
Identify skills that feel "too easy" to be valuable (but are actually powerful)

### 4. Transformation Mirror
Map client journeys from "before" to "after" states

### 5. Pattern Recognition
Connect the dots across multiple examples to reveal core abilities

### 6. Recognition Summary
Crystallise insights into actionable self-knowledge

---

## 🎯 Perfect For

- **Coaches** working with entrepreneurs and business owners
- **AuDHD-aware practitioners** supporting neuro-diverse clients
- **Self-reflection exercises** in 1:1 or group coaching
- **Spark Challenge participants** discovering their unique abilities
- **Beautiful Brain Blueprint users** in the Discovery phase
- **Anyone** who tends to underestimate what comes naturally to them

---

## 🔐 Privacy & Data

- **Local storage** keeps data in the user's browser only
- **Google Sheets** data is stored in your Google account (you control access)
- **No third-party tracking** or analytics
- **No data leaves the user's device** unless they click "Save to Google Sheets" or "Email"
- **GDPR compliant** when used with proper consent

---

## 📝 File Versions

If you have multiple versions of this tool, **use the one in the `spark-your-potential (2)` folder** - it has:

✅ UK English spelling throughout
✅ SparkHub brand alignment
✅ `lang="en-GB"` for proper localisation
✅ Google Sheets integration ready
✅ Professional meta tags
✅ Updated email configuration

---

## 🚀 Next Steps

1. ✅ **Try it yourself** - Open the HTML file and complete the exercise
2. ✅ **Set up Google Sheets** (optional) - Follow the integration steps above
3. ✅ **Customise branding** (optional) - Update colours and logo to match your brand
4. ✅ **Test with a friend** - Make sure everything works before sending to clients
5. ✅ **Share with clients** - Email, host online, or integrate into your platform

---

**Built with ❤️ by Harness the Spark**
*Helping neuro-diverse entrepreneurs discover their extraordinary abilities*
