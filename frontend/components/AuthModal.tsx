import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({ title: "Welcome back!" });
      } else {
        await register(email, name, password);
        toast({ title: "Account created successfully!" });
      }
      onClose();
      setEmail("");
      setPassword("");
      setName("");
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: isLogin ? "Invalid email or password" : "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-black border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-light">
            {isLogin ? "Sign In" : "Create Account"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-light">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
            />
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-light">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-light">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-neutral-900 border-neutral-700 focus:border-white text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black hover:bg-neutral-200 font-light"
          >
            {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
