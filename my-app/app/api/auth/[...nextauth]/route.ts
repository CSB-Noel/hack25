import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

declare module "next-auth" {
  interface Session {
    accessToken?: string | null;
    refreshToken?: string | null;
    provider?: "gmail" | "outlook";
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpires?: number;
    provider?: "gmail" | "outlook";
    error?: string;
  }
}

// ----------------------------
// 🔁 Microsoft Token Refresh
// ----------------------------
async function refreshMicrosoftAccessToken(token: any) {
  try {
    const url = `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.AZURE_AD_CLIENT_ID!,
        client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) throw refreshedTokens;

    console.log("🔄 Microsoft token refreshed successfully");

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("❌ Error refreshing Microsoft access token:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// ----------------------------
// ⚙️ NextAuth Configuration
// ----------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    // ---- Gmail ----
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

    // ---- Outlook ----
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: "common",
      authorization: {
        params: {
          scope: "openid profile email offline_access Mail.Read User.Read",
          prompt: "consent",
        },
      },
    }),
  ],

  callbacks: {
    // ----------------------------
    // 🧠 Handle JWT Lifecycle
    // ----------------------------
    async jwt({ token, account }) {
      // Initial sign-in
      if (account) {
        token.provider = account.provider === "google" ? "gmail" : "outlook";
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : Date.now() + 3600 * 1000;
        return token;
      }

      // Still valid
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh if expired and provider is Outlook
      if (token.provider === "outlook") {
        console.log("🔁 Refreshing Outlook token...");
        return refreshMicrosoftAccessToken(token);
      }

      // Google tokens typically refresh automatically with NextAuth
      console.log("⚠️ Google token expired — user may need to re-authenticate");
      return token;
    },

    // ----------------------------
    // 🧩 Inject into Session + Trigger AI
    // ----------------------------
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      session.error = token.error;

      // Automatically trigger AI processing once session is ready
      try {
        if (session.accessToken && session.provider) {
          fetch(`${process.env.NEXTAUTH_URL}/api/ai-process`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            body: JSON.stringify({
              provider: session.provider,
              maxResults: 10,
            }),
          }).catch(console.error);
        }
      } catch (err) {
        console.error("❌ Error auto-triggering AI process:", err);
      }

      return session;
    },
  },

  pages: {
    signIn: "/login", // optional custom login page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };