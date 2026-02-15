# TakeItFree Deployment Guide

## Environment Variables Setup

Create a `.env.local` file in the project root with the following credentials:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Supabase Configuration

### 1. Database Schema
Run migrations to set up the database:
```bash
npm run db:push
```

The schema includes tables for:
- `users` - User profiles and authentication data
- `items` - Shared items/listings
- `moments` - User moments and sharing experiences
- `chats` - Direct messaging between users
- `messages` - Individual chat messages
- `user_reports` - User reporting/moderation
- `moment_comments` - Comments on moments
- `moment_likes` - Appreciation/likes on moments

### 2. Authentication Setup in Supabase

#### Google OAuth
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable "Google" provider
3. Add the following redirect URL:
   - `takeitfree://callback`
   - `https://urcpyazjvxjsghdkflca.supabase.co/auth/v1/callback`

#### Email/Password Auth
- Already enabled by default in Supabase

## Building for Test Deployment

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

### Web
```bash
npm run expo:static:build
```

## Running Locally

### Development Mode
```bash
npm start
```

### With Server
```bash
npm run server:dev
```

## Features Ready for Deployment

✅ User Authentication (Email, Phone, Google OAuth)
✅ Public User Profiles
✅ Item Sharing & Listings
✅ Direct Messaging
✅ Moments & Sharing Stories
✅ User Reporting System
✅ Moment Comments & Appreciation
✅ Request Management for Items

## Testing Checklist

- [ ] Sign up with email works
- [ ] Sign up with Google OAuth works
- [ ] User profile creation and editing works
- [ ] Item listing creation works
- [ ] View other user profiles (public profile page)
- [ ] Send/receive messages
- [ ] Create moments
- [ ] Comment on moments
- [ ] Appreciate items and moments
- [ ] Report users feature works
- [ ] Data persists across sessions

## Notes

- All seed/dummy data has been removed from the app
- App starts with empty data
- Users create their own content through the app interface
- Supabase handles all data persistence
- Google OAuth redirects back to app via deep linking
