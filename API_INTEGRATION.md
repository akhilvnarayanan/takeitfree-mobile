# API Integration Guide

## Overview
The TakeItFree app now has full API integration with error handling and validation. All backend endpoints are defined, and the frontend is configured to communicate with them.

## API Client Setup

### Location: `lib/api.ts`
- Centralized API client with typed endpoints
- Automatic error handling with `ApiError` class
- Configurable base URL from environment variables
- All requests include proper headers and error recovery

### Usage in Components:
```typescript
import { api, ApiError } from '@/lib/api';

try {
  const user = await api.signin({ username: 'user', password: 'pass' });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error (${error.code}): ${error.message}`);
  }
}
```

---

## Implemented API Endpoints

### Authentication (`/api/auth`)
✅ **IMPLEMENTED**

#### POST `/api/auth/signup`
- Creates new user account
- Request: `{ username: string, password: string }`
- Response: User object with `id`
- Error: 409 if username exists, 400 if missing fields

#### POST `/api/auth/signin`
- Authenticates user
- Request: `{ username: string, password: string }`
- Response: User object
- Error: 401 for invalid credentials, 400 for missing fields

#### 🔄 TODO: Phone OTP Routes
- `/api/auth/send-otp` - Send OTP to phone number
- `/api/auth/verify-otp` - Verify OTP code
- Requires: Twilio or similar SMS service

#### 🔄 TODO: Social Auth Routes
- `/api/auth/social` - OAuth provider integration
- Requires: Google/Apple OAuth setup

---

### User Profile (`/api/users`)
✅ **IMPLEMENTED**

#### GET `/api/users/:userId`
- Fetches user profile
- Response: User object
- Error: 404 if user not found

---

### Chats (`/api/chats`)
✅ **IMPLEMENTED**

#### POST `/api/chats`
- Creates new chat
- Request: `{ participantOneId, participantTwoId, itemId? }`
- Response: Chat object with id and createdAt

#### GET `/api/chats/:chatId`
- Fetches chat details
- Response: Chat object

#### GET `/api/chats/:chatId/messages`
- Fetches all messages in chat
- Response: `{ chatId, messages: [] }`

---

### Messages (`/api/messages`)
✅ **IMPLEMENTED**

#### POST `/api/messages`
- Sends new message
- Request: `{ chatId, senderId, content }`
- Response: Message object with id and timestamp

#### PATCH `/api/messages/:messageId/read`
- Marks message as read
- Response: `{ id, isRead: true }`

---

### Reports (`/api/reports`)
✅ **IMPLEMENTED**

#### POST `/api/reports`
- Creates user report
- Request: `{ reporterId, reportedUserId, reason, details? }`
- Response: Report object with status: "pending"
- Error: 400 for missing required fields

#### GET `/api/reports`
- Lists all reports (admin only)
- Response: `{ reports: [] }`

---

### Moments (`/api/moments`)
✅ **IMPLEMENTED**

#### POST `/api/moments/:momentId/comments`
- Adds comment to moment
- Request: `{ userId, content }`
- Response: Comment object with id and timestamp

#### DELETE `/api/moments/:momentId/comments/:commentId`
- Deletes moment comment
- Response: `{ id, momentId }`

#### POST `/api/moments/:momentId/appreciate`
- Adds appreciation/like to moment
- Request: `{ userId }`
- Response: Like object with id and timestamp

#### DELETE `/api/moments/:momentId/appreciate/:userId`
- Removes appreciation from moment
- Response: `{ momentId, userId }`

---

### Health Check
✅ **IMPLEMENTED**

#### GET `/api/health`
- API health check
- Response: `{ status: "ok", message: "TakeItFree API is running" }`

---

## Frontend Integration Points

### AppContext (`contexts/AppContext.tsx`)
Connected methods:
- ✅ `setupProfile()` - Calls `api.signup()`
- ✅ `addReport()` - Calls `api.createReport()`
- 🔄 `addMomentComment()` - TODO: Uncomment API call
- 🔄 `sendMessage()` - TODO: Uncomment API call

Local-only operations (can be extended with API):
- `addItem()` - Share item creation
- `addMoment()` - Moment creation
- `appreciateItem()` - Like items
- `appreciateMoment()` - Like moments
- Chat operations

### Authentication Screen (`app/auth.tsx`)
Connected handlers:
- ✅ `handleCreateAccount()` - Calls `api.signup()` before profile setup
- ✅ `handleEmailLogin()` - Calls `api.signin()`
- 🔄 `handleSocialAuth()` - TODO: Add OAuth provider integration
- 🔄 `handleSendOtp()` - TODO: Uncomment when phone OTP API ready
- 🔄 `handleVerifyOtp()` - TODO: Uncomment when phone OTP API ready

---

## Error Handling Pattern

All API calls follow this pattern:

```typescript
try {
  const response = await api.endpoint(data);
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    // API error with HTTP status code
    Alert.alert('Error', error.message);
  } else {
    // Network or other error
    Alert.alert('Error', 'An unexpected error occurred');
  }
}
```

---

## Database Integration

### Current Setup
- PostgreSQL database configured in `drizzle.config.ts`
- Drizzle ORM with proper type safety
- Database schema defined in `shared/schema.ts`
- Server storage using `DbStorage` class

### Tables Available
- `users` - User accounts with username/password
- `chats` - Chat conversations
- `messages` - Chat messages
- `userReports` - User reports/complaints
- `momentComments` - Comments on moments
- `momentLikes` - Appreciations/likes on moments

### Next Steps
1. Run migrations: `npm run db:push`
2. Test API endpoints with sample data
3. Implement remaining TODO endpoints

---

## Testing API Endpoints

### Using curl:
```bash
# Health check
curl http://localhost:5000/api/health

# Sign up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'

# Sign in
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"pass123"}'
```

### Run app in development:
```bash
npm run expo:dev      # Start Expo dev server
npm run server:dev    # Start backend in another terminal
```

---

## Security Considerations

⚠️ **Important**: This implementation is basic and production deployments need:

1. **Password Security**
   - Hash passwords with bcrypt, not plain text
   - Use proper authentication tokens (JWT)
   - Implement refresh token rotation

2. **API Authentication**
   - Add JWT token verification middleware
   - Implement role-based access control (RBAC)
   - Protect admin endpoints

3. **Data Validation**
   - Server-side validation for all inputs
   - Sanitize user inputs to prevent injection attacks
   - Rate limiting on auth endpoints

4. **HTTPS**
   - All API calls must use HTTPS in production
   - Use environment-specific configurations

5. **Environment Variables**
   - Never commit secrets to version control
   - Use `.env.local` for development
   - Use secure environment management in production

---

## Future Enhancements

- [ ] Implement phone OTP for SMS-based verification
- [ ] Add Google/Apple OAuth integration
- [ ] Create dedicated items/moments API tables
- [ ] Add image upload/download endpoints
- [ ] Implement push notifications API
- [ ] Add search/filter endpoints for discovery
- [ ] Implement real-time chat with WebSockets
- [ ] Add analytics endpoints
- [ ] Implement payment integration (if needed)
- [ ] Add user blocking/reporting moderation tools

---

## Troubleshooting

### API calls return 500 errors
- Check server logs: `npm run server:dev`
- Verify DATABASE_URL is set correctly
- Check network connectivity

### CORS errors
- Ensure CORS is properly configured in `server/index.ts`
- Check origin is whitelisted for development

### Signup fails with "username already exists"
- Username must be unique
- Try a different username

### Auth token issues
- Clear AsyncStorage: delete data from device
- Restart development server
- Check API_URL configuration in `lib/api.ts`
