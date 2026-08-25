import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  ShieldCheck,
  ExternalLink,
  Search,
  ChevronLeft
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha Conta — Maré de Prata" },
      {
        name: "description",
        content: "Acesse seus pedidos, favoritos e gerencie seus endereços com total privacidade.",
      },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [view, setView] = useState<"dashboard" | "orders" | "favorites" | "track">("dashboard");
  const [orderQuery, setOrderQuery] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  
  const { favorites } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id);
        fetchOrders(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkAdmin(session.user.id);
        fetchOrders(session.user.id);
      } else {
        setIsAdmin(false);
        setOrders([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkAdmin(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    setIsAdmin(!!data);
  }

  async function fetchOrders(userId: string) {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  }

  async function handleTrackOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderQuery) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderQuery)
      .single();
    
    if (error || !data) {
      toast.error("Pedido não encontrado.");
      setSearchedOrder(null);
    } else {
      setSearchedOrder(data);
    }
    setLoading(false);
  }

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
    setView("dashboard");
  };

  if (loading) return <div className="p-20 text-center">Carregando...</div>;

  if (!session && view !== "track") {
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
        
        <div className="mt-8 text-center">
          <button 
            onClick={() => setView("track")}
            className="text-xs tracking-widest uppercase text-muted-foreground hover:text-pearl transition-colors"
          >
            Acompanhar pedido sem login
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Suas compras são registradas com discrição total.
        </p>
      </div>
    );
  }

  if (view === "track") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <button 
          onClick={() => setView("dashboard")}
          className="flex items-center gap-2 mb-8 text-xs tracking-widest uppercase text-muted-foreground hover:text-pearl"
        >
          <ChevronLeft className="h-3 w-3" /> Voltar
        </button>
        
        <h1 className="font-display text-4xl mb-8">Acompanhar Pedido</h1>
        
        <form onSubmit={handleTrackOrder} className="flex gap-3 mb-10">
          <div className="flex-1">
            <Input 
              placeholder="Número do pedido (ex: MP-2026-1234)" 
              value={orderQuery}
              onChange={e => setOrderQuery(e.target.value)}
            />
          </div>
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </form>

        {searchedOrder ? (
          <div className="border border-border p-8 bg-card/30">
            <div className="flex justify-between items-start mb-6 pb-6 border-b border-border">
              <div>
                <p className="eyebrow">Status: {searchedOrder.status}</p>
                <h2 className="font-display text-2xl mt-2">{searchedOrder.order_number}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Data</p>
                <p className="text-sm">{new Date(searchedOrder.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Itens</h3>
                <ul className="space-y-3">
                  {searchedOrder.items.map((item: any, i: number) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span>{item.name} ({item.size}) x{item.quantity}</span>
                      <span className="text-pearl">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="pt-6 border-t border-border flex justify-between items-baseline">
                <span className="text-xs tracking-[0.2em] uppercase">Total</span>
                <span className="font-display text-2xl text-silver-gradient">
                  {formatPrice(searchedOrder.total_amount)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-border text-muted-foreground">
            Digite o número do seu pedido para ver o status.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <p className="eyebrow">Minha conta</p>
      <h1 className="font-display mt-3 text-4xl">Olá, {session.user.email}</h1>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <button onClick={() => setView("orders")} className="text-left group">
          <Card icon={Package} title="Pedidos">
            {orders.length > 0 
              ? `Você tem ${orders.length} pedido(s). Clique para ver detalhes.`
              : "Nenhum pedido finalizado ainda."}
          </Card>
        </button>
        
        <Card icon={MapPin} title="Endereços">
          Seus dados de entrega são salvos automaticamente para facilitar sua próxima compra.
        </Card>
        
        <Link to="/favoritos" className="group">
          <Card icon={Heart} title="Favoritos">
            {favorites.length > 0
              ? `${favorites.length} peça(s) salva(s). Clique para ver sua lista.`
              : "Nenhuma peça salva ainda."}
          </Card>
        </Link>
      </div>

      {view === "orders" && orders.length > 0 && (
        <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="font-display text-2xl mb-6">Histórico de Pedidos</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border p-6 bg-card/20 hover:bg-card/40 transition-colors">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">Pedido</p>
                    <p className="text-pearl font-medium">{order.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">Status</p>
                    <p className="text-sm capitalize">{order.status}</p>
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground">Total</p>
                    <p className="text-sm">{formatPrice(order.total_amount)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setOrderQuery(order.order_number);
                    setSearchedOrder(order);
                    setView("track");
                  }}>
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-border">
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
        {isAdmin && (
          <Button className="bg-silver-gradient text-black" onClick={() => navigate({ to: "/admin" })}>
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
  icon: any;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="h-full border border-border p-6 hover:border-silver transition-colors">
      <Icon className="h-4 w-4 text-silver" />
      <h2 className="font-display mt-4 text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}
