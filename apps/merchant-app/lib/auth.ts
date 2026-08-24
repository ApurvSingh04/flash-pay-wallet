import GoogleProvider from "next-auth/providers/google";
import db from "@repo/db/client";
import type { AuthOptions } from "next-auth";

const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: AuthOptions = {
    cookies: {
        sessionToken: {
            name: `${cookiePrefix}merchant.session-token`,
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: useSecureCookies,
            },
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    callbacks: {
      async signIn({ user, account }) {
        if (!user || !user.email) {
          return false;
        }

        await db.merchant.upsert({
          select: {
            id: true
          },
          where: {
            email: user.email
          },
          create: {
            email: user.email,
            name: user.name || "",
            auth_type: account?.provider === "google" ? "Google" : "Github"
          },
          update: {
            name: user.name || "",
            auth_type: account?.provider === "google" ? "Google" : "Github"
          }
        });

        return true;
      },
      async session({ session, token }: any) {
        if (session.user?.email) {
            const merchant = await db.merchant.findUnique({
                where: { email: session.user.email }
            });
            if (merchant) {
                session.user.id = merchant.id.toString();
            }
        }
        return session;
      }
    },
    pages: {
        signIn: '/login'
    },
    secret: process.env.NEXTAUTH_SECRET ?? (() => { throw new Error("NEXTAUTH_SECRET environment variable is not set"); })()
  }