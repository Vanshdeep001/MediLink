"use server";

import { generateResourceSummary } from "@/ai/flows/generate-resource-summary";
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
