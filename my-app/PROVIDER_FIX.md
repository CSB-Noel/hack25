# Provider Detection Fix Summary

## Issues Fixed

### 1. **Supabase Import Error**
- **Problem**: `supabase` was imported from `@/lib/supabase-server` but that file exports a function, not a client instance
- **Fix**: Changed to import `createSupabaseServerClient` and call it to get a client instance

### 2. **Provider Parameter Mismatch**
- **Problem**: Dashboard was passing the user's email address as the `provider` parameter
- **Fix**: Now correctly passes "gmail" or "outlook" based on which OAuth provider the user authenticated with

### 3. **Missing Provider Tracking**
- **Problem**: No way to know which OAuth provider (Google vs Azure AD) the user signed in with
- **Fix**: Added `provider` field to NextAuth session and JWT that stores "gmail" or "outlook"

## Changes Made

### `/app/api/auth/[...nextauth]/route.ts`
- Added `provider?: string` to Session and JWT interfaces
- JWT callback now maps `account.provider` to "gmail" or "outlook" and stores it in the token
- Session callback exposes the provider in `session.provider`

### `/app/api/ai-process/route.ts`
- Changed import from `supabase` to `createSupabaseServerClient`
- Added `const supabase = createSupabaseServerClient()` before using it (2 places)

### `/components/dashboard.tsx`
- Changed provider detection logic from email pattern matching to using `session.provider`
- Now correctly passes "gmail" or "outlook" to the API

## How It Works Now

1. User signs in with Google or Azure AD
2. NextAuth stores the provider ("gmail" or "outlook") in the JWT token
3. Dashboard reads `session.provider` and passes it to `/api/ai-process`
4. API uses the correct service (GmailService or OutlookService) based on the provider

## Next Steps for User

**You must sign out and sign back in** for the provider tracking to work:

```
1. Go to: http://localhost:3000/api/auth/signout
2. Sign in again: http://localhost:3000/api/auth/signin
3. Choose your provider (Google or Azure AD)
```

After re-authenticating, the provider will be correctly tracked and the API will know which email service to use!
