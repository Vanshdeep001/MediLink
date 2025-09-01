'use server';

/**
 * @fileOverview Generates a smart summary of healthcare resources, highlighting connections between patients, doctors, pharmacies, and ambulances.
 *
 * - generateResourceSummary - A function that generates the resource summary.
 * - GenerateResourceSummaryInput - The input type for the generateResourceSummary function.
 * - GenerateResourceSummaryOutput - The return type for the generateResourceSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateResourceSummaryInputSchema = z.object({
  resourceDescription: z
    .string()
    .describe('The description of the healthcare resource.'),
  resourceName: z.string().describe('The name of the healthcare resource.'),
  resourceLink: z.string().describe('Link to the resource.'),
});
export type GenerateResourceSummaryInput = z.infer<
  typeof GenerateResourceSummaryInputSchema
>;

const GenerateResourceSummaryOutputSchema = z.object({
  summary: z.string().describe('A smart summary of the healthcare resource.'),
});
export type GenerateResourceSummaryOutput = z.infer<
  typeof GenerateResourceSummaryOutputSchema
>;

export async function generateResourceSummary(
  input: GenerateResourceSummaryInput
): Promise<GenerateResourceSummaryOutput> {
  return generateResourceSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResourceSummaryPrompt',
  input: {schema: GenerateResourceSummaryInputSchema},
  output: {schema: GenerateResourceSummaryOutputSchema},
  prompt: `You are an expert in healthcare resource summarization. Your task is to create a concise and informative summary of a given healthcare resource, explaining how it connects patients, doctors, pharmacies, and ambulances. Provide clear links for more details.

Resource Name: {{resourceName}}
Resource Description: {{resourceDescription}}
Resource Link: {{resourceLink}}

Summary:`,
});

const generateResourceSummaryFlow = ai.defineFlow(
  {
    name: 'generateResourceSummaryFlow',
    inputSchema: GenerateResourceSummaryInputSchema,
    outputSchema: GenerateResourceSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
