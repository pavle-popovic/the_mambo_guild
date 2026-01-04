# Quick Webhook Setup - Step by Step

## ✅ Step 1: Backend is Fixed
I've installed `mux-python` in your Docker container and added Mux environment variables to docker-compose.yml.

**Make sure you have a `.env` file with:**
```env
MUX_TOKEN_ID=your-token-id
MUX_TOKEN_SECRET=your-secret-key
```

## 📡 Step 2: Install & Start ngrok

### Option A: Download ngrok
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract to a folder (e.g., `C:\ngrok`)
4. Add to PATH or use full path

### Option B: Use Chocolatey (if installed)
```powershell
choco install ngrok
```

### Option C: Use npm (if you have Node.js)
```powershell
npm install -g ngrok
```

## 🚀 Step 3: Start ngrok

**In a new terminal/PowerShell window, run:**
```powershell
ngrok http 8000
```

**You'll see output like:**
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (the one starting with `https://`)

## 🔗 Step 4: Your Webhook URL

Your webhook URL will be:
```
https://abc123.ngrok-free.app/api/mux/webhook
```
(Replace `abc123.ngrok-free.app` with your actual ngrok URL)

## ⚙️ Step 5: Configure in Mux Dashboard

1. **Go to:** https://dashboard.mux.com
2. **Navigate to:** Settings → Webhooks
3. **Click:** "Create Webhook" or "Add Webhook"
4. **Enter:**
   - **URL:** `https://your-ngrok-url.ngrok-free.app/api/mux/webhook`
   - **Events:** Check ✅ `video.asset.ready`
5. **Click:** Save

## ✅ Step 6: Verify

1. **Check Mux dashboard** - You should see a test event with status 200
2. **Check backend logs:**
   ```powershell
   docker-compose logs -f backend
   ```
   You should see: `POST /api/mux/webhook`

3. **Test locally** (optional):
   ```powershell
   python test_webhook_endpoint.py
   ```

## 🎬 Step 7: Test Upload

1. Keep ngrok running (don't close that terminal!)
2. Login to your app as admin
3. Go to Course Builder
4. Select a lesson
5. Click the 📹 button
6. Upload a test video
7. Wait 1-5 minutes
8. Check the lesson - `mux_playback_id` should be populated automatically!

## 🐛 Troubleshooting

**Backend not starting?**
```powershell
docker-compose restart backend
docker-compose logs backend
```

**ngrok not working?**
- Make sure backend is running: `docker-compose ps`
- Make sure port 8000 is accessible: `curl http://localhost:8000/health`

**Webhook not received?**
- Verify ngrok URL is correct
- Check ngrok dashboard at http://127.0.0.1:4040
- Make sure ngrok is still running

## 📝 Quick Reference

**Keep these running:**
- ✅ Docker containers (backend, frontend, postgres, redis)
- ✅ ngrok tunnel (`ngrok http 8000`)

**Your webhook endpoint:**
- Local: `http://localhost:8000/api/mux/webhook`
- Public (via ngrok): `https://xxxxx.ngrok-free.app/api/mux/webhook`

