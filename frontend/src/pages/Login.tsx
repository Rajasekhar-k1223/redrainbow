import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, ChevronRight, UserPlus, LogIn, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login, register } from "@/lib/api";
import { toast } from "sonner";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (isRegister) {
        await register(username, password, inviteCode);
        toast.success("Account created successfully. Please login.");
        setIsRegister(false);
        setPassword("");
      } else {
        const { access_token } = await login(username, password);
        localStorage.setItem("redrainbow_token", access_token);
        toast.success("Security session initialized.");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Credential rejection: Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already authenticated
  useState(() => {
    const token = localStorage.getItem("redrainbow_token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  });

  return (
    <div className="min-h-screen bg-background bg-grid bg-scanline flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md mx-4"
      >
        <div className="p-8 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <Shield className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-mono font-bold text-xl tracking-wider text-foreground">
                RRC<span className="text-primary">Layer</span>
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground mb-1">{isRegister ? "Commission Account" : "Authenticate"}</h1>
            <p className="font-mono text-[10px] text-muted-foreground tracking-[0.3em] uppercase">{isRegister ? "New Operator Registration" : "SECURE ACCESS REQUIRED"}</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-mono flex items-center gap-3 overflow-hidden"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 block">
                Operator ID
              </label>
              <Input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator_7"
                className="bg-white/5 border-white/10 font-mono text-sm h-12 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 block">
                Passphrase
              </label>
              <div className="relative">
                <Input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-white/5 border-white/10 font-mono text-sm h-12 pr-12 focus:border-primary/50 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2 block">
                  Invitation Code
                </label>
                <Input
                  required
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="RR-XXXX-XXXX"
                  className="bg-white/5 border-white/10 font-mono text-sm h-12 focus:border-secondary/50 focus:ring-secondary/20"
                />
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full font-mono h-12 transition-all duration-500 shadow-xl ${
                isRegister ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground glow-red"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 uppercase tracking-widest text-[11px] font-bold">
                  {isRegister ? <><UserPlus className="h-4 w-4" /> Commission Node</> : <><LogIn className="h-4 w-4" /> Initialize Session</>}
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="font-mono text-[10px] text-muted-foreground hover:text-white transition-colors uppercase tracking-widest"
            >
              {isRegister ? "Already have a node? Authenticate" : "No credentials? Request commission"}
            </button>
          </div>

          {/* Status bar */}
          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="status-dot" />
              <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">TLS 1.3 / E2EE</span>
            </div>
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">v3.2.1-stable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
