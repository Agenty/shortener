/**
 * Minimal request samples (required fields only) used as examples in the
 * generated OpenAPI docs
 */
export const API_SAMPLES = {
  auth: {
    signup: {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'S3cure-Pa55',
      recaptcha: '03AFcWeA4m...recaptcha-token',
    },
    signin: {
      email: 'jane@example.com',
      password: 'S3cure-Pa55',
    },
    forgotPassword: {
      email: 'jane@example.com',
    },
    resetPassword: {
      password: 'N3w-Pa55word',
      confirm_password: 'N3w-Pa55word',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
  },
  links: {
    post: {
      url: 'https://example.com/blog/url-shortener-guide',
    },
    put: {
      url: 'https://example.com/blog/url-shortener-guide?ref=update',
    },
  },
  projects: {
    post: {
      name: 'Summer campaign',
    },
    put: {
      name: 'Summer campaign 2026',
    },
  },
  domains: {
    post: {
      domain: 'example.com',
    },
    put: {
      is_default: true,
    },
    otp: {
      email: 'admin@example.com',
    },
    verify: {
      code: 123456,
    },
  },
  users: {
    post: {
      name: 'John Smith',
      email: 'john@example.com',
    },
    put: {
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Admin',
      status: 'active',
    },
  },
  apikeys: {
    post: {
      name: 'Production server',
    },
    put: {
      name: 'Production server',
      is_enabled: false,
    },
  },
  whitelist: {
    post: {
      domain: 'linkedin.com',
    },
  },
};
