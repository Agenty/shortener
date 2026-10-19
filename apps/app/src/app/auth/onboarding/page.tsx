import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { api } from "@/lib/api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function Onboarding() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const sent = useRef(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Passed by signup/login, the API token doesn't carry the email
  const email: string | undefined = useLocation().state?.email;

  const sendOtp = async () => {
    setCooldown(RESEND_SECONDS);
    try {
      await api.auth.sendOtp();
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      setCooldown(0);
      toast.error(err.message || "Failed to send the code");
    }
  };

  // Send the first code on arrival, the ref keeps StrictMode from sending twice
  useEffect(() => {
    if (sent.current || !api.auth.isAuthenticated()) return;
    sent.current = true;
    sendOtp();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length !== OTP_LENGTH) {
      toast.error(`Please enter the ${OTP_LENGTH} digit code`);
      return;
    }
    setLoading(true);
    try {
      await api.auth.verifyOtp(Number(code));
      await queryClient.invalidateQueries({ queryKey: ["auth-user"] });
      toast.success("Email verified, welcome aboard!");
      navigate("/links", { replace: true });
    } catch (err: any) {
      setCode("");
      toast.error(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  if (!api.auth.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            Enter the {OTP_LENGTH} digit code we sent to{" "}
            {email ? <span className="font-medium text-foreground">{email}</span> : "your email"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleVerify} className="space-y-6">
          <CardContent className="flex justify-center">
            <InputOTP
              maxLength={OTP_LENGTH}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              value={code}
              onChange={setCode}
              disabled={loading}
            >
              <InputOTPGroup>
                {Array.from({ length: OTP_LENGTH }, (_, i) => (
                  <InputOTPSlot key={i} index={i} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || code.length !== OTP_LENGTH}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Didn't get the code?{" "}
              <button
                type="button"
                className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                disabled={cooldown > 0}
                onClick={sendOtp}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </p>
            <button type="button" className="text-sm text-muted-foreground hover:underline" onClick={handleLogout}>
              Use a different account
            </button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
