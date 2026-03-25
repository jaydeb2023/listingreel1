const MUSIC_PROMPTS = {
  luxury: 'elegant cinematic piano, slow tempo, luxury real estate, sophisticated, strings, minimal',
  upbeat: 'upbeat modern pop, bright piano, positive energy, real estate, contemporary',
  emotional: 'emotional strings, heartwarming, home, family, warm piano, cinematic',
  dramatic: 'dramatic orchestral, bold brass, cinematic trailer, impactful, powerful',
}

export async function POST(request) {
  try {
    const { mood } = await request.json()

    if (!process.env.HF_API_KEY) {
      return Response.json({ error: 'HF_API_KEY not configured' }, { status: 500 })
    }

    const musicPrompt = MUSIC_PROMPTS[mood] || MUSIC_PROMPTS.luxury

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/facebook/musicgen-small',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: musicPrompt,
          parameters: { max_new_tokens: 512 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      if (response.status === 503) {
        return Response.json({ error: 'Music model loading. Wait 30s and retry.', loading: true }, { status: 503 })
      }
      throw new Error(err.error || `Music error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(audioBuffer).toString('base64')
    return Response.json({ success: true, audioUrl: `data:audio/wav;base64,${base64}` })
  } catch (err) {
    return Response.json({ error: err.message || 'Music generation failed' }, { status: 500 })
  }
}
