"use server";

import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./config";
import { cookies } from "next/headers";
import { User } from 'firebase/auth';

export async function signIn(email: string) {
  const auth = getAuth(app);
  try {
    const password = Math.random().toString(36).slice(-8);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    const token = await userCredential.user.getIdToken();
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    
    return { user: userCredential.user };
  } catch (error: any) {
    console.error("Firebase signIn error:", error.code, error.message);
    if (error.code === 'auth/email-already-in-use') {
        return { error: 'This email is already registered. Please use a different email.' };
    }
    return { error: 'An unexpected error occurred during registration.' };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const auth = getAuth(app);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
