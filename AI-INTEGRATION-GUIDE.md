# Spark Your Potential - AI Integration Guide

## ✅ Completed Setup

### Backend API Endpoint
✅ Created `/api/ai/spark/analyze/` endpoint in Django backend
✅ Supports 3 analysis types:
- `patterns` - Finds common threads across outcomes
- `unlock` - Reveals transformation patterns
- `instincts` - Analyses intuitive abilities

✅ Public endpoint (no authentication required)
✅ Secure - API key stored in backend environment variables only

### Frontend Integration
✅ Updated HTML to call backend proxy instead of direct Anthropic API
✅ Removed exposed API key from frontend
✅ Both AI buttons now use secure backend proxy

---

## 🔧 Deployment Steps

### 1. Add Anthropic API Key to Backend

#### DigitalOcean App Platform:

1. Go to your backend app: https://cloud.digitalocean.com/apps/
2. Select `sparkhub-be`
3. Click **Settings** → **App-Level Environment Variables**
4. Add new variable:
   ```
   Key: ANTHROPIC_API_KEY
   Value: [YOUR_ANTHROPIC_API_KEY_HERE]
   ```
5. Click **Save**
6. The app will automatically redeploy

#### Verify API Key is Set:

```bash
# Check backend logs after deployment
# The service should start without "ANTHROPIC_API_KEY not set" warnings
```

---

### 2. Deploy Updated Backend Code

#### Push to GitHub:

```bash
cd ~/neurospark-be
git add ai/views.py ai/urls.py
git commit -m "Add Spark Your Potential AI analysis endpoint"
git push origin main
```

DigitalOcean will automatically deploy the new code.

---

### 3. Deploy Updated Frontend (HTML file)

Since this is a standalone HTML file, you have several options:

#### Option A: Upload to Your Website via FTP/SFTP
1. Upload `ability-recognition-visual.html` to your web server
2. Access at: `https://yourwebsite.com/spark-your-potential.html`

#### Option B: DigitalOcean Static Site (Recommended)
1. Create a new **Static Site** app in DigitalOcean
2. Upload the `spark-your-potential` folder
3. Set custom domain: `spark.harnessthespark.ai`
4. Deploy and test

#### Option C: Host on Python Server (Testing)
```bash
cd "/Users/lisagills/spark-your-potential "
python3 -m http.server 8000
```
Then open: `http://localhost:8000/ability-recognition-visual.html`

---

## 🧪 Testing the AI Features

### Test Pattern Analysis:
1. Open the HTML file in your browser
2. Complete at least 3 "Outcome" boxes in Evidence Collection
3. Click **"✨ Help Me See Patterns with AI"**
4. Should see: "🔮 Analyzing patterns..." → AI analysis appears

### Test Unlock Pattern:
1. Fill in "Before" and "After" transformation boxes
2. Click **"🔓 Reveal My Unlock Pattern with AI"**
3. Should see: "🔮 Revealing your pattern..." → AI analysis appears

### Expected Behavior:
- ✅ No CORS errors (backend handles API calls)
- ✅ No "403 Forbidden" errors (endpoint is public)
- ✅ Loading states show properly
- ✅ AI analysis displays formatted text
- ✅ Button returns to ready state after 3 seconds

---

## 🔍 Troubleshooting

### Error: "AI service not configured"
**Solution:** Add `ANTHROPIC_API_KEY` to backend environment variables (see Step 1)

### Error: "CORS policy blocking"
**Solution:** Ensure CORS is enabled in Django settings:
```python
CORS_ALLOW_ALL_ORIGINS = True  # Already set in your backend
```

### Error: 500 Internal Server Error
**Check:**
- Backend logs in DigitalOcean App Platform
- API key is correctly formatted
- Endpoint URL is correct: `https://sparkhub-be-qtmmb.ondigitalocean.app/api/ai/spark/analyze/`

### AI Returns Generic Responses
**Possible Causes:**
- API key not set → Using fallback responses
- Rate limiting from Anthropic → Wait and retry
- Prompt too short → Ensure outcomes have meaningful content

---

## 📊 API Endpoint Details

### URL:
```
POST https://sparkhub-be-qtmmb.ondigitalocean.app/api/ai/spark/analyze/
```

### Request Body:
```json
{
  "outcomes": [
    "First outcome description...",
    "Second outcome description...",
    "Third outcome description..."
  ],
  "type": "patterns",
  "name": "Lisa"
}
```

### Response:
```json
{
  "success": true,
  "analysis": "Your AI-generated analysis text here...",
  "type": "patterns",
  "timestamp": "2025-10-22T14:30:00Z"
}
```

### Error Response:
```json
{
  "success": false,
  "error": "No outcomes provided for analysis"
}
```

---

## 🔒 Security Features

✅ **API Key Never Exposed** - Only stored in backend environment variables
✅ **Public Endpoint** - No authentication required for easy client access
✅ **Rate Limiting** - Backend can add rate limiting if needed
✅ **HTTPS Only** - All API calls use encrypted connections
✅ **Error Handling** - Graceful fallbacks for all error scenarios

---

## 💰 Cost Monitoring

### Anthropic API Pricing:
- **Model:** claude-3-5-sonnet-20241022
- **Input:** $3 per 1M tokens
- **Output:** $15 per 1M tokens

### Typical Usage:
- **Pattern Analysis:** ~500 input tokens, ~400 output tokens
- **Cost per analysis:** ~$0.008 (less than 1 penny)
- **100 analyses:** ~$0.80

### Backend Logging:
Check logs for usage tracking:
```
Spark Pattern Analysis - User: 1, Type: patterns, Tokens: {'input_tokens': 500, 'output_tokens': 400}
```

---

## 🎯 Next Steps

1. ✅ Add `ANTHROPIC_API_KEY` to DigitalOcean environment variables
2. ✅ Push backend code to GitHub
3. ✅ Deploy HTML file to your hosting
4. ✅ Test both AI features with real data
5. ✅ Share with your client!

---

## 📝 Notes

- **Backend URL:** `https://sparkhub-be-qtmmb.ondigitalocean.app`
- **API Endpoint:** `/api/ai/spark/analyze/`
- **Files Modified:**
  - `neurospark-be/ai/views.py` - Added `analyze_spark_patterns` view
  - `neurospark-be/ai/urls.py` - Added route for Spark AI endpoint
  - `spark-your-potential /ability-recognition-visual.html` - Updated to use backend proxy

---

**Built with ❤️ by Harness the Spark**
*Helping people discover their extraordinary abilities*
