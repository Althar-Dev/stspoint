'use server';
/**
 * @fileOverview An AI-powered support guide for troubleshooting payment errors on STSPoint.
 *
 * - troubleshootPayment - A function that handles the payment troubleshooting process.
 * - AiSupportTroubleshooterInput - The input type for the troubleshootPayment function.
 * - AiSupportTroubleshooterOutput - The return type for the troubleshootPayment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiSupportTroubleshooterInputSchema = z.object({
  orderId: z.string().describe('The unique identifier for the user\'s order.'),
  errorMessage: z.string().describe('The specific error message encountered by the user during payment.'),
  paymentMethod: z.string().optional().describe('The payment method used for the transaction, if known.'),
  transactionStatus: z.string().optional().describe('The current status of the transaction, if available.'),
});
export type AiSupportTroubleshooterInput = z.infer<typeof AiSupportTroubleshooterInputSchema>;

const AiSupportTroubleshooterOutputSchema = z.object({
  troubleshootingSteps: z
    .array(z.string())
    .describe('A list of actionable steps the user can take to resolve the issue.'),
  isResolved: z
    .boolean()
    .describe(
      'True if the AI believes the issue can be resolved by the provided steps, false if further action (e.g., human intervention) might be needed.'
    ),
  additionalInfo: z
    .string()
    .optional()
    .describe('Any additional information, tips, or links relevant to the issue.'),
});
export type AiSupportTroubleshooterOutput = z.infer<typeof AiSupportTroubleshooterOutputSchema>;

export async function troubleshootPayment(
  input: AiSupportTroubleshooterInput
): Promise<AiSupportTroubleshooterOutput> {
  return aiSupportTroubleshooterFlow(input);
}

const aiSupportTroubleshooterPrompt = ai.definePrompt({
  name: 'aiSupportTroubleshooterPrompt',
  input: {schema: AiSupportTroubleshooterInputSchema},
  output: {schema: AiSupportTroubleshooterOutputSchema},
  prompt: `You are an intelligent AI support guide specializing in payment issues for STSPoint.
Your goal is to help users resolve common payment errors quickly and efficiently without human intervention.

Analyze the provided order details and error message to identify the root cause and provide clear, actionable troubleshooting steps.

Order ID: {{{orderId}}}
Error Message: {{{errorMessage}}}
{{#if paymentMethod}}Payment Method: {{{paymentMethod}}}{{/if}}
{{#if transactionStatus}}Transaction Status: {{{transactionStatus}}}{{応募}}}{{/if}}

Provide your response as a JSON object, strictly following the specified output schema. Respond in Indonesian language to match the brand's primary audience.

Think step-by-step. First, identify potential causes for the '{{{errorMessage}}}' given the '{{{orderId}}}' and any other provided details.
Then, formulate a list of specific, numbered troubleshooting steps the user can follow.
Finally, determine if these steps are likely to resolve the issue (isResolved: true) or if the user might need to contact human support (isResolved: false), and provide any 'additionalInfo' if necessary.`,
});

const aiSupportTroubleshooterFlow = ai.defineFlow(
  {
    name: 'aiSupportTroubleshooterFlow',
    inputSchema: AiSupportTroubleshooterInputSchema,
    outputSchema: AiSupportTroubleshooterOutputSchema,
  },
  async input => {
    const {output} = await aiSupportTroubleshooterPrompt(input);
    return output!;
  }
);
