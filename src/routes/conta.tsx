import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Heart, MapPin, Package, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — Maré de Prata" },
      {
        name: "description",
        content:
          "Acesse sua conta Maré de Prata para acompanhar pedidos, endereços e suas peças favoritas.",
      },
      { property: "og:title", content: "Minha conta — Maré de Prata" },
      {
        property: "og:description",
        content: "Pedidos, endereços e favoritos em um só lugar.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { favorites } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("senha") as string;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Bem-vinda de volta!");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("senha") as string;

    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Conta criada! Verifique seu e-mail.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Até logo!");
  };

  if (loading) return <div className="p-20 text-center">Carregando...</div>;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <p className="eyebrow text-center">Área da cliente</p>
        <h1 className="font-display mt-3 text-center text-4xl text-silver-gradient">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </h1>

        <div className="mt-8 grid grid-cols-2 border border-border text-xs tracking-[0.2em] uppercase">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn("py-3", mode === m ? "bg-secondary text-pearl" : "text-muted-foreground")}
            >
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={mode === "login" ? handleLogin : handleSignup}
        >
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" required />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" name="senha" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            {mode === "login" ? "Entrar" : "Criar minha conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Suas compras são registradas com discrição total.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Minha conta</p>
      <h1 className="font-display mt-3 text-4xl">Olá, {session.user.email}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card icon={Package} title="Pedidos">
          Nenhum pedido finalizado ainda. Ao concluir uma compra, o acompanhamento aparece
          aqui.
        </Card>
        <Card icon={MapPin} title="Endereços">
          Você ainda não salvou endereços. Eles serão guardados no seu próximo checkout.
        </Card>
        <Card icon={Heart} title="Favoritos">
          {favorites.length > 0
            ? `${favorites.length} peça(s) salva(s).`
            : "Nenhuma peça salva ainda."}{" "}
          <Link to="/favoritos" className="text-pearl underline-offset-4 hover:underline">
            Ver lista
          </Link>
        </Card>
      </div>

      <div className="mt-10">
        <Button variant="outline" onClick={handleLogout}>
          <User className="mr-2 h-4 w-4" /> Sair
        </Button>
        {session.user.email === "vivonirubens@gmail.com" && (
          <Button className="ml-4" onClick={() => navigate({ to: "/admin" })}>
            Painel Admin
          </Button>
        )}
      </div>
    </div>
  );
}

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border p-6">
      <Icon className="h-4 w-4 text-silver" />
      <h2 className="font-display mt-4 text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
