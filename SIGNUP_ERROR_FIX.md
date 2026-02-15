# Signup Error: JSON Parse Error Fix

## Problem
You're getting: `JSON Parse error: Unexpected character: <`

This means the API is returning HTML instead of JSON, typically because:
- ❌ The server is not running
- ❌ The API URL is incorrect
- ❌ The endpoint doesn't exist

---

## Solution Steps

### Step 1: Start the Backend Server
In a terminal, run:
```bash
npm run server:dev
```

You should see:
```
express server serving on port 5000
```

### Step 2: Verify Server is Running
Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"ok","message":"TakeItFree API is running"}
```

### Step 3: Check the Log Output
After improvements, the app will log API calls. Look for messages like:
```
[API] Using API URL: http://localhost:5000/api
[API] POST http://localhost:5000/api/auth/signup
[API] Response status: 201
```

### Step 4: For Web/Mobile Development

**For Expo Web:**
- The API URL will auto-detect as `${window.location.origin}/api`
- Make sure your backend is on the same origin or configure CORS

**For Expo Mobile (iOS/Android):**
- Update `lib/api.ts` with your machine's IP address:
```typescript
const API_URL = 'http://YOUR_MACHINE_IP:5000/api';
```

Or set via environment variable in `app.json`:
```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_MACHINE_IP:5000/api"
    }
  }
}
```

### Step 5: Configure for Your Environment

#### Development (localhost)
```typescript
// Works automatically in lib/api.ts
const API_URL = 'http://localhost:5000/api';
```

#### Local Network (Mobile Testing)
Find your IP:
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig | findstr IPv4
```

Update `lib/api.ts`:
```typescript
const API_URL = 'http://192.168.1.100:5000/api'; // Replace with your IP
```

#### Production
```typescript
const API_URL = 'https://api.takeitfree.com/api';
```

---

## Full Startup Commands

### Terminal 1: Backend Server
```bash
npm run server:dev
```

### Terminal 2: Expo Development
```bash
npm run expo:dev
```

Or for specific platform:
```bash
npm start -- --ios
npm start -- --android
npm start -- --web
```

---

## Database Setup

If you get errors about missing database:

```bash
# Create migrations
npm run db:push

# Or if tables already exist, just ensure DATABASE_URL is set
export DATABASE_URL="postgresql://user:password@localhost:5432/takeitfree"
```

---

## Common Issues

### Issue 1: "Network error - unable to reach API"
**Solution:** Backend server isn't running. Run `npm run server:dev`

### Issue 2: "Server error: 404"
**Solution:** Check the endpoint URL is correct in `lib/api.ts`

### Issue 3: "Username already exists"
**Solution:** This is correct behavior. Try a different username.

### Issue 4: "Invalid JSON response"
**Solution:** Backend might have crashed. Check server logs and restart.

### Issue 5: CORS errors (web version)
**Solution:** Check CORS configuration in `server/index.ts` setupCors function

---

## Debug: Check Logs

### Frontend Logs
```typescript
// Look for [API] prefix messages in console
[API] Using API URL: http://localhost:5000/api
[API] POST http://localhost:5000/api/auth/signup
[API] Response status: 201 {"id":"user-123"}
```

### Backend Logs
```typescript
POST /api/auth/signup 201 in 45ms
```

---

## Advanced: Environment Variables

Create `.env.local`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/takeitfree
NODE_ENV=development
PORT=5000
```

Load with:
```bash
# On .env file, restart your server
npm run server:dev
```

---

## Quick Checklist
- [ ] Backend server running (`npm run server:dev`)
- [ ] API_URL points to correct server
- [ ] Running `npm run expo:dev` in another terminal
- [ ] Check browser/device network tab for actual response
- [ ] DATABASE_URL is set correctly
- [ ] Port 5000 is not blocked by firewall

---

## Still Having Issues?

1. **Check exact error message** - Now shows in alert box
2. **Check console logs** - Look for `[API]` tagged logs
3. **Check server response** - In Network tab of browser dev tools
4. **Restart everything** - Kill both server and Expo, start fresh

---

## Success Indicators
✅ Server running on port 5000
✅ Health check returns JSON
✅ Signup shows username validation error (if exists)
✅ New signup succeeds and redirects to home
