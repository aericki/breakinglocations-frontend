import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const getFirebaseErrorMessage = (error: { code: string }) => {
  switch (error.code) {
    case "auth/invalid-email":
      return "E-mail inválido.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    default:
      return "Ocorreu um erro desconhecido.";
  }
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "E-mail de redefinição enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: getFirebaseErrorMessage(error as { code: string }),
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <div className="grid gap-2 text-center mb-6">
          <h1 className="text-3xl font-bold">Esqueceu a senha?</h1>
          <p className="text-balance text-muted-foreground">
            Digite seu e-mail para receber um link de redefinição
          </p>
        </div>
        <form onSubmit={handlePasswordReset} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}{" "}
            {isLoading ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Lembrou a senha?{" "}
          <Link to="/login" className="underline">
            Faça o login
          </Link>
        </div>
      </div>
    </div>
  );
}
