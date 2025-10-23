/**
 * Simple Express server for Spark Your Potential
 * Serves static HTML and provides AI analysis endpoint
 */

const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// AI Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { outcomes, type, name } = req.body;

    if (!outcomes || outcomes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No outcomes provided for analysis'
      });
    }

    // Get API key from environment variable
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: 'AI service not configured. Please add ANTHROPIC_API_KEY environment variable.'
      });
    }

    // Build prompt based on analysis type
    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'patterns') {
      systemPrompt = `You are an expert coach helping people recognise their extraordinary abilities.
Analyse the client outcomes provided and identify:
1. The core ability or skill thread running through all examples
2. What makes this ability special or valuable
3. How this ability creates transformation for clients

Be warm, encouraging, and specific. Focus on the "invisible" abilities people underestimate.`;

      userPrompt = `Analyse these client outcomes and reveal the pattern:

${outcomes.map((o, i) => `Outcome ${i + 1}: ${o}`).join('\n\n')}

What ability keeps showing up? What's the thread connecting all these outcomes?`;

    } else if (type === 'unlock') {
      systemPrompt = `You are an insightful coach who helps people see their unique transformation pattern.
Analyse how this person enables change in others. Look for:
1. The specific type of transformation they create
2. What makes their approach unique
3. The "unlock moment" they provide

Be specific and affirming. Help them see what they do that others can't.`;

      userPrompt = `Based on these outcomes, what's this person's unique "unlock pattern"?

${outcomes.map(o => `• ${o}`).join('\n')}

What transformation do they consistently create? What's their unique unlock?`;

    } else if (type === 'instincts') {
      systemPrompt = `You are an expert in intuitive and pattern-recognition abilities.
Analyse someone's instinct examples to reveal their specific intuitive strengths.
Be specific about what type of intuition they have and how it shows up.`;

      const instinctData = req.body.instinct_data || {};
      userPrompt = `Analyse these instinct examples:

When they knew before they knew: ${instinctData.intuition || ''}
Questions they ask: ${instinctData.questions || ''}
What they notice first: ${instinctData.noticing || ''}

What's their specific intuitive ability? How does their radar work?`;

    } else {
      return res.status(400).json({
        success: false,
        error: `Unknown analysis type: ${type}`
      });
    }

    // Call Anthropic API
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(response.status).json({
        success: false,
        error: 'AI analysis failed. Please try again.',
        details: response.status === 401 ? 'Authentication error' : undefined
      });
    }

    const data = await response.json();
    const analysisText = data.content[0].text;

    // Log usage for monitoring
    console.log(`AI Analysis - Type: ${type}, Tokens: ${JSON.stringify(data.usage)}`);

    // Return successful response
    res.json({
      success: true,
      analysis: analysisText,
      type: type,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ability-recognition-visual.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    aiConfigured: !!process.env.ANTHROPIC_API_KEY
  });
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Spark Your Potential server running on port ${PORT}`);
  console.log(`🤖 AI Analysis: ${process.env.ANTHROPIC_API_KEY ? 'ENABLED' : 'DISABLED - Add ANTHROPIC_API_KEY'}`);
});
