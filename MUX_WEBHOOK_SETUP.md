# Mux Webhook Configuration Guide

## Step-by-Step Webhook Setup

### 1. Access Mux Dashboard

1. Go to [https://dashboard.mux.com](https://dashboard.mux.com)
2. Log in with your Mux account credentials
3. Navigate to **Settings** → **Webhooks** (or **Webhooks** in the left sidebar)

### 2. Create a New Webhook

1. Click **"Create Webhook"** or **"Add Webhook"** button
2. You'll see a form to configure the webhook

### 3. Configure Webhook Settings

#### Webhook URL
Enter your backend webhook endpoint URL:

**For Local Development:**
```
http://localhost:8000/api/mux/webhook
```

**For Production/Docker:**
```
http://your-domain.com/api/mux/webhook
```

**For Docker with ngrok (Local Testing):**
```
https://your-ngrok-url.ngrok.io/api/mux/webhook
```

#### Events to Subscribe
Select the following event:
- ✅ **`video.asset.ready`** - This event fires when a video has finished processing and is ready for playback

**Note:** You can subscribe to other events if needed, but `video.asset.ready` is the minimum required for this integration.

### 4. Webhook Security (Optional but Recommended)

Mux allows you to configure webhook signing secrets for security. Our backend code currently accepts webhooks without signature verification for simplicity, but you can:

1. **Get your webhook signing secret** from Mux dashboard (under webhook settings)
2. **Add it to your `.env` file:**
   ```env
   MUX_WEBHOOK_SECRET=your-webhook-signing-secret-here
   ```
3. **Update the backend** to verify signatures (see enhancement section below)

### 5. Save and Test

1. Click **"Save"** or **"Create Webhook"**
2. Mux will send a test event to verify your endpoint is reachable
3. Check your backend logs to confirm the webhook is being received

### 6. Verify Webhook is Working

#### Test the Webhook Endpoint

You can test your webhook endpoint manually:

```bash
curl -X POST http://localhost:8000/api/mux/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "video.asset.ready",
    "data": {
      "id": "test-asset-id",
      "playback_ids": [{"id": "test-playback-id"}],
      "passthrough": "{\"lesson_id\":\"your-lesson-id-here\"}"
    }
  }'
```

#### Monitor Webhook Events

1. Go to **Webhooks** → **Your Webhook** → **Events** in Mux dashboard
2. You should see a log of all webhook delivery attempts
3. Status codes should be `200` for successful deliveries

### 7. Test the Full Flow

1. **Upload a video** through the admin interface
2. **Wait 1-5 minutes** for Mux to process the video
3. **Check the lesson** in your database - `mux_playback_id` and `mux_asset_id` should be populated
4. **View the lesson** as a student - video should play automatically

## Troubleshooting

### Webhook Not Receiving Events

1. **Check URL is accessible:**
   - For local development, use ngrok or similar tunnel service
   - Make sure your backend is running and accessible

2. **Check backend logs:**
   - Look for incoming POST requests to `/api/mux/webhook`
   - Check for any error messages

3. **Verify webhook URL in Mux:**
   - Make sure it's exactly: `http://your-url/api/mux/webhook`
   - No trailing slashes
   - Correct protocol (http/https)

### Webhook Receiving but Not Updating Lessons

1. **Check passthrough data:**
   - Make sure `lesson_id` is being sent in the upload request
   - Verify the passthrough JSON format is correct

2. **Check database:**
   - Verify the lesson ID exists in your database
   - Check for any database constraint errors

3. **Check backend logs:**
   - Look for errors in webhook processing
   - Verify the webhook handler is extracting data correctly

### Webhook Status Shows Failed

1. **Check CORS settings:**
   - Mux may need CORS headers (already configured in backend)

2. **Check authentication:**
   - Webhook endpoint should NOT require authentication (it's public)
   - Verify it's accessible without login

3. **Check server logs:**
   - Look for 400/500 errors
   - Check for stack traces

## Using ngrok for Local Testing

Since Mux needs to reach your local backend, you'll need a tunnel for local development:

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/download
   # Or use npm: npm install -g ngrok
   ```

2. **Start ngrok:**
   ```bash
   ngrok http 8000
   ```

3. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

4. **Use in Mux webhook:**
   ```
   https://abc123.ngrok.io/api/mux/webhook
   ```

5. **Keep ngrok running** while testing

## Production Deployment

For production:

1. **Use your production domain:**
   ```
   https://yourdomain.com/api/mux/webhook
   ```

2. **Enable HTTPS** (required for production)

3. **Add webhook signature verification** (see enhancement section)

4. **Monitor webhook delivery** in Mux dashboard

5. **Set up error alerts** if webhook delivery fails repeatedly

## Webhook Payload Example

When Mux sends a webhook, your backend receives:

```json
{
  "type": "video.asset.ready",
  "data": {
    "id": "asset-id-12345",
    "playback_ids": [
      {
        "id": "playback-id-12345",
        "policy": "public"
      }
    ],
    "passthrough": "{\"lesson_id\":\"uuid-here\"}"
  }
}
```

The backend extracts:
- `asset_id` from `data.id`
- `playback_id` from `data.playback_ids[0].id`
- `lesson_id` from `data.passthrough` JSON

## Next Steps After Configuration

1. ✅ Webhook configured in Mux dashboard
2. ✅ Webhook URL is accessible
3. ✅ Test webhook delivery (check Mux dashboard)
4. ✅ Upload a test video through admin
5. ✅ Verify lesson updates automatically
6. ✅ Test video playback on lesson page

Your Mux integration is now fully configured! 🎉

