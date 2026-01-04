# Quick Webhook Setup Guide

## 📍 Your Webhook Endpoint

**Endpoint Path:** `/api/mux/webhook`  
**Full URL depends on your setup:**

### Option 1: Local Development (with ngrok) 🌐

**For testing locally, you need to expose your backend to the internet:**

1. **Install ngrok** (if not already installed):
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm: npm install -g ngrok
   # Or use chocolatey: choco install ngrok
   ```

2. **Start your backend** (if not already running):
   ```bash
   docker-compose up -d backend
   # OR if running manually: uvicorn main:app --reload
   ```

3. **Start ngrok** in a new terminal:
   ```bash
   ngrok http 8000
   ```

4. **Copy the HTTPS URL** from ngrok (looks like `https://abc123.ngrok-free.app`)

5. **Your webhook URL is:**
   ```
   https://abc123.ngrok-free.app/api/mux/webhook
   ```
   ⚠️ **Important:** Use the HTTPS URL, not HTTP!

### Option 2: Production/Docker on Server 🌍

If your backend is already deployed:

```
https://your-domain.com/api/mux/webhook
```

---

## 🔧 Step-by-Step: Configure in Mux Dashboard

### Step 1: Login to Mux
1. Go to [https://dashboard.mux.com](https://dashboard.mux.com)
2. Sign in with your account

### Step 2: Navigate to Webhooks
1. Click **"Settings"** in the left sidebar (or click your profile icon → Settings)
2. Click **"Webhooks"** in the settings menu

### Step 3: Create New Webhook
1. Click the **"+ Create Webhook"** or **"Add Webhook"** button
2. A form will appear

### Step 4: Fill in Webhook Details

**Webhook URL:**
```
Paste your webhook URL here:
- For ngrok: https://your-ngrok-url.ngrok-free.app/api/mux/webhook
- For production: https://your-domain.com/api/mux/webhook
```

**Events to Subscribe:**
- ✅ Check **"video.asset.ready"** (this is the only one needed)

**Status:**
- ✅ Leave enabled

### Step 5: Save
1. Click **"Save"** or **"Create Webhook"**
2. Mux will immediately try to send a test event to verify your endpoint

---

## ✅ Verify It's Working

### Check 1: Mux Dashboard
1. Go back to the Webhooks page
2. Click on your newly created webhook
3. Check the **"Recent Events"** or **"Delivery Log"** section
4. You should see a test event with status **200 OK**

### Check 2: Your Backend Logs
Watch your backend console - you should see:
```
INFO: POST /api/mux/webhook
```

### Check 3: Test Manually
You can test the endpoint directly:

```bash
curl -X POST http://localhost:8000/api/mux/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video.asset.ready",
    "data": {
      "id": "test-asset-id",
      "playback_ids": [{"id": "test-playback-id"}],
      "passthrough": "{\"lesson_id\":\"test-lesson-id\"}"
    }
  }'
```

Should return: `{"status":"ok"}`

---

## 🧪 Test the Full Flow

1. **Make sure ngrok is running** (if testing locally)
2. **Upload a test video:**
   - Login as admin
   - Go to Course Builder
   - Select a lesson
   - Click the 📹 button
   - Upload a small test video
3. **Wait 1-5 minutes** for Mux to process
4. **Check the lesson** - the `mux_playback_id` should be automatically populated
5. **View the lesson** - video should play automatically!

---

## 🐛 Troubleshooting

### "Webhook delivery failed" in Mux dashboard

**Problem:** Mux can't reach your endpoint

**Solutions:**
- ✅ Make sure your backend is running
- ✅ For local: Make sure ngrok is running and URL is correct
- ✅ Check the webhook URL in Mux (no typos!)
- ✅ Verify ngrok shows incoming requests in its dashboard
- ✅ Check firewall/network settings

### "400 Bad Request" or "500 Internal Server Error"

**Problem:** Backend received webhook but processing failed

**Solutions:**
- ✅ Check backend logs for error messages
- ✅ Verify your database is accessible
- ✅ Make sure the lesson_id in passthrough is valid
- ✅ Check that the webhook endpoint is working (use test curl command above)

### "Webhook received but lesson not updated"

**Problem:** Webhook processed but lesson still has no playback_id

**Solutions:**
- ✅ Check backend logs for the webhook processing
- ✅ Verify the passthrough contains correct lesson_id
- ✅ Check database directly to see if fields were updated
- ✅ Make sure you're looking at the correct lesson

---

## 📝 Quick Reference

**Your webhook endpoint:**
- Path: `/api/mux/webhook`
- Method: POST
- Auth: None required (public endpoint)
- Event: `video.asset.ready`

**When it fires:**
- After a video upload completes
- After Mux finishes processing (1-5 minutes)

**What it does:**
- Extracts `playback_id` and `asset_id` from webhook payload
- Finds lesson using `lesson_id` from passthrough
- Updates lesson in database with Mux IDs

---

## 🎉 Done!

Once you see successful webhook deliveries in the Mux dashboard, you're all set! The integration will automatically update lessons when videos are processed.

