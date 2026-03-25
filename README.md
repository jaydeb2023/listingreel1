# 🏠 ListingReel — AI Video Ads for Real Estate Agents

Generate cinematic property video ads, scripts, music & social captions in 60 seconds. 100% free to build and deploy.

---

## 🚀 Deploy to Vercel

### Step 1 — Get API Keys (Both Free)

**Groq (Llama 3) — for script writing — 100% FREE:**
1. Go to https://console.groq.com
2. Sign up (no credit card needed)
3. API Keys → Create API Key → Copy it

**Hugging Face — for video & music:**
1. Go to https://huggingface.co/settings/tokens
2. New Token → Read → Name: `listingreel` → Create
3. Copy token (starts with `hf_...`)

---

### Step 2 — Push to GitHub
```bash
git init
git add .
git commit -m "ListingReel initial commit"
# Create repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/listingreel.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy on Vercel
1. Go to vercel.com → New Project → Import repo
2. Add Environment Variables:
   - `GROQ_API_KEY` = your Groq key
   - `HF_API_KEY` = your Hugging Face token
3. Deploy!

---

## 💻 Run Locally
```bash
npm install
cp .env.local.example .env.local
# Add your keys to .env.local
npm run dev
```

---

## 🛠 Tech Stack
- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Script AI**: Anthropic Claude (free tier)
- **Video AI**: Hugging Face zeroscope-v2 (free)
- **Music AI**: Hugging Face MusicGen (free)
- **Hosting**: Vercel (free)

---

## 💡 What It Generates
1. 3-scene cinematic video ad
2. Voiceover script per scene
3. Background music (4 moods)
4. Instagram/Facebook caption
5. Email campaign copy
