import {compare, hash} from "bcryptjs";
import { getMongoCollection, getMongoDb, getMongoClient } from "./mongodb";

export type userDoc = {
    name: string;
    email: string;
    image: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
};

export function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export async function userCollection() {
    const db = await getMongoDb();
    return db.collection<userDoc>("users");
}

export async function findUserByEmail(email: string) {
    const normalized = normalizeEmail(email);
    const users = await userCollection();
    const found = await users.findOne({ email: normalized});
    if(found) return found;
    return null;

    const db = await getMongoDb();
    if(db.databaseName == "agent-db") return null;

    const client = await getMongoClient();
    return client
    .db("agent-db")
    .collection<userDoc>("users")
    .findOne({email: normalized});
}

export async function savePassword(email: string, passwordHash: string, password:string) {
    const normalized = normalizeEmail(email);
    const users = await userCollection();
    const existing = await findUserByEmail(email);
    
    if(existing){
        return new Error("USER_ALREADY_EXIST");
    }

    if(passwordHash.length < 8){
    throw new Error("password must be at least 8 characters long");
    }

    if(!compare(password, passwordHash)){
        throw new Error("Invalid password");
    }

    return await users.insertOne({
        name: "",
        image: "",
        email: normalized,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
    });

}


export async function verifyPassword(email:string, password: string) {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error ("User not found");
    }
    
    if (!compare(password, user.passwordHash)) {
        throw new Error ("invalid password");
    }

    return user;
}