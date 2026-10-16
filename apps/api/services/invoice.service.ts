import { Invoice } from '../models/invoice';
import { getAccount } from './account.service';

export const addInvoice = async (env: CloudflareBindings, invoice: Invoice) => {
  const account = await getAccount(env, invoice.account_id);
  invoice.billing_name = account.billing_name;
  invoice.billing_address = account.billing_address;
  invoice.country = account.country;
  invoice.tax_name = account.tax_name;
  invoice.tax_number = account.tax_number;

  invoice.initial = 'IDM';
  const r = await fetch(
    `https://api.agenty.com/v2/admin/invoices?apiKey=${env.AGENTY_KEY}`,
    {
      method: 'POST',
      body: JSON.stringify(invoice),
      headers: {
        'content-type': 'application/json',
      },
    }
  );

  return r.status;
};
