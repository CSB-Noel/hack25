# Outlook API Fix - Token Refresh Implementation

## What Was Fixed

The "Unauthorized" error from Microsoft Graph API was caused by **expired access tokens**. Microsoft OAuth tokens typically expire after 1 hour, and your application wasn't refreshing them.

### Changes Made

1. **Updated NextAuth Configuration** (`app/api/auth/[...nextauth]/route.ts`)
   - Added `refreshToken` and `accessTokenExpires` to JWT token interface
   - Implemented `refreshAccessToken()` function to refresh expired tokens
   - Updated JWT callback to automatically refresh tokens when they expire
   - Added error handling for failed token refresh

2. **Enhanced Outlook API Route** (`app/api/outlook/route.ts`)
   - Added check for token refresh errors
   - Better error messages for expired tokens
   - User will be prompted to re-authenticate if refresh fails

3. **Improved Error Logging** (`lib/outlook-service.ts`)
   - Better error messages from Microsoft Graph API
   - More detailed logging for debugging

## How It Works Now

1. **Initial Login**: User authenticates → access token & refresh token stored
2. **Normal Requests**: If token is still valid → use it
3. **Token Expired**: Automatically refresh using refresh token
4. **Refresh Failed**: User gets clear error message to sign in again

## Next Steps

### 1. Restart Your Development Server

The token refresh will only work for **new login sessions**. Current sessions still have the old token format.

```bash
# Stop the dev server (Ctrl+C if running)
npm run dev
```

### 2. Sign Out and Sign In Again

- Go to your app
- Sign out of your Microsoft account
- Sign in again
- The new session will have refresh tokens

### 3. Test the Fix

Try making API calls that previously failed. The tokens should now refresh automatically.

### 4. Environment Variables Check

Make sure these are set in your `.env.local`:

```env
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret
AZURE_AD_TENANT_ID=your_tenant_id
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

## Debugging

If you still get "Unauthorized" errors:

1. **Check Azure AD App Registration**:
   - Make sure `offline_access` scope is enabled (for refresh tokens)
   - Verify Mail.Read permissions are granted
   - Check if admin consent is required

2. **Check Console Logs**:
   - Look for "Access token expired, refreshing..." message
   - Check for any refresh errors

3. **Verify Token Scopes**:
   - The authorization params include: `offline_access`, `Mail.Read`, `User.Read`

## Common Issues

- **"RefreshAccessTokenError"**: User needs to sign out and sign in again
- **Missing refresh_token**: User signed in before the fix → needs to re-authenticate
- **Still getting Unauthorized**: Check Azure AD app permissions and admin consent

