"use server";

import { generateResourceSummary } from "@/ai/flows/generate-resource-summary";
import { signIn, getCurrentUser } from "@/lib/firebase/auth";
import { addUser, updateUserRole as updateUserRoleInDb } from "@/lib/firebase/firestore";
import { redirect } from "next/navigation";
import { z } from "zod";

const resourceSummarySchema = z.object({
  resourceName: z.string(),
  resourceDescription: z.string(),
  resourceLink: z.string(),
});

export async function getResourceSummary(formData: FormData) {
  const validatedFields = resourceSummarySchema.safeParse({
    resourceName: formData.get("resourceName"),
    resourceDescription: formData.get("resourceDescription"),
    resourceLink: formData.get("resourceLink"),
  });

  if (!validatedFields.success) {
    return { error: "Invalid input." };
  }

  try {
    const result = await generateResourceSummary(validatedFields.data);
    return { summary: result.summary };
  } catch (error) {
    console.error("Error generating resource summary:", error);
    return { error: "Failed to generate summary. Please try again." };
  }
}

const authSchema = z.object({
  fullName: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  dob: z.coerce.date({
    required_error: "A date of birth is required.",
    invalid_type_error: "That's not a valid date!",
  }),
});

function calculateAge(dob: Date) {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

export async function registerUser(formData: FormData) {
  const validatedFields = authSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { dob, ...restOfData } = validatedFields.data;
  const age = calculateAge(dob);

  if (age < 1) {
      return { error: "Age must be a positive number." };
  }

  try {
    const tempPassword = Math.random().toString(36).slice(-8);
    const userCredential = await signIn(validatedFields.data.email, tempPassword);
    
    if (userCredential.error || !userCredential.user) {
       return { error: userCredential.error || "Failed to create user." };
    }

    const userData = {
      uid: userCredential.user.uid,
      fullName: restOfData.fullName,
      email: restOfData.email,
      phone: restOfData.phone,
      age: age,
    };

    await addUser(userData);

  } catch (error) {
    console.error("Error during registration:", error);
    if (error instanceof Error && error.message.includes('auth/email-already-in-use')) {
        return { error: "This email is already registered. Please use a different email." };
    }
    return { error: "Registration failed. Please try again." };
  }

  redirect('/role-selection');
}

const roleSchema = z.object({
  role: z.enum(['patient', 'doctor', 'pharmacy']),
});

export async function updateUserRole(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'You must be logged in to select a role.' };
  }

  const validatedFields = roleSchema.safeParse({
    role: formData.get('role'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid role selected.' };
  }

  try {
    await updateUserRoleInDb(user.uid, validatedFields.data.role);
  } catch (error) {
    console.error('Error updating user role:', error);
    return { error: 'Failed to update role. Please try again.' };
  }

  redirect(`/${validatedFields.data.role}`);
}
