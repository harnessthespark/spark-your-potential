# Spark Your Potential - Coach Quick Reference

**Quick reference for Lisa when using this tool with clients**

---

## 🔗 Essential Links

**Client Access:** https://potential.harnessthespark.com/
**Health Check:** https://potential.harnessthespark.com/health
**DigitalOcean App:** https://cloud.digitalocean.com/apps

---

## 📊 Where Client Data Goes

### **Google Sheets Integration:**
- **Status:** ✅ Configured and ready
- **Script ID:** AKfycbwv7qIXwqxjLgIAsenTiRZC6fDoi50vf9zqq8O7KoiRTn_zVMq6s-y0cawDNLDOcww
- **Find your spreadsheet:** https://script.google.com/home → Find this script ID → Check connected sheet
- **What saves:** All client responses from all 5 sections + recognition summary

### **Client Emails:**
- Default recipient: `lisa@harnessthespark.com`
- Clients can email results to themselves or you
- Plain text format with all responses

---

## 🤖 AI Features

### **Pattern Analysis Button**
- **Trigger:** Client fills 3+ outcome boxes → clicks "Help Me See Patterns with AI"
- **What it does:** Claude analyses outcomes to reveal core ability threads
- **Cost:** ~$0.008 per analysis (less than 1 penny)
- **Prompts Claude to identify:**
  - The core ability running through all examples
  - What makes this ability special/valuable
  - How it creates transformation

### **Unlock Pattern Button**
- **Trigger:** Client fills "Before" and "After" → clicks "Reveal My Unlock Pattern with AI"
- **What it does:** Claude identifies their unique transformation pattern
- **Prompts Claude to show:**
  - The specific transformation they create
  - What makes their approach unique
  - Their consistent "unlock moment"

### **API Configuration:**
- **Environment Variable:** `ANTHROPIC_API_KEY` (set in DigitalOcean)
- **Model:** claude-3-5-sonnet-20241022
- **Check status:** Visit `/health` endpoint → `"aiConfigured": true`

---

## 💡 How to Use with Clients

### **Pre-Session (Send Ahead)**
1. Send client the tool URL: https://potential.harnessthespark.com/
2. Send CLIENT-INSTRUCTIONS.md as PDF or in email
3. Ask them to complete before your session
4. Request they click "Save to Google Sheets" when done

### **During Session (Live Exercise)**
1. Screen share the tool
2. Walk through sections together
3. Use AI buttons to reveal insights in real-time
4. Discuss patterns as they emerge
5. Complete Recognition Summary together

### **Post-Session (Follow-up)**
1. Client receives copy (download or email)
2. You have copy in Google Sheets
3. Reference in future sessions
4. Track ability evolution over time

---

## 🎯 What Each Section Reveals

| Section | What It Uncovers | Coaching Focus |
|---------|------------------|----------------|
| **Evidence Collection** | Concrete outcomes, measurable results | Pattern recognition across clients |
| **Instinct Radar** | Intuitive abilities, "knowing before knowing" | Trust their instincts, value gut feelings |
| **Effortless Ability** | Skills that feel "too easy" to charge for | Reframe "easy" as expertise, not unworthiness |
| **Transformation Mirror** | Before/after journey, unlock moment | Identify their unique transformation signature |
| **What Finds You** | Problem magnet, how others perceive them | External validation of internal abilities |
| **Recognition Summary** | Synthesis of all insights | Self-permission and next steps |

---

## 🔍 Red Flags to Watch For

### **Minimising Language:**
- "I just..." / "I only..." / "Anyone could..."
- **Coach response:** "Let's test that. How many people actually do this?"

### **Vague Descriptions:**
- "I help them feel better" / "I make things easier"
- **Coach response:** "What specifically changed? What did they say?"

### **Skipping Sections:**
- Empty "Effortless Ability" section
- **Coach response:** "This is where your gold is. What feels ridiculously easy to you?"

### **Over-Explaining:**
- Paragraphs of context before the actual ability
- **Coach response:** "What's the one-sentence version? The thing you did?"

---

## 💎 Gold Nugget Phrases to Listen For

When clients write these, PAUSE and dig deeper:

- "I don't know how I knew, I just knew"
- "Doesn't everyone see this?"
- "It's so obvious to me, why isn't it obvious to them?"
- "I can't not notice when..."
- "People always come to me for..."
- "I thought it was common sense but..."

**These are their superpowers hiding in plain sight.**

---

## 🛠️ Technical Troubleshooting

### **Client Says: "AI buttons aren't working"**
1. Check health endpoint: https://potential.harnessthespark.com/health
2. Verify `"aiConfigured": true`
3. If false, check DigitalOcean environment variables
4. Redeploy if needed (Settings → Force Redeploy)

### **Client Says: "My progress disappeared"**
- Auto-save uses browser localStorage
- Ask: Same browser? Incognito mode? Cleared data?
- Solution: Have them download frequently

### **Google Sheets Not Receiving Data**
1. Test the script: https://script.google.com/home
2. Check script is deployed as Web App
3. Verify "Who has access: Anyone"
4. Check spreadsheet permissions (you need edit access)

### **App is Down**
1. Check DigitalOcean app status
2. Check runtime logs for errors
3. Verify npm packages installed correctly
4. Check Node.js version (requires ≥18.x)

---

## 📈 Usage Monitoring

### **Check Logs:**
DigitalOcean Apps → Your app → Runtime Logs

**Look for:**
```
✅ Spark Your Potential server running on port 8080
🤖 AI Analysis: ENABLED
AI Analysis - Type: patterns, Tokens: {"input_tokens":500,"output_tokens":400}
```

### **Cost Tracking:**
- Each AI analysis logs token usage
- Multiply by Anthropic pricing:
  - Input: $3 per 1M tokens
  - Output: $15 per 1M tokens
- Typical analysis: ~500 input, ~400 output = ~$0.008

---

## 🎨 Customisation Options

### **Change Your Email:**
Edit `ability-recognition-visual.html` line ~1430:
```javascript
mailto:lisa@harnessthespark.com
```

### **Update Logo:**
Replace `HTS Icon_trans copy.jpeg` with your new logo (keep filename or update HTML)

### **Modify Colours:**
Edit CSS variables in `<style>` section (~lines 7-283)

### **Add Custom Domain:**
DigitalOcean → Your app → Settings → Domains → Add Domain
Suggested: `spark.harnessthespark.ai`

---

## 🚀 Quick Deploy Updates

### **Update the Tool:**
```bash
cd ~/spark-your-potential
# Make your changes to files
git add .
git commit -m "Update description"
git push origin main
```

DigitalOcean auto-deploys from GitHub within 2-3 minutes.

---

## 📋 Pre-Launch Checklist (Future Versions)

Before major launches, verify:

- [ ] Health check shows `"status": "healthy"`, `"aiConfigured": true`
- [ ] Test AI buttons with sample data
- [ ] Verify Google Sheets receiving data
- [ ] Check email functionality
- [ ] Test on mobile device
- [ ] Review client instructions for accuracy
- [ ] Update any domain/contact info changes

---

## 💰 Current Costs

**DigitalOcean App Platform:** $5/month (Basic plan)
**Anthropic API:** ~$0.008 per analysis
**Estimated monthly:** $5-15 depending on client volume

**Break-even:** Tool pays for itself with 1 client at typical coaching rates.

---

## 🌟 Integration with SparkHub

**Future Enhancement Options:**
1. Convert to React component for neurospark-fe
2. Integrate with Beautiful Brain Blueprint programme
3. Add to Spark Challenge as pre-work
4. Connect to AuDHD Task Management for post-discovery planning
5. Link abilities data to Agent Spark for personalised prompts

---

## 📞 Support

**Technical Issues:** lisa@harnessthespark.com
**DigitalOcean Dashboard:** https://cloud.digitalocean.com
**Anthropic Console:** https://console.anthropic.com
**GitHub Repo:** https://github.com/harnessthespark/spark-your-potential

---

**Last Updated:** October 2025
**Version:** 1.0 (Standalone with AI)
