import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request) {
  try {
    const form = await request.json()

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const prompt = `You are a world-class real estate video ad scriptwriter. Create a 3-scene cinematic video ad script for this property listing.

PROPERTY DETAILS:
- Agent/Agency: ${form.agentName || 'Premium Realty'}
- Type: ${form.propertyType}
- Location: ${form.address}
- Price: ${form.price}
- Area: ${form.area || 'N/A'}
- Bedrooms: ${form.bedrooms || 'N/A'} | Bathrooms: ${form.bathrooms || 'N/A'}
- Key Highlights: ${form.highlights || 'Modern finishes, great location'}
- Target Buyer: ${form.targetBuyer || 'Discerning buyers'}
- Ad Mood: ${form.mood}
- CTA: ${form.ctaText}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "headline": "Short punchy headline for the ad (max 8 words)",
  "tagline": "One emotional tagline (max 12 words)",
  "scenes": [
    {
      "number": 1,
      "title": "Scene title",
      "videoPrompt": "Detailed cinematic video prompt for AI generation (describe visuals, camera movement, lighting, mood - 30-50 words)",
      "voiceover": "Voiceover text for this scene (2-3 sentences)",
      "duration": "5s"
    },
    {
      "number": 2,
      "title": "Scene title",
      "videoPrompt": "...",
      "voiceover": "...",
      "duration": "5s"
    },
    {
      "number": 3,
      "title": "Scene title",
      "videoPrompt": "...",
      "voiceover": "...",
      "duration": "5s"
    }
  ],
  "socialCaption": "Instagram/Facebook caption with emojis and hashtags (150-200 chars)",
  "emailSubject": "Email subject line for this listing",
  "emailBody": "Short email body (3-4 sentences) for cold outreach to potential buyers",
  "musicMood": "one of: luxury, upbeat, emotional, dramatic"
}`

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const text = completion.choices[0].message.content.trim()
    const clean = text.replace(/```json|```/g, '').trim()
    const script = JSON.parse(clean)

    return Response.json({ success: true, script })
  } catch (err) {
    console.error('Script generation error:', err)
    return Response.json({ error: err.message || 'Failed to generate script' }, { status: 500 })
  }
}
