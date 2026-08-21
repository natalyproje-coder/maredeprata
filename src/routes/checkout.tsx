import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Landmark, Lock, QrCode, ShieldCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice, installments } from "@/lib/catalog";
import { useSiteText } from "@/lib/catalog-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { createOrder, updateProfile } from "@/lib/admin.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout seguro — Maré de Prata" },
      {
        name: "description",
        content:
          "Finalize seu pedido com pagamento seguro por Pix, cartão ou boleto e entrega discreta em todo o Brasil.",
      },
      { property: "og:title", content: "Checkout seguro — Maré de Prata" },
      {
        property: "og:description",
        content: "Pagamento seguro e embalagem discreta em todos os pedidos.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const payments = [
  { id: "pix", label: "Pix", hint: "5% de desconto · aprovação imediata", icon: QrCode },
  { id: "card", label: "Cartão de crédito", hint: "Até 6x sem juros", icon: CreditCard },
  { id: "boleto", label: "Boleto bancário", hint: "Compensa em até 2 dias úteis", icon: Landmark },
] as const;

function CheckoutPage() {
  const { detailed, subtotal, clearCart } = useStore();
  const navigate = useNavigate();
  const whatsappNumber = useSiteText("whatsapp_number");
  const [method, setMethod] = useState<(typeof payments)[number]["id"]>("pix");
  const [done, setDone] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, value: string) => {
    setValues(prev => ({ ...prev, [id]: value }));
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) {
          setProfile(data);
          const address = data.address as any;
          setValues({
            nome: data.full_name || "",
            email: session.user.email || "",
            tel: data.phone || "",
            cep: address?.cep || "",
            end: address?.end || "",
            num: address?.num || "",
            comp: address?.comp || "",
            cidade: address?.cidade || "",
            uf: address?.uf || "",
          });
        }
      }
    }
    loadProfile();
  }, []);

  const shipping = subtotal >= 399 || subtotal === 0 ? 0 : 24.9;
  const pixDiscount = method === "pix" ? subtotal * 0.05 : 0;
  const total = Math.max(0, subtotal - pixDiscount) + shipping;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (detailed.length === 0) {
      toast.error("Sua sacola está vazia.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const customerName = formData.get("nome") as string;
    const customerEmail = formData.get("email") as string;
    const customerPhone = formData.get("tel") as string;
    const cpf = formData.get("cpf") as string;

    // Basic CPF validation
    if (!/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/.test(cpf)) {
      toast.error("Por favor, informe um CPF válido.");
      return;
    }

    // Basic CEP validation
    const cep = formData.get("cep") as string;
    if (!/^\d{5}-?\d{3}$/.test(cep)) {
      toast.error("Por favor, informe um CEP válido.");
      return;
    }
    
    const code = `MP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const shippingAddress = {
      cep: (formData.get("cep") as string) || "",
      end: (formData.get("end") as string) || "",
      num: (formData.get("num") as string) || "",
      comp: (formData.get("comp") as string) || "",
      cidade: (formData.get("cidade") as string) || "",
      uf: (formData.get("uf") as string) || "",
    };

    const items = detailed.map(item => ({
      slug: item.product.slug,
      name: item.product.name,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      price: item.product.price
    }));

    try {
      // Create order in database
      await createOrder({ data: {
        order_number: code,
        user_id: userId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        items: items,
        total_amount: total,
        status: 'pending'
      }});

      // Update profile with address for next time if logged in
      if (userId) {
        await updateProfile({ data: {
          full_name: customerName,
          phone: customerPhone,
          address: shippingAddress
        }});
      }

      // Build WhatsApp message
      const itemsSummary = detailed.map(item => 
        `• ${item.product.name} (${item.size}, ${item.color}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`
      ).join('\n');

      const message = `Olá! Meu nome é ${customerName}. Acabei de fazer um pedido na Maré de Prata!\n\n` +
        `*Pedido:* ${code}\n` +
        `*Itens:*\n${itemsSummary}\n\n` +
        `*Subtotal:* ${formatPrice(subtotal)}\n` +
        `*Frete:* ${shipping === 0 ? "Grátis" : formatPrice(shipping)}\n` +
        `*Desconto Pix:* ${formatPrice(pixDiscount)}\n` +
        `*Total:* ${formatPrice(total)}\n\n` +
        `*Forma de Pagamento:* ${payments.find(p => p.id === method)?.label}\n\n` +
        `Por favor, me informe os próximos passos.`;

      const waLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      
      clearCart();
      setDone(code);
      toast.success("Pedido gerado! Redirecionando para o WhatsApp...");
      
      setTimeout(() => {
        window.open(waLink, '_blank');
      }, 1500);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar pedido.");
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="eyebrow">Pedido confirmado</p>
        <h1 className="font-display mt-4 text-4xl text-silver-gradient">Obrigada</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Seu pedido <span className="text-pearl">{done}</span> foi recebido. Ele será
          enviado em embalagem discreta, sem identificação externa da loja.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            to="/conta"
            className="border border-border px-6 py-3 text-xs tracking-[0.24em] uppercase hover:bg-secondary"
          >
            Meus pedidos
          </Link>
          <Link
            to="/"
            className="border border-border px-6 py-3 text-xs tracking-[0.24em] uppercase hover:bg-secondary"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    );
  }

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Sua sacola está vazia</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Escolha suas peças antes de finalizar a compra.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate({ to: "/" })}>Ver curadoria</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="eyebrow">Checkout</p>
      <h1 className="font-display mt-3 text-4xl">Finalizar compra</h1>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl">Identificação</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="nome" label="Nome completo" value={values["nome"]} onChange={(e) => handleInputChange("nome", e.target.value)} required />
              <Field id="email" label="E-mail" type="email" value={values["email"]} onChange={(e) => handleInputChange("email", e.target.value)} required />
              <Field id="cpf" label="CPF" value={values["cpf"]} onChange={(e) => handleInputChange("cpf", e.target.value)} placeholder="000.000.000-00" required />
              <Field id="tel" label="Celular / WhatsApp" value={values["tel"]} onChange={(e) => handleInputChange("tel", e.target.value)} placeholder="(12) 99999-9999" required />
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl">Entrega</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field id="cep" label="CEP" value={values["cep"]} onChange={(e) => handleInputChange("cep", e.target.value)} placeholder="00000-000" required />
              <Field id="end" label="Endereço" value={values["end"]} onChange={(e) => handleInputChange("end", e.target.value)} required />
              <Field id="num" label="Número" value={values["num"]} onChange={(e) => handleInputChange("num", e.target.value)} required />
              <Field id="comp" label="Complemento" value={values["comp"]} onChange={(e) => handleInputChange("comp", e.target.value)} />
              <Field id="cidade" label="Cidade" value={values["cidade"]} onChange={(e) => handleInputChange("cidade", e.target.value)} required />
              <Field id="uf" label="Estado" value={values["uf"]} onChange={(e) => handleInputChange("uf", e.target.value)} required />
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-silver" />
              Enviado em embalagem neutra, sem nome da loja no pacote nem na fatura.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl">Pagamento</h2>
            <div className="mt-5 space-y-3">
              {payments.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setMethod(p.id)}
                  className={cn(
                    "flex w-full items-center gap-4 border px-4 py-4 text-left transition-colors",
                    method === p.id
                      ? "border-silver bg-secondary/50"
                      : "border-border hover:bg-secondary/30",
                  )}
                >
                  <p.icon className="h-4 w-4 text-silver" />
                  <span>
                    <span className="block text-sm">{p.label}</span>
                    <span className="block text-xs text-muted-foreground">{p.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            {method === "card" ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field id="cardnum" label="Número do cartão" value={values["cardnum"]} onChange={(e) => handleInputChange("cardnum", e.target.value)} required />
                <Field id="cardname" label="Nome impresso" value={values["cardname"]} onChange={(e) => handleInputChange("cardname", e.target.value)} required />
                <Field id="cardval" label="Validade (MM/AA)" value={values["cardval"]} onChange={(e) => handleInputChange("cardval", e.target.value)} required />
                <Field id="cardcvv" label="CVV" value={values["cardcvv"]} onChange={(e) => handleInputChange("cardcvv", e.target.value)} required />
              </div>
            ) : null}
          </section>
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-28">
          <h2 className="eyebrow flex items-center justify-between">
            Resumo
            {subtotal < 399 && subtotal > 0 && (
              <span className="text-[0.6rem] normal-case tracking-normal text-gold">
                Faltam {formatPrice(399 - subtotal)} para frete grátis
              </span>
            )}
            {subtotal >= 399 && (
              <span className="text-[0.6rem] normal-case tracking-normal text-gold">
                Você ganhou frete grátis!
              </span>
            )}
          </h2>
          <ul className="mt-5 space-y-4">
            {detailed.map((item) => (
              <li key={`${item.slug}-${item.size}`} className="flex gap-3">
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  loading="lazy"
                  className="h-20 w-16 object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="text-pearl">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} · {item.color} · {item.quantity}x
                  </p>
                  <p className="mt-1 text-xs">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="hairline my-6" />

          <dl className="space-y-2 text-sm text-muted-foreground">
            <Row label="Subtotal" value={formatPrice(subtotal)} />
            {pixDiscount > 0 ? (
              <Row label="Desconto Pix (5%)" value={`- ${formatPrice(pixDiscount)}`} />
            ) : null}
            <Row label="Frete" value={shipping === 0 ? "Grátis" : formatPrice(shipping)} />
          </dl>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs tracking-[0.2em] uppercase">Total</span>
            <span className="font-display text-2xl">{formatPrice(total)}</span>
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {installments(total)}
          </p>

          <Button type="submit" className="mt-6 w-full">
            <Lock className="mr-2 h-4 w-4" /> Pagar com segurança
          </Button>
          <p className="mt-3 text-center text-[0.65rem] tracking-[0.14em] text-muted-foreground uppercase">
            Ambiente criptografado
          </p>
        </aside>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="text-pearl">{value}</dd>
    </div>
  );
}

function Field({
  id,
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  value?: string | null | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </Label>
      <Input 
        id={id} 
        name={id} 
        type={type} 
        required={required} 
        value={value ?? ""} 
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}
