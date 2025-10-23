# Deploy Spark Your Potential to DigitalOcean

## ✅ What's Included

**Complete standalone app with built-in AI:**
- ✅ Node.js Express server (`server.js`)
- ✅ AI analysis endpoint (`/api/analyze`)
- ✅ Static HTML serving
- ✅ Secure API key handling (environment variables)
- ✅ Ready for DigitalOcean App Platform

---

## 🚀 Deployment Steps

### 1. Create GitHub Repository

```bash
cd "/Users/lisagills/spark-your-potential "

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Spark Your Potential standalone app with AI"

# Create repo on GitHub: https://github.com/new
# Name: spark-your-potential

# Add remote and push
git remote add origin https://github.com/harnessthespark/spark-your-potential.git
git branch -M main
git push -u origin main
```

### 2. Deploy to DigitalOcean

#### Option A: Automatic Deploy (Recommended)

1. Go to: https://cloud.digitalocean.com/apps/new
2. Choose **GitHub** as source
3. Select repository: `harnessthespark/spark-your-potential`
4. Branch: `main`
5. Auto-deploy: **ON**
6. Click **Next**

#### App Configuration:
- **Name:** `spark-your-potential`
- **Region:** London (lon1)
- **Plan:** Basic ($5/month)
- **Environment:** Node.js

#### Environment Variables:
Click **"Edit"** next to environment variables and add:
```
Key: ANTHROPIC_API_KEY
Value: [YOUR_ANTHROPIC_API_KEY_HERE]
Type: Secret
```

7. Click **Create Resources**
8. Wait 3-5 minutes for deployment

#### Option B: Manual Upload

1. Go to: https://cloud.digitalocean.com/apps/new
2. Choose **Upload your source code**
3. Upload entire `spark-your-potential` folder as ZIP
4. Follow same configuration as Option A

---

## 🧪 Testing After Deployment

### Check Health Endpoint:
```bash
curl https://spark-your-potential-xxxxx.ondigitalocean.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "aiConfigured": true
}
```

### Test the App:
1. Open: `https://spark-your-potential-xxxxx.ondigitalocean.app/`
2. Fill in 3+ outcomes
3. Click **"✨ Help Me See Patterns with AI"**
4. Should see AI analysis appear

---

## 🌐 Custom Domain (Optional)

### Add Your Domain:

1. In DigitalOcean Apps, click your app
2. Go to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `spark.harnessthespark.ai`
5. Add CNAME record to your DNS:
   ```
   Type: CNAME
   Name: spark
   Value: spark-your-potential-xxxxx.ondigitalocean.app
   ```
6. Wait for SSL certificate (automatic, ~5 minutes)

---

## 📁 File Structure

```
spark-your-potential/
├── ability-recognition-visual.html   # Main HTML file
├── server.js                         # Express server with AI endpoint
├── package.json                      # Node.js dependencies
├── HTS Icon_trans copy.jpeg          # Logo
├── google-apps-script.js             # Google Sheets integration
├── .gitignore                        # Git ignore file
├── .do/
│   └── app.yaml                      # DigitalOcean config
├── DIGITALOCEAN-DEPLOY.md            # This file
├── HOSTING-INSTRUCTIONS.md           # Alternative hosting options
└── SETUP-INSTRUCTIONS.md             # Original setup guide
```

---

## 🔧 Local Testing

Test locally before deploying:

```bash
cd "/Users/lisagills/spark-your-potential "

# Install dependencies
npm install

# Set API key (temporary)
export ANTHROPIC_API_KEY="[YOUR_ANTHROPIC_API_KEY_HERE]"

# Start server
npm start
```

Open: `http://localhost:8080`

---

## 🔍 Troubleshooting

### Error: "AI service not configured"
**Solution:** Add `ANTHROPIC_API_KEY` to DigitalOcean environment variables

### Error: "Cannot find module 'express'"
**Solution:** Ensure `package.json` exists and DigitalOcean runs `npm install`

### App won't start
**Check logs:**
1. DigitalOcean Apps → Your app
2. Click **Runtime Logs**
3. Look for error messages

### AI analysis returns errors
**Check:**
- Environment variable is set correctly
- No extra spaces in API key
- API key is valid (test at console.anthropic.com)

---

## 💰 Cost Breakdown

### DigitalOcean:
- **App Platform:** $5/month (Basic plan)
- **Bandwidth:** Included
- **SSL Certificate:** Free

### Anthropic API:
- **Model:** claude-3-5-sonnet-20241022
- **Per analysis:** ~$0.008 (less than 1 penny)
- **100 analyses:** ~$0.80
- **1000 analyses:** ~$8.00

**Total estimated monthly cost:** ~$6-15 depending on usage

---

## 📊 Monitoring

### View Logs:
DigitalOcean Apps → Your app → **Runtime Logs**

Look for:
```
✅ Spark Your Potential server running on port 8080
🤖 AI Analysis: ENABLED
AI Analysis - Type: patterns, Tokens: {"input_tokens":500,"output_tokens":400}
```

### Check Usage:
Monitor AI usage in logs to track costs

---

## 🔄 Updates

### Push updates to GitHub:
```bash
cd "/Users/lisagills/spark-your-potential "
git add .
git commit -m "Update description"
git push
```

DigitalOcean will automatically redeploy!

---

## 🔒 Security

✅ **API Key Never Exposed** - Stored in environment variables only
✅ **HTTPS Only** - Automatic SSL certificate
✅ **No Authentication** - Public tool for clients (intentional)
✅ **Rate Limiting** - Can add if needed

---

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Deploy to DigitalOcean App Platform
3. ✅ Add `ANTHROPIC_API_KEY` environment variable
4. ✅ Test both AI features
5. ✅ (Optional) Add custom domain
6. ✅ Share with your client!

---

**Built with ❤️ by Harness the Spark**
*Helping people discover their extraordinary abilities*
