# Cloudflare R2 CORS Configuration

To enable browser-based image uploads to Cloudflare R2, you need to configure CORS (Cross-Origin Resource Sharing) on your R2 bucket.

## Steps to Configure CORS

1. **Log in to Cloudflare Dashboard**
   - Go to https://dash.cloudflare.com
   - Navigate to **R2** in the sidebar

2. **Select Your Bucket**
   - Click on your bucket name (e.g., `the-mambo-inn`)

3. **Configure CORS Settings**
   - Click on **Settings** tab
   - Scroll down to **CORS Policy** section
   - Click **Add CORS policy** or **Edit** if one exists

4. **Add CORS Policy JSON**
   Paste the following JSON configuration:

   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   **Note:** For production, replace `"*"` in `AllowedOrigins` with your specific domain(s), e.g.:
   ```json
   "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"]
   ```

5. **Save the Configuration**
   - Click **Save** or **Update**

6. **Verify**
   - Try uploading an image through the application
   - The upload should now work without CORS errors

## Testing CORS Configuration

After configuring CORS, test the upload functionality:
- Profile page: Upload avatar
- Admin Builder > Create Course: Upload thumbnail  
- Admin Builder > Edit Lesson: Upload lesson thumbnail

## Troubleshooting

If uploads still fail:
1. **Clear browser cache** - CORS errors can be cached
2. **Check browser console** - Look for specific CORS error messages
3. **Verify bucket name** - Ensure the bucket name in `.env` matches your R2 bucket
4. **Check R2 credentials** - Verify `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_ENDPOINT_URL` are correct
5. **Wait a few minutes** - CORS changes may take a moment to propagate

## Security Note

Using `"*"` for `AllowedOrigins` allows uploads from any domain. For production environments, restrict this to your specific domains.

