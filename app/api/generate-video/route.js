export async function POST(request) {
  try {
    const { prompt } = await request.json()

    if (!process.env.HF_API_KEY) {
      return Response.json({ error: 'HF_API_KEY not configured' }, { status: 500 })
    }

    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/cerspense/zeroscope_v2_576w',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { num_frames: 24, num_inference_steps: 25 },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      if (response.status === 503) {
        return Response.json({ error: 'Model is loading. Please wait 30 seconds and try again.', loading: true }, { status: 503 })
      }
      throw new Error(err.error || `HF error: ${response.status}`)
    }

    const videoBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(videoBuffer).toString('base64')
    return Response.json({ success: true, videoUrl: `data:video/mp4;base64,${base64}` })
  } catch (err) {
    return Response.json({ error: err.message || 'Video generation failed' }, { status: 500 })
  }
}
