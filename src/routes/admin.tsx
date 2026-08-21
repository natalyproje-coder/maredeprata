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
  AlertCircle,
  Layers
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
import { 
  updateSiteContent, 
  deleteProduct, 
  upsertProduct, 
  upsertCategory, 
  deleteCategory 
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [view, setView] = useState<"products" | "content" | "categories">("products");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/conta" });
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
            onClick={() => setView("categories")}
            className={`flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors ${
              view === "categories" ? "bg-secondary text-pearl" : "text-muted-foreground hover:bg-secondary/50"
            }`}
          >
            <Layers className="h-4 w-4" /> Categorias
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
          {view === "products" ? (
            <ProductsManager />
          ) : view === "categories" ? (
            <CategoriesManager />
          ) : (
            <ContentManager />
          )}
        </div>
      </main>
    </div>
  );
}

function ProductsManager() {
  const { products, categories } = useCatalog();
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
      // Precise data cleaning to ensure we only send what the table expects
      const payload = {
        slug: editing.slug,
        name: editing.name,
        category: editing.category,
        category_name: editing.category_name || (categories.find(c => c.slug === editing.category)?.name) || "Lingerie",
        price: Number(editing.price || 0),
        compare_at: (editing.compare_at != null || editing.compareAt != null) ? Number(editing.compare_at ?? editing.compareAt) : null,
        images: editing.images || [],
        badge: editing.badge || null,
        material: editing.material || "",
        in_stock: Number(editing.stock_quantity) > 0 || editing.in_stock === true,
        bestseller: !!editing.bestseller,
        colors: Array.isArray(editing.colors) ? editing.colors : [],
        sizes: Array.isArray(editing.sizes) ? editing.sizes : [],
        description: editing.description || "",
        details: Array.isArray(editing.details) ? editing.details : [],
        care: editing.care || "",
        stock_quantity: Number(editing.stock_quantity),
        meta: editing.meta || {},
        sort_order: typeof editing.sort_order === 'number' ? editing.sort_order : 0,
        rating: typeof editing.rating === 'number' ? editing.rating : 5,
        reviews: typeof editing.reviews === 'number' ? editing.reviews : 0,
        created_on: editing.created_on || new Date().toISOString().split('T')[0],
      };

      if (editing.id) {
        (payload as any).id = editing.id;
      }
      
      console.log("Upserting product with payload:", payload);
      await upsertProduct({ data: payload });
      toast.success("Produto salvo com sucesso!");
      setEditing(null);
      window.location.reload();
    } catch (e: any) {
      console.error("Upsert product error:", e);
      toast.error(`Erro ao salvar produto: ${e.message || "Erro desconhecido"}`);
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing.category}
                onChange={e => {
                  const cat = categories.find(c => c.slug === e.target.value);
                  setEditing({
                    ...editing, 
                    category: e.target.value,
                    category_name: cat?.name || ""
                  });
                }}
              >
                {categories.map(c => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Descrição Curta</Label>
              <Input 
                value={editing.description} 
                onChange={e => setEditing({...editing, description: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-4 border border-border bg-secondary/20 p-4">
            <h3 className="text-xs font-medium uppercase tracking-widest text-silver">Metadados Técnicos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guia de Tamanhos (Tipo)</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editing.meta?.size_chart_type || ""}
                  onChange={e => setEditing({
                    ...editing, 
                    meta: { ...editing.meta, size_chart_type: e.target.value }
                  })}
                >
                  <option value="">Nenhum</option>
                  <option value="lingerie">Lingerie (P/M/G/GG)</option>
                  <option value="jewelry">Joias (Aros 12-24)</option>
                  <option value="bedding">Roupas de Cama (Solteiro/Casal/...)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Volume / Peso (ex: 50ml)</Label>
                <Input 
                  value={editing.meta?.volume || ""}
                  onChange={e => setEditing({
                    ...editing, 
                    meta: { ...editing.meta, volume: e.target.value }
                  })}
                  placeholder="Para Sexy Shop"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Informações de Segurança / Modo de Uso</Label>
              <Textarea 
                value={editing.meta?.safety_info || ""}
                onChange={e => setEditing({
                  ...editing, 
                  meta: { ...editing.meta, safety_info: e.target.value }
                })}
                placeholder="Contraindicações ou como usar"
              />
            </div>
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
          details: [],
          stock_quantity: 0,
          meta: {}
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
                      <span className="sr-only">editar</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(p.slug)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">deletar</span>
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

function CategoriesManager() {
  const { categories } = useCatalog();
  const [editing, setEditing] = useState<any>(null);

  const handleDelete = async (slug: string) => {
    if (!confirm("Tem certeza que deseja apagar esta categoria?")) return;
    try {
      await deleteCategory({ data: { slug } });
      toast.success("Categoria removida com sucesso!");
      window.location.reload();
    } catch (e) {
      toast.error("Erro ao remover categoria.");
    }
  };

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        slug: editing.slug,
        name: editing.name,
        tagline: editing.tagline || "",
        description: editing.description || "",
        image: editing.image || "/img/cat-lingerie.jpg",
        sort_order: Number(editing.sort_order) || 0,
      };

      if (editing.id) {
        (payload as any).id = editing.id;
      }
      
      await upsertCategory({ data: payload });
      toast.success("Categoria salva com sucesso!");
      setEditing(null);
      window.location.reload();
    } catch (e: any) {
      console.error("Upsert category error:", e);
      toast.error(`Erro ao salvar categoria: ${e.message}`);
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
            {editing.id ? "Editar Categoria" : "Nova Categoria"}
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

          <div className="space-y-2">
            <Label>Slogan (Tagline)</Label>
            <Input 
              value={editing.tagline} 
              onChange={e => setEditing({...editing, tagline: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea 
              value={editing.description} 
              onChange={e => setEditing({...editing, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input 
                value={editing.image} 
                onChange={e => setEditing({...editing, image: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Ordem de Exibição</Label>
              <Input 
                type="number"
                value={editing.sort_order} 
                onChange={e => setEditing({...editing, sort_order: e.target.value})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit">Salvar Categoria</Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl">Gerenciar Categorias</h2>
        <Button onClick={() => setEditing({
          name: "", 
          slug: "", 
          tagline: "",
          description: "",
          image: "",
          sort_order: 0
        })}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="border border-border bg-card/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.slug}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>{c.sort_order || 0}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(c.slug)}>
                      <Trash2 className="h-4 w-4" />
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
