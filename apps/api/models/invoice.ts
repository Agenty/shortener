export interface InvoiceItem {
  item_id?: number;
  invoice_id?: number;
  product_id?: string;
  product_name?: string;
  product_description?: string;
  unit_price?: number;
  quantity?: number;
  total?: number;
}

export class Invoice {
  invoice_id?: number;
  initial: string;
  invoice_number?: string;
  account_id?: number;
  user_id?: number;
  subscription_id?: number;
  amount_paid?: number;
  sub_total?: number;
  total?: number;
  balance_due?: number;
  currency?: string;
  tax_inclusive?: boolean;
  tax_percent?: number;
  tax_amount?: number;
  status?: string;
  created_at?: Date;
  paid_at?: Date | string;
  period_start_at?: Date | string;
  period_end_at?: Date | string;
  payment_gateway?: string;
  transaction_id?: string;
  transaction_fee?: number;
  billing_name?: string;
  billing_address?: string;
  country?: string;
  tax_name?: string;
  tax_number?: string;
  items?: Array<InvoiceItem>;
}
