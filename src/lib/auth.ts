import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

// Custom Google OAuth provider without OIDC discovery
const CustomGoogleProvider = {
    id: "google",
    name: "Google",
    type: "oauth" as const,
    authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
            scope: "openid email profile",
            response_type: "code",
        }
    },
    token: {
        url: "https://oauth2.googleapis.com/token",
    },
    userinfo: {
        url: "https://openidconnect.googleapis.com/v1/userinfo",
    },
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    profile(profile: {
        sub: string;
        name: string;
        email: string;
        picture: string;
    }) {
        return {
            id: profile.sub,
            name: profile.name,
            email: profile.email,
            image: profile.picture,
        }
    },
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as NextAuthOptions['adapter'],
    providers: [
        CustomGoogleProvider,
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // When user signs in, get the user id
            if (user) {
                token.id = user.id
            }
            // If using adapter, user.id might not be available on subsequent calls
            // So we also check if we already have the id in the token
            if (account && !token.id) {
                // Fetch user from database by email
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email! },
                    select: { id: true }
                })
                if (dbUser) {
                    token.id = dbUser.id
                }
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
                // Fetch user coins
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
        },
    },
    events: {
        async createUser({ user }) {
            // Give new users 50 bonus coins with 1 month expiry
            const oneMonthFromNow = new Date()
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1)

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    coins: 50,
                    coinsExpireAt: oneMonthFromNow,
                }
            })

            // Record the bonus transaction
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: 'bonus',
                    amount: 50,
                    description: 'Welcome bonus - 50 coins for new user'
                }
            })
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    debug: process.env.NODE_ENV === 'development',
}
