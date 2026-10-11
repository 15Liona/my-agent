"use server";

import { hash } from "bcryptjs";
import { signIn, signOut } from "./auth";
import { normalizeEmail, savePassword } from "./users";

export async function signOutAction(){
    return await signOut();
}

export async function signInWithGoogle(){
    await signIn("google", {redirectTo: "/"});
}

export async function emailAuth(
    _prev: {error?: string},
    formData: FormData){
        const normalizedEmail = normalizeEmail(formData.get("email") as string);
        const password = formData.get("password") as string;
        const passwordHash = await hash(password, 10);

        if(!normalizedEmail || !password){
            return {error: "Invalid email or password"}
        }

        try {
            const prepared = await savePassword(
                normalizedEmail,
                password,
                passwordHash,
            );

            if(prepared) return prepared;

            await signIn("credentials", {
                email: normalizedEmail,
                password: password,
                redirectTo: "/",
            });
        } catch (error) {
            console.error(error || "failed to create user");
            return {error: "Failed to create user"};
        }
    }