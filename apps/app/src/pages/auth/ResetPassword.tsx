import { useState } from "react";
import { Link } from "react-router-dom";
import { Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setSent(true);
    toast.success("Reset link sent to your email!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Link2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {sent ? "Check your email for the reset link" : "Enter your email to receive a reset link"}
          </CardDescription>
        </CardHeader>
        {!sent ? (
          <form onSubmit={handleReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full">Send Reset Link</Button>
              <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
            </CardFooter>
          </form>
        ) : (
          <CardFooter className="flex flex-col gap-4">
            <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
              Resend Link
            </Button>
            <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
