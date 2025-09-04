"use server";

import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

export async function signIn(email: string, password_not_used: string) {
  try {
    // In a real app, you would use the password from the client.
    // For this example, we'll use a placeholder password.
    const password = Math.random().toString(36).slice(-8);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: any) {
    return { error: error.message };
  }
}
