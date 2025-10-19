import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import AzureADProvider from "next-auth/providers/azure-ad"

declare module "next-auth" {
  interface Session {
    accessToken?: string | null
    error?: string
    provider?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null
    refreshToken?: string | null
    accessTokenExpires?: number
    error?: string
    provider?: string
  }
}

// Token refresh helper for Microsoft OAuth
async function refreshAccessToken(token: any) {
  try {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("Error refreshing access token:", error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

// Export authOptions for server-side usage
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/gmail.readonly email profile openid",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: "common",
      authorization: {
        params: {
          scope: "openid profile email offline_access Mail.Read User.Read",
          prompt: "consent"
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account) {
        // Map provider: "google" -> "gmail", "azure-ad" -> "outlook"
        const provider = account.provider === "google" ? "gmail" : account.provider === "azure-ad" ? "outlook" : account.provider;
        
        return {
          ...token, // Preserve name, email, picture, sub, etc.
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000,
          provider: provider,
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token
      }

      // Access token has expired, try to refresh it
      console.log("Access token expired, refreshing...")
      return refreshAccessToken(token)
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.error = token.error
      session.provider = token.provider
      // Preserve user info in session
      if (token.name) session.user = { ...session.user, name: token.name as string }
      if (token.email) session.user = { ...session.user, email: token.email as string }
      if (token.picture) session.user = { ...session.user, image: token.picture as string }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }