import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Scan, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Use a relative path that the Vite proxy will catch
const API_URL = "/api"; // ✅ Use proxied URL

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // ✅ Validate form inputs
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // The fetch URL will now be /api/auth/login, which Vite will proxy
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Login failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // fallback if backend returns no JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // ✅ Save token & user info
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);
      
      // Also store admin name if available
      if (data.name) {
        localStorage.setItem("lecturerName", data.name);
        localStorage.setItem("adminName", data.name);
      }

      // Debug: Log what we're saving
      console.log('Login successful - saved data:', {
        role: data.role,
        email: data.email,
        hasToken: !!data.access_token,
        tokenLength: data.access_token?.length
      });

      toast({
        title: "✅ Login successful",
        description: `Welcome back, ${data.role === "admin" ? "Admin" : data.role === "lecturer" ? "Lecturer" : "Student"}!`,
      });

      // ✅ Redirect after successful login - verify localStorage is set
      const verifyRole = localStorage.getItem('userRole');
      const verifyToken = localStorage.getItem('token');
      
      if (!verifyRole || !verifyToken) {
        console.error('Failed to save token/role to localStorage');
        toast({
          title: "Error",
          description: "Failed to save login credentials. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log('Redirecting to dashboard with role:', verifyRole);
      
      // Use a slight delay to ensure everything is saved
      setTimeout(() => {
        navigate("/dashboard");
      }, 200);
    } catch (err: any) {
      console.error("Login error:", err);
      toast({
        title: "Login failed",
        description: err.message || "Unable to connect to the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Social Logins (UI only)
  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `Redirecting to ${provider} authentication...`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="bg-gradient-primary p-3 rounded-xl shadow-glow group-hover:scale-110 transition-transform">
              <Scan className="w-6 h-6 text-primary-foreground" />
            </div>
            <span
              className="font-bold text-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              AI Attendance
            </span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-card rounded-2xl p-8 shadow-large border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="deng@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-11 ${errors.email ? "border-destructive" : ""}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-11 pr-11 ${errors.password ? "border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember" className="text-sm cursor-pointer">
                  Remember me
                </Label>
              </div>
              <a href="#forgot" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full hover:-translate-y-0.5 transition-all shadow-medium hover:shadow-large"
              size="lg"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("Google")}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSocialLogin("Microsoft")}
              >
                Microsoft
              </Button>
            </div>
          </form>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;