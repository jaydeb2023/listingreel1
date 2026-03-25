'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const STEPS = ['Script Ready', 'Scene 1 Video', 'Scene 2 Video', 'Scene 3 Video', 'Background Music']

export default function GeneratePage() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [videos, setVideos] = useState([null, null, null])
  const [audioUrl, setAudioUrl] = useState(null)
  const [errors, setErrors] = useState([])
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem('listingreel_data')
    if (!raw) { router.push('/'); return }
    const parsed = JSON.parse(raw)
    setData(parsed)
    runGeneration(parsed)
  }, [])

  const generateVideoWithRetry = async (prompt, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const d = await res.json()
      if (d.loading) { await new Promise(r => setTimeout(r, 35000)); continue }
      if (d.success) return d.videoUrl
      throw new Error(d.error)
    }
    throw new Error('Video generation timed out')
  }

  const generateMusicWithRetry = async (mood, retries = 2) => {
    for (let i = 0; i <= retries; i++) {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood }),
      })
      const d = await res.json()
      if (d.loading) { await new Promise(r => setTimeout(r, 35000)); continue }
      if (d.success) return d.audioUrl
      throw new Error(d.error)
    }
    throw new Error('Music generation timed out')
  }

  const runGeneration = async (parsed) => {
    const { script } = parsed
    setCurrentStep(1) // Script already done

    const newVideos = [null, null, null]
    const newErrors = []

    // Generate 3 scene videos sequentially
    for (let i = 0; i < 3; i++) {
      setCurrentStep(i + 1)
      try {
        const videoUrl = await generateVideoWithRetry(script.scenes[i].videoPrompt)
        newVideos[i] = videoUrl
        setVideos([...newVideos])
      } catch (err) {
        newErrors.push(`Scene ${i + 1}: ${err.message}`)
        setErrors([...newErrors])
      }
    }

    // Generate music
    setCurrentStep(4)
    try {
      const audio = await generateMusicWithRetry(script.musicMood || 'luxury')
      setAudioUrl(audio)
    } catch (err) {
      newErrors.push(`Music: ${err.message}`)
      setErrors([...newErrors])
    }

    setCurrentStep(5)
    setDone(true)
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { script, form } = data

  return (
    <main className="relative min-h-screen z-10 px-4 py-8 max-w-3xl mx-auto">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-yellow-500 opacity-5 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-btn flex items-center justify-center text-sm font-black">L</div>
          <span className="font-display text-xl font-semibold">ListingReel</span>
        </div>
        <button onClick={() => router.push('/')} className="text-sm text-white/40 hover:text-white transition-colors">← New Listing</button>
      </div>

      {/* Headline */}
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-semibold mb-2">
          <span className="text-gold-gradient italic">{script.headline}</span>
        </h1>
        <p className="text-white/40">{script.tagline}</p>
      </div>

      {/* Progress Steps */}
      {!done && (
        <div className="glass rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-white/50">Generating Your Ad</h2>
            <span className="text-yellow-400 text-sm">{currentStep}/{STEPS.length} steps</span>
          </div>
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                  i < currentStep ? 'gold-btn' : i === currentStep ? 'border-2 border-yellow-400 text-yellow-400' : 'border border-white/10 text-white/20'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-sm transition-colors ${i < currentStep ? 'text-white/70' : i === currentStep ? 'text-yellow-300' : 'text-white/20'}`}>
                  {s}
                  {i === currentStep && <span className="ml-2 inline-flex gap-1">{[0,1,2].map(d => <span key={d} className="w-1 h-1 rounded-full bg-yellow-400 animate-bounce" style={{animationDelay:`${d*0.15}s`}} />)}</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/20 mt-4 text-center">Each video takes 2–5 minutes on free tier ☕</p>
        </div>
      )}

      {done && (
        <div className="glass-gold rounded-2xl px-6 py-4 mb-8 flex items-center gap-3">
          <span className="text-2xl">🎬</span>
          <div>
            <p className="font-semibold text-yellow-300">Your listing ad is ready!</p>
            <p className="text-xs text-white/40">Download videos & copy your marketing materials below</p>
          </div>
        </div>
      )}

      {/* Scenes */}
      <div className="space-y-6 mb-8">
        {script.scenes.map((scene, i) => (
          <div key={i} className="glass rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-yellow-400 uppercase tracking-widest">Scene {scene.number}</span>
                <h3 className="font-display text-lg font-semibold mt-0.5">{scene.title}</h3>
              </div>
              {videos[i] && (
                <a href={videos[i]} download={`scene-${i+1}.mp4`}
                  className="text-xs px-3 py-1.5 glass-gold rounded-xl text-yellow-300 hover:text-yellow-200 transition-colors">
                  ⬇ Download
                </a>
              )}
            </div>
            <div className="p-5">
              {videos[i] ? (
                <video src={videos[i]} controls autoPlay loop muted
                  className="w-full rounded-xl bg-black mb-4" style={{maxHeight:'280px'}} />
              ) : (
                <div className="w-full h-40 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
                  {i < currentStep ? (
                    <div className="text-center">
                      <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs text-white/30">Generating scene {i+1}...</p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/20">Waiting...</p>
                  )}
                </div>
              )}
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/30 uppercase tracking-widest mb-1">Voiceover</p>
                <p className="text-sm text-white/70 leading-relaxed">{scene.voiceover}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Music */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">🎵 Background Music</h3>
          {audioUrl && (
            <a href={audioUrl} download="background-music.wav"
              className="text-xs px-3 py-1.5 glass-gold rounded-xl text-yellow-300">⬇ Download</a>
          )}
        </div>
        {audioUrl ? (
          <audio src={audioUrl} controls className="w-full" />
        ) : (
          <div className="h-12 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center">
            <p className="text-xs text-white/30">{currentStep >= 4 ? 'Generating music...' : 'Waiting...'}</p>
          </div>
        )}
      </div>

      {/* Marketing Copy */}
      {done && (
        <div className="space-y-4 mb-8">
          <h2 className="font-display text-2xl font-semibold">📋 Marketing Copy</h2>

          {/* Social Caption */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-widest">Instagram / Facebook Caption</span>
              <button onClick={() => copyText(script.socialCaption, 'caption')}
                className={`text-xs px-3 py-1 rounded-lg transition-all ${copied==='caption' ? 'glass-gold text-yellow-300' : 'glass text-white/40 hover:text-white'}`}>
                {copied==='caption' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{script.socialCaption}</p>
          </div>

          {/* Email */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-white/40 uppercase tracking-widest">Email Campaign</span>
              <button onClick={() => copyText(`Subject: ${script.emailSubject}\n\n${script.emailBody}`, 'email')}
                className={`text-xs px-3 py-1 rounded-lg transition-all ${copied==='email' ? 'glass-gold text-yellow-300' : 'glass text-white/40 hover:text-white'}`}>
                {copied==='email' ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-yellow-400/70 mb-1">Subject: {script.emailSubject}</p>
            <p className="text-sm text-white/70 leading-relaxed">{script.emailBody}</p>
          </div>

          {/* Errors if any */}
          {errors.length > 0 && (
            <div className="glass rounded-2xl p-4 border border-red-500/20">
              <p className="text-xs text-red-400 mb-2">Some items had issues:</p>
              {errors.map((e, i) => <p key={i} className="text-xs text-white/40">{e}</p>)}
            </div>
          )}

          <button onClick={() => router.push('/')}
            className="w-full py-4 rounded-2xl gold-btn font-semibold text-sm">
            ✦ Generate Another Listing
          </button>
        </div>
      )}
    </main>
  )
}
