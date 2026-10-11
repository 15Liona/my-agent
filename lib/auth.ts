import { getMongoCollection } from "./mongodb";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { verifyPassword } from "./users";

export const {auth, handlers, signIn, signOut} = NextAuth({
    secret: process.env.AUTH_SECRET,
    session: {strategy: "jwt"}, 
    providers: [
    Google({
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    Credentials({
        credentials: {
            email: {type: "email"},
            password: {type: "password"}
        },

        async authorize(credentials) {
            const {email, password} = credentials as {
                email: string;
                password: string;
            };
            if(!email || !password) {
                throw new Error("Invalid credentials")
            };

            const user = await verifyPassword(email, password);

            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                image: user.image,
            };
        },
    }),
],

    pages: {
        signIn: "/login",
        signOut: "/logout",
    },

    events: {
        async signIn({user}){
            if(!user.email) return;

            try {
                const users = await getMongoCollection("users")
                await users.updateOne(
                    {email: user.email},
                    {$set: {name: user.name, image: user.image}},
                    {upsert: true},
                );
            } catch (error) {
                console.error(error || "Failed to update user");
                throw new Error("Failed to update user")
            }
        },
    },
});