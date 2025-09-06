'use server';
/**
 * @fileOverview An AI symptom checker that provides potential conditions and advice based on user input.
 *
 * - symptomChecker - A function that handles the symptom analysis process.
 * - SymptomCheckerInput - The input type for the symptomChecker function.
 * - SymptomCheckerOutput - The return type for the symptomChecker function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SymptomCheckerInputSchema = z.object({
  mainSymptom: z.string().describe('The primary symptom the user is experiencing.'),
  bodyPart: z.string().describe('The main body part affected.'),
  duration: z.string().describe('How long the user has been experiencing the symptom.'),
  severity: z.enum(['Mild', 'Moderate', 'Severe']).describe('The severity of the symptom.'),
  additionalSymptoms: z.array(z.string()).describe('A list of any other symptoms the user has.'),
  additionalInfo: z.string().optional().describe('Any other relevant information the user provides.'),
});
export type SymptomCheckerInput = z.infer<typeof SymptomCheckerInputSchema>;

export const SymptomCheckerOutputSchema = z.object({
  possibleConditions: z.array(z.string()).describe('A list of 2-4 possible conditions based on the symptoms.'),
  recommendations: z.array(z.string()).describe('Practical next steps for the user to take (e.g., rest, hydration).'),
  whenToSeekHelp: z.array(z.string()).describe('Red flag symptoms or conditions that warrant seeking immediate medical help.'),
  goodHealthAdvice: z.string().describe('General wellness guidance that is relevant to the user\'s symptoms.'),
});
export type SymptomCheckerOutput = z.infer<typeof SymptomCheckerOutputSchema>;

export async function symptomChecker(input: SymptomCheckerInput): Promise<SymptomCheckerOutput> {
  return symptomCheckerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'symptomCheckerPrompt',
  input: { schema: SymptomCheckerInputSchema },
  output: { schema: SymptomCheckerOutputSchema },
  prompt: `You are a helpful AI medical assistant. Analyze the following symptoms provided by a user and generate a helpful response. This is not a medical diagnosis.

User's Symptoms:
- Main Symptom: {{mainSymptom}}
- Affected Body Part: {{bodyPart}}
- Duration: {{duration}}
- Severity: {{severity}}
- Additional Symptoms: {{#each additionalSymptoms}}- {{this}} {{/each}}
- Additional Information: {{additionalInfo}}

Based on this information, provide the following:
1.  **Possible Conditions**: List 2-4 potential, non-emergency conditions that could cause these symptoms. Do not provide a definitive diagnosis.
2.  **Recommendations**: Suggest practical, non-pharmaceutical advice for managing the symptoms at home.
3.  **When to Seek Medical Help**: Clearly state specific "red flag" scenarios that would require immediate medical attention (e.g., difficulty breathing, severe pain).
4.  **Good Health Advice**: Offer a piece of general, relevant health advice.`,
});

const symptomCheckerFlow = ai.defineFlow(
  {
    name: 'symptomCheckerFlow',
    inputSchema: SymptomCheckerInputSchema,
    outputSchema: SymptomCheckerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
