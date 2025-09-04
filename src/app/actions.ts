"use server";

import { generateResourceSummary } from "@/ai/flows/generate-resource-summary";
import { signIn } from "@/lib/firebase/auth";
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
  age: z.coerce.number().min(1, { message: 'Age must be a positive number.' }),
});

export async function registerUser(formData: FormData) {
  const validatedFields = authSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    // In a real app, you would use a password or an OTP from the client.
    // For this example, we'll use a placeholder password.
    const tempPassword = Math.random().toString(36).slice(-8);
    const userCredential = await signIn(validatedFields.data.email, tempPassword);
    
    if (userCredential.error) {
       return { error: userCredential.error };
    }

    // Here you would typically save the additional user data (fullName, phone, age)
    // to Firestore or another database, linked to the user's UID.
    console.log("User registered successfully:", userCredential.user?.uid);
    console.log("Additional data to save:", validatedFields.data);

    return { success: "Registration successful! Ready for EHR setup." };
  } catch (error) {
    console.error("Error during registration:", error);
    return { error: "Registration failed. Please try again." };
  }
}
