# Dental Supplies Management System — Deploy Guide (Vercel + GitHub)

## 1) Prepare repository on GitHub
```bash
git init
git add .
git commit -m "Initial commit: Vercel-ready with serverless Gemini proxy"
git branch -M main
git remote add origin https://github.com/<your-username>/dental-supplies-management-system.git
git push -u origin main
```

## 2) Connect on Vercel
1. Go to **vercel.com** → **Add New… → Project**.
2. Import your GitHub repo.
3. Framework Preset: **Vite**.
4. Build Command: `vite build`
5. Output Directory: `dist`
6. Add Environment Variable:
   - `GEMINI_API_KEY` = *your key from Google AI Studio*

## 3) Run locally
```bash
npm i
cp .env.example .env # then edit GEMINI_API_KEY
npm run dev
```

## 4) How it works
- Frontend calls **/api/generate-description** (serverless) so your key is never shipped to the browser.
- Serverless function uses `@google/genai` to call Gemini.
- Edit `api/generate-description.ts` for different prompts or models.

**Model choice**
```ts
model: "gemini-2.0-flash-exp"
```
Change to `gemini-2.0-flash` for stable, or another model if needed.
