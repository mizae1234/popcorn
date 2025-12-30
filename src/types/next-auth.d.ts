import 'next-auth'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            coins?: number
            coinsExpireAt?: Date | null
        }
    }

    interface User {
        id: string
        coins?: number
        coinsExpireAt?: Date | null
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string
    }
}
