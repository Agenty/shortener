/**
 * English source strings for the dashboard. Every other language implements
 * the same shape. `{name}` is replaced at render time with `fmt`.
 */
const en = {
  meta: {
    title: "Shortener.dev — Create short links",
    description:
      "Shortener.dev lets you create short, shareable links in seconds, then manage and track them with click analytics.",
  },
  titles: {
    login: "Login",
    signup: "Sign Up",
    resetPassword: "Reset Password",
    signingIn: "Signing In",
    verifyEmail: "Verify Email",
    links: "Links",
    analytics: "Analytics",
    reports: "Reports",
    domains: "Domains",
    users: "Users",
    billing: "Billing",
    settings: "Settings",
    apiKeys: "API Keys",
    notFound: "Not Found",
  },
  nav: {
    menu: "Menu",
    links: "Links",
    analytics: "Analytics",
    reports: "Reports",
    domains: "Domains",
    settings: "Settings",
    profile: "Profile",
    apiKeys: "API Keys",
    users: "Users",
    billing: "Billings",
    docs: "Docs",
    logout: "Logout",
  },
  common: {
    language: "Language",
    toggleTheme: "Toggle theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    email: "Email",
    emailPlaceholder: "you@example.com",
    fillAllFields: "Please fill in all fields",
    recaptchaLoading: "reCAPTCHA is still loading, please try again",
    loggedIn: "Logged in successfully!",
  },
  google: {
    continue: "Continue with Google",
    orEmail: "Or continue with email",
    failed: "Google sign in failed, please try again",
  },
  login: {
    title: "Welcome back",
    description: "Sign in to your shortener.dev account",
    password: "Password",
    forgot: "Forgot password?",
    submit: "Sign In",
    submitting: "Signing in...",
    failed: "Login failed",
    noAccount: "Don't have an account?",
    signup: "Sign up",
  },
  signup: {
    title: "Create an account",
    description: "Get started with shortener.dev",
    name: "Full Name",
    namePlaceholder: "John Doe",
    password: "Password",
    submit: "Create Account",
    submitting: "Creating account...",
    created: "Account created, please verify your email",
    failed: "Signup failed",
    haveAccount: "Already have an account?",
    signin: "Sign in",
  },
  reset: {
    title: "Reset Password",
    description: "Enter your email to receive a reset link",
    sentDescription: "Check your email for the reset link",
    enterEmail: "Please enter your email",
    sent: "Reset link sent to your email!",
    submit: "Send Reset Link",
    resend: "Resend Link",
    back: "Back to login",
  },
  onboarding: {
    title: "Verify your email",
    description: "Enter the {length} digit code we sent to {email}",
    yourEmail: "your email",
    sent: "Verification code sent to your email",
    sendFailed: "Failed to send the code",
    enterCode: "Please enter the {length} digit code",
    verified: "Email verified, welcome aboard!",
    failed: "Verification failed",
    submit: "Verify Email",
    submitting: "Verifying...",
    noCode: "Didn't get the code?",
    resendIn: "Resend in {seconds}s",
    resend: "Resend code",
    otherAccount: "Use a different account",
  },
  notFound: {
    message: "Oops! Page not found",
    home: "Return to Home",
  },
};

type Widen<T> = T extends string
  ? string
  : T extends ReadonlyArray<infer U>
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> };

export type Messages = Widen<typeof en>;

export default en as Messages;
