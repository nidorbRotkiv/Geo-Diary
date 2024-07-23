import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth/jwt" {
  interface JWT {
    idToken?: string;
  }
}

declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}
const MILLISECONDS_IN_SECOND = 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60;
const THIRTY_DAYS = 30 * 24 * 60 * 60;

const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    jwt: async ({ token, account }) => {
      const maxAge = THIRTY_DAYS;
      token.exp = Math.floor(Date.now() / MILLISECONDS_IN_SECOND) + maxAge;
      if (account?.id_token && typeof account.id_token === "string") {
        token.idToken = account.id_token;
      }
      return token;
    },
    session: async ({ session, token }) => {
      const maxAge = THIRTY_DAYS;
      session.expires = new Date(Date.now() + maxAge * MILLISECONDS_IN_SECOND).toISOString();
      if (token.idToken) {
        session.idToken = token.idToken;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        return allowedEmails.includes(user.email);
      }
      return false;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: THIRTY_DAYS,
    updateAge: TWENTY_FOUR_HOURS,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: THIRTY_DAYS,
  },
};
