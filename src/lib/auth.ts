import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) token.id = user.id

            if (account && !token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email! },
                    select: { id: true }
                })
                if (dbUser) token.id = dbUser.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string

                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id as string },
                    select: { coins: true, coinsExpireAt: true }
                })
                if (dbUser) {
                    session.user.coins = dbUser.coins
                    session.user.coinsExpireAt = dbUser.coinsExpireAt
                }
            }
            return session
        }
    },
    events: {
        async createUser({ user }) {
            const expire = new Date()
            expire.setMonth(expire.getMonth() + 1)

            await prisma.user.update({
                where: { id: user.id },
                data: { coins: 40, coinsExpireAt: expire }
            })

            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: "bonus",
                    amount: 40,
                    description: "Welcome bonus coins"
                }
            })
        }
    },
    pages: { signIn: "/auth/signin" },
    debug: process.env.NODE_ENV === "development",
}
