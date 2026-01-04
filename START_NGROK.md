# Quick Start: ngrok for Mux Webhook

## ✅ Current Status
- ✅ Backend is running and healthy
- ✅ Mux-python installed in container
- ✅ Docker-compose updated with Mux environment variables
- ✅ Webhook endpoint ready at `/api/mux/webhook`

## 🚀 Next Steps: Start ngrok

### Step 1: Install ngrok (if not already installed)

**Option 1: Download (Recommended)**
1. Go to: https://ngrok.com/download
2. Download Windows version
3. Extract `ngrok.exe` to a folder
4. Open PowerShell in that folder

**Option 2: Chocolatey**
```powershell
choco install ngrok
```

**Option 3: npm**
```powershell
npm install -g ngrok
```

### Step 2: Start ngrok

**In a new PowerShell/Command Prompt window, run:**
```powershell
ngrok http 8000
```

**You'll see something like:**
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:8000
```

**Copy the HTTPS URL** (the one after "Forwarding")

### Step 3: Your Webhook URL

Your webhook URL for Mux dashboard will be:
```
https://abc123.ngrok-free.app/api/mux/webhook
```

Replace `abc123.ngrok-free.app` with your actual ngrok URL.

### Step 4: Configure in Mux

1. Go to: https://dashboard.mux.com
2. Settings → Webhooks
3. Create Webhook
4. URL: `https://your-ngrok-url.ngrok-free.app/api/mux/webhook`
5. Event: ✅ `video.asset.ready`
6. Save

### Step 5: Verify

After saving, Mux will send a test event. Check:
- Mux dashboard: Should show 200 OK status
- Backend logs: `docker-compose logs -f backend`
- ngrok dashboard: http://127.0.0.1:4040

## ⚠️ Important Notes

1. **Keep ngrok running** - Don't close the terminal with ngrok!
2. **Free ngrok URLs change** - If you restart ngrok, you'll get a new URL and need to update Mux
3. **For production** - Use a fixed domain instead of ngrok

## 🎉 You're Done!

Once configured, every video upload will automatically:
1. Upload to Mux
2. Process (1-5 minutes)
3. Webhook fires automatically
4. Lesson gets updated with playback_id
5. Video plays on lesson page!

