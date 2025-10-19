// Alternative NextAuth configuration for personal Microsoft accounts
// Replace the AzureADProvider section with this if "common" tenant doesn't work

import MicrosoftProvider from "next-auth/providers/microsoft"

// In your providers array, replace AzureADProvider with:
MicrosoftProvider({
  clientId: process.env.AZURE_AD_CLIENT_ID!,
  clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
  authorization: {
    params: {
      scope: "openid profile email offline_access Mail.Read User.Read",
      prompt: "consent"
    }
  },
})

// MicrosoftProvider automatically uses "common" tenant for personal accounts
// This is better for @outlook.com, @hotmail.com, @live.com accounts
