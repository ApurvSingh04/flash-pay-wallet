import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
    phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-aut
          async authorize(credentials: any) {
            const parsedCredentials = credentialsSchema.safeParse(credentials);
            if (!parsedCredentials.success) {
                console.error("Invalid credentials format", parsedCredentials.error.format());
                return null;
            }

            const { phone, password } = parsedCredentials.data;

            const existingUser = await db.user.findFirst({
                where: {
                    number: phone
                }
            });

            if (existingUser) {
                const passwordValidation = await bcrypt.compare(password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.number
                    }
                }
                return null;
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                const user = await db.user.create({
                    data: {
                        number: phone,
                        password: hashedPassword,
                        Balance: {
                            create: {
                                amount: 0,
                                locked: 0
                            }
                        }
                    }
                });
            
                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.number
                }
            } catch(e) {
                console.error(e);
            }

            return null
          },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? (() => { throw new Error("NEXTAUTH_SECRET environment variable is not set"); })(),
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub
            return session
        }
    },
    pages: {
        signIn: '/login'
    }
  }
  