import { z } from 'zod';
const amount=z.string().regex(/^\d{1,12}(\.\d{1,2})?$/,'Use a non-negative BDT amount with at most two decimals');
export const assessmentSchema=z.object({
  incomeSource:z.object({monthlyIncome:amount.optional(),monthlyExpense:amount.optional(),monthlyDebtPayment:amount.optional(),stability:z.enum(['STABLE','SEASONAL','IRREGULAR']).optional()}).strict().optional(),
  socialAcceptance:z.object({rating:z.number().int().min(1).max(10).optional()}).strict().optional(),
  houseInfrastructure:z.object({structure:z.enum(['DURABLE','SEMI_DURABLE','TEMPORARY']).optional(),condition:z.enum(['GOOD','FAIR','POOR']).optional(),basicUtilities:z.boolean().optional()}).strict().optional(),
}).strict();
