import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  Package, 
  Type, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  ChevronLeft,
  Upload,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCatalog } from "@/lib/catalog-data";
import { updateSiteContent, deleteProduct, upsertProduct } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [view, setView] = useState<"products" | "content">("products");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/conta" });
        return;
      }

      const email = session.user.email;
      if (email === "vivonirubens@gmail.com") {
        setIsAdmin(true);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast.error("Acesso negado: Somente administradores.");
        navigate({ to: "/" });
      } else {
        setIsAdmin(true);
      }
    }
    checkAuth();
  }, [navigate]);

  if (isAdmin === null) return <div className="p-20 text-center">Verificando acesso...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30">
        <div className="p-6">
          <Link to="/" className="font-display text-xl tracking-wider text-silver-gradient">
            MARÉ ADMIN
          </Link>
        </div>
        <nav className="mt-6 space-y-1 px-3">
          <button
            onClick={() => setView("products")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
              view === "products" ? "bg-secondary text-pearl" : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <Package className="h-4 w-4" /> Produtos
          </button>
          <button
            onClick={() => setView("content")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
              view === "content" ? "bg-secondary text-pearl" : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <Type className="h-4 w-4" /> Textos do Site
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10">
        <div className="mx-auto max-w-5xl">
          {view === "products" ? <ProductsManager /> : <ContentManager />}
        </div>
      </main>
    </div>
  );
}

function ProductsManager() {
  const { products } = useCatalog();
  const [editing, setEditing] = useState<any>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm("Tem certeza que deseja apagar este produto?")) return;
    try {
      await deleteProduct({ data: { slug } });
      toast.success("Produto removido com sucesso!");
      window.location.reload(); // Simple refresh for now
    } catch (e) {
      toast.error("Erro ao remover produto.");
    }
  };

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertProduct({ data: editing });
      toast.success("Produto salvo com sucesso!");
      setEditing(null);
      window.location.reload();
    } catch (e) {
      toast.error("Erro ao salvar produto.");
    }
  };

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-3xl">
            {editing.id ? "Editar Produto" : "Novo Produto"}
          </h2>
        </div>
        
        <form onSubmit={handleUpsert} className="grid gap-6 bg-card/50 p-8 border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input 
                value={editing.name} 
                onChange={e => setEditing({...editing, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input 
                value={editing.slug} 
                onChange={e => setEditing({...editing, slug: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editing.price} 
                onChange={e => setEditing({...editing, price: Number(e.target.value)})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Preço Antigo</Label>
              <Input 
                type="number" 
                step="0.01"
                value={editing.compareAt || ""} 
                onChange={e => setEditing({...editing, compareAt: e.target.value ? Number(e.target.value) : null})}
              />
            </div>
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input 
                type="number" 
                value={editing.stock_quantity || 0} 
                onChange={e => setEditing({...editing, stock_quantity: Number(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagens do Produto</Label>
            <div className="grid grid-cols-4 gap-4 mb-2">
              {editing.images.map((img: string, i: number) => (
                <div key={i} className="relative aspect-square border border-border bg-background group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setEditing({...editing, images: editing.images.filter((_: any, idx: number) => idx !== i)})}
                    className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center aspect-square border border-dashed border-border hover:border-silver cursor-pointer transition-colors">
                <Upload className="h-4 w-4 text-muted-foreground mb-1" />
                <span className="text-[0.6rem] uppercase tracking-wider text-muted-foreground">Upload</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${Math.random()}.${fileExt}`;
                      const filePath = `${fileName}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(filePath, file);

                      if (uploadError) throw uploadError;

                      const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(filePath);

                      setEditing({...editing, images: [...editing.images, publicUrl]});
                      toast.success("Imagem carregada!");
                    } catch (err) {
                      toast.error("Erro no upload.");
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea 
              value={editing.description} 
              onChange={e => setEditing({...editing, description: e.target.value})}
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit">Salvar Produto</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl">Gerenciar Produtos</h2>
        <Button onClick={() => setEditing({
          name: "", 
          slug: "", 
          price: 0, 
          category: "lingerie", 
          category_name: "Lingerie",
          images: [],
          description: "",
          material: "",
          care: "",
          details: []
        })}>
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="border border-border bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.slug}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
                <TableCell>R$ {p.price.toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-medium",
                      p.stock_quantity <= 0 ? "text-destructive" : p.stock_quantity < 5 ? "text-amber-500" : "text-muted-foreground"
                    )}>
                      {p.stock_quantity || 0}
                    </span>
                    {p.stock_quantity <= 5 && (
                      <AlertCircle className={cn("h-3 w-3", p.stock_quantity <= 0 ? "text-destructive" : "text-amber-500")} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.slug)}>
                      <Trash2 className="h-4 w-4" /> deletar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ContentManager() {
  const { content } = useCatalog();
  const [localContent, setLocalContent] = useState<any>(null);

  useEffect(() => {
    if (content) setLocalContent(content);
  }, [content]);

  const handleSave = async (key: string, value: string) => {
    try {
      await updateSiteContent({ data: { key, value } });
      toast.success("Conteúdo atualizado!");
    } catch (e) {
      toast.error("Erro ao atualizar conteúdo.");
    }
  };

  if (!localContent) return null;

  const contentFields = [
    { key: "hero_eyebrow", label: "Banner — Linha Superior" },
    { key: "hero_title", label: "Banner — Título" },
    { key: "hero_subtitle", label: "Banner — Subtítulo" },
    { key: "hero_cta", label: "Banner — Botão Principal" },
    { key: "whatsapp_number", label: "WhatsApp para Pedidos (apenas números)" },
  ];

  return (
    <div>
      <h2 className="font-display text-3xl mb-8">Textos do Site</h2>
      <div className="space-y-8 bg-card/50 p-8 border border-border">
        {contentFields.map((field) => (
          <div key={field.key} className="space-y-3">
            <Label className="text-silver-gradient tracking-widest text-[0.65rem] uppercase">{field.label}</Label>
            <div className="flex gap-3">
              <Input 
                value={localContent[field.key] || ""} 
                onChange={e => setLocalContent({...localContent, [field.key]: e.target.value})}
              />
              <Button onClick={() => handleSave(field.key, localContent[field.key])}>
                <Save className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
