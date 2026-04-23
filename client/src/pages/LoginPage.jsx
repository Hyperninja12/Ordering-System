import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

const DEMO_SUPER_ADMIN = {
  email: "superadmin@demo.com",
  password: "SuperAdmin123!",
  user: {
    id: "demo-super-admin",
    name: "Super Admin",
    email: "superadmin@demo.com",
    role: "super_admin",
  },
  token: "demo-super-admin-token",
};

function LoginPage({ onAuthSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);
      onAuthSuccess(data);
    } catch (requestError) {
      const isDemoLogin =
        formData.email === DEMO_SUPER_ADMIN.email &&
        formData.password === DEMO_SUPER_ADMIN.password;

      if (isDemoLogin) {
        onAuthSuccess({
          token: DEMO_SUPER_ADMIN.token,
          user: DEMO_SUPER_ADMIN.user,
        });
        return;
      }

      const message =
        requestError.response?.data?.message ||
        "Login failed. Check your credentials and try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoAccount = () => {
    setError("");
    setFormData({
      email: DEMO_SUPER_ADMIN.email,
      password: DEMO_SUPER_ADMIN.password,
    });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(214_95%_93%),transparent_45%),radial-gradient(circle_at_bottom_right,_hsl(160_75%_90%),transparent_40%)]" />

      <Card className="relative z-10 w-full max-w-4xl overflow-hidden border-border/80 backdrop-blur-sm">
        <div className="grid md:grid-cols-2">
          <div className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-foreground">
                <LogIn className="h-6 w-6 text-primary" />
                Sign in
              </CardTitle>
              <CardDescription>
                Enter your credentials to access your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    autoComplete="email"
                    id="email"
                    name="email"
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    autoComplete="current-password"
                    id="password"
                    name="password"
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    type="password"
                    value={formData.password}
                  />
                </div>

                {error ? (
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                ) : null}

                <Button className="w-full" disabled={isLoading} type="submit">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
                <Button
                  className="w-full"
                  disabled={isLoading}
                  onClick={useDemoAccount}
                  type="button"
                  variant="outline"
                >
                  Use Demo Super Admin
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Need a user first? Use the backend route{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  POST /api/auth/register
                </code>
              </p>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                <Link className="underline" to="/dashboard">
                  Protected route demo
                </Link>
              </p>
            </CardContent>
          </div>

          <div className="relative hidden items-center justify-center bg-[linear-gradient(145deg,hsl(220_8%_20%),hsl(220_9%_12%))] p-8 md:flex">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.24),transparent_45%)]" />
            <div className="relative flex h-40 w-40 items-center justify-center text-8xl font-bold tracking-tight text-white">
              K
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

export default LoginPage;
