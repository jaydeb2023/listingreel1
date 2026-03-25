'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const MOODS = ['Luxury & Prestigious', 'Warm & Inviting', 'Modern & Minimal', 'Exciting & Energetic']
const PROPERTY_TYPES = ['Apartment', 'Villa', 'Penthouse', 'Commercial', 'Plot / Land', 'Office Space']

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    agentName: '',
    propertyType: 'Apartment',
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    highlights: '',
    mood: 'Luxury & Prestigious',
    targetBuyer: '',
    ctaText: 'Book a Viewing Today',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGenerate = async () => {
    if (!form.address || !form.price) { setError('Please fill in at least the address and price.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Script generation failed')
      // Store in sessionStorage and navigate
      sessionStorage.setItem('listingreel_data', JSON.stringify({ form, script: data.script }))
      router.push('/generate')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen z-10">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-yellow-500 opacity-5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-yellow-600 opacity-3 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gold-btn flex items-center justify-center text-sm font-black">L</div>
          <span className="font-display text-xl font-semibold tracking-wide">ListingReel</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-white/40">
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">How it works</span>
          <span className="text-white/60 hover:text-white cursor-pointer transition-colors">Pricing</span>
          <button className="px-4 py-2 glass rounded-xl text-white/80 hover:text-white transition-colors">Login</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 glass-gold rounded-full px-4 py-2 text-xs text-yellow-300 mb-6 font-body">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          100% Free for Real Estate Agents
        </div>
        <h1 className="font-display text-5xl md:text-7xl font-semibold leading-tight mb-4">
          Sell Properties Faster<br />
          <span className="text-gold-gradient italic">with AI Video Ads</span>
        </h1>
        <p className="text-white/40 text-lg max-w-xl mx-auto mb-4 font-body">
          Enter your listing details. Get a cinematic video ad, script, music & social captions — in 60 seconds.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-white/30 mb-12">
          <span>✦ No design skills needed</span>
          <span>✦ No credit card</span>
          <span>✦ Fully automated</span>
        </div>

        {/* How it works */}
        <div className="flex items-center justify-center gap-2 md:gap-8 mb-16 flex-wrap">
          {['Fill listing details', 'AI writes your script', 'Video + music generated', 'Download & post'].map((s, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full gold-btn text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-white/50 text-sm">{s}</span>
              </div>
              {i < 3 && <span className="text-white/20 hidden md:block">→</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="relative z-10 max-w-2xl mx-auto px-4 pb-20">
        <div className="glass rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold">Your Listing Details</h2>
            <div className="flex gap-1">
              {[1, 2].map(s => (
                <button key={s} onClick={() => setStep(s)}
                  className={`w-8 h-1.5 rounded-full transition-all ${step === s ? 'bg-yellow-400' : 'bg-white/10'}`} />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-fade-up">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Your Name</label>
                  <input value={form.agentName} onChange={e => set('agentName', e.target.value)} placeholder="Agent / Agency name" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Property Type</label>
                  <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Property Address / Location *</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 3BHK in Bandra West, Mumbai" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Price *</label>
                  <input value={form.price} onChange={e => set('price', e.target.value)} placeholder="e.g. ₹2.5 Crore" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Area (sq ft)</label>
                  <input value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 1800 sq ft" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Bedrooms</label>
                  <input value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="e.g. 3" />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Bathrooms</label>
                  <input value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="e.g. 2" />
                </div>
              </div>
              <button onClick={() => setStep(2)}
                className="w-full py-3.5 rounded-2xl gold-btn text-sm font-semibold mt-2 transition-opacity hover:opacity-90">
                Next — Ad Settings →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-up">
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Key Highlights</label>
                <textarea value={form.highlights} onChange={e => set('highlights', e.target.value)}
                  rows={3} placeholder="e.g. Sea view, modular kitchen, 24hr security, gym, swimming pool, near metro..." />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Target Buyer</label>
                <input value={form.targetBuyer} onChange={e => set('targetBuyer', e.target.value)}
                  placeholder="e.g. Young professionals, NRI investors, families with kids" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-2 block uppercase tracking-widest">Ad Mood / Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {MOODS.map(m => (
                    <button key={m} onClick={() => set('mood', m)}
                      className={`py-2.5 px-3 rounded-xl text-sm text-left transition-all ${form.mood === m ? 'glass-gold text-yellow-300' : 'glass text-white/50 hover:text-white/80'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-widest">Call to Action</label>
                <input value={form.ctaText} onChange={e => set('ctaText', e.target.value)} placeholder="e.g. Book a Viewing Today" />
              </div>

              {error && <p className="text-red-400 text-sm glass rounded-xl px-4 py-3">⚠️ {error}</p>}

              <div className="flex gap-3 mt-2">
                <button onClick={() => setStep(1)} className="px-5 py-3.5 glass rounded-2xl text-sm text-white/60 hover:text-white transition-colors">← Back</button>
                <button onClick={handleGenerate} disabled={loading}
                  className="flex-1 py-3.5 rounded-2xl gold-btn text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Writing your script...
                    </>
                  ) : '✦ Generate My Video Ad'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Social proof */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[['2,400+', 'Agents using it'], ['18 sec', 'Avg. generation'], ['100%', 'Free forever']].map(([n, l]) => (
            <div key={n} className="glass rounded-2xl py-4">
              <div className="font-display text-2xl text-gold-gradient font-semibold">{n}</div>
              <div className="text-xs text-white/30 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
