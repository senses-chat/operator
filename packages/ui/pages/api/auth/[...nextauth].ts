import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from '@senses-chat/operator-database';
import AuthingProvider from 'utils/authingProvider';

const prisma = new PrismaClient();

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    // // Choose how you want to save the user session.
    // // The default is `"jwt"`, an encrypted JWT (JWE) in the session cookie.
    // // If you use an `adapter` however, we default it to `"database"` instead.
    // // You can still force a JWT session by explicitly defining `"jwt"`.
    // // When using `"database"`, the session cookie will only contain a `sessionToken` value,
    // // which is used to look up the session in the database.
    strategy: "jwt",

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours
  },
  theme: {
    colorScheme: 'light',
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    process.env.NODE_ENV === 'development' && CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize(credentials, req) {
        if (process.env.NEXTAUTH_USERNAME && process.env.NEXTAUTH_PASSWORD && credentials.username === process.env.NEXTAUTH_USERNAME && credentials.password === process.env.NEXTAUTH_PASSWORD) {
          return { id: 'admin', name: 'admin' };
        }

        throw new Error('Username or Password wrong');
      },
    }),
    AuthingProvider({
      appId: process.env.AUTHING_APP_ID,
      appHost: process.env.AUTHING_APP_HOST,
      redirectUri: process.env.AUTHING_REDIRECT_URI,
      wellKnown: process.env.AUTHING_WELKNOWN,
      secret: process.env.AUTHING_SECRET,
    }),
  ],
})