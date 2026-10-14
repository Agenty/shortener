import { z } from 'zod';

export class Upgrade {
  plan?: string = 'Basic';
  frequency: string = 'month';
  currency: string = 'USD';
  price: number = 7;
  total: number = 1;
}

const PlanEnum = z.enum(['Basic', 'Pro', 'Business', 'Lifetime']);
const CurrencyEnum = z.enum(['USD', 'INR']);
const FrequencyEnum = z.enum(['month', 'year']);

export const upgradeSchema = z.object({
  plan: PlanEnum.default('Basic'),
  currency: CurrencyEnum.default('USD'),
  price: z.number().min(7, 'Invalid plan'),
  frequency: FrequencyEnum.default('month'),
});
