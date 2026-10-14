export class Inquiry {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  timestamp?: Date;
  referrer?: any;
  tracking?: any;
  recaptcha?: string;
}

// export class inquiryValidation {
//   static inquirySchema = joi.object({
//     name: joi.string().max(200).required(),
//     email: joi.string().email().max(100).required(),
//     phone: joi.string().required(),
//     message: joi.string().required(),
//     recaptcha: joi.string().required(),
//   });
// }
