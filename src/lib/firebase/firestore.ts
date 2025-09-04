"use server";

import { getFirestore, doc, setDoc, updateDoc } from "firebase/firestore";
import { app } from "./config";

const db = getFirestore(app);

interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
}

export async function addUser(userData: UserData) {
  try {
    await setDoc(doc(db, "users", userData.uid), {
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone,
      age: userData.age,
      role: null, // Initially role is not set
    });
  } catch (error) {
    console.error("Error adding user to Firestore: ", error);
    throw new Error("Could not add user data.");
  }
}

export async function updateUserRole(uid: string, role: 'patient' | 'doctor' | 'pharmacy') {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      role: role,
    });
  } catch (error) {
    console.error("Error updating user role in Firestore: ", error);
    throw new Error("Could not update user role.");
  }
}