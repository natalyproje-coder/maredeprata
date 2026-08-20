create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.has_role(auth.uid(), 'admin'), false)
      or coalesce((auth.jwt() ->> 'email') = 'vivonirubens@gmail.com', false)
$$;

create policy "admins read roles" on public.user_roles for select to authenticated using (public.is_admin());
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users where email = 'vivonirubens@gmail.com'
on conflict do nothing;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  image text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public read" on public.categories for select to anon, authenticated using (true);
create policy "categories admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  category_name text not null default '',
  price numeric(10,2) not null default 0,
  compare_at numeric(10,2),
  images text[] not null default '{}',
  badge text,
  rating numeric(2,1) not null default 5,
  reviews int not null default 0,
  colors text[] not null default '{}',
  sizes text[] not null default '{}',
  material text not null default '',
  in_stock boolean not null default true,
  bestseller boolean not null default false,
  created_on date not null default current_date,
  description text not null default '',
  details jsonb not null default '[]'::jsonb,
  care text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products public read" on public.products for select to anon, authenticated using (true);
create policy "products admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table public.site_content (
  key text primary key,
  value text not null default '',
  label text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;
grant all on public.site_content to service_role;
alter table public.site_content enable row level security;
create policy "content public read" on public.site_content for select to anon, authenticated using (true);
create policy "content admin write" on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.site_content (key, value, label) values
  ('hero_eyebrow', 'Coleção Maré Alta', 'Banner — linha superior'),
  ('hero_title', 'MARÉ DE PRATA', 'Banner — título'),
  ('hero_subtitle', 'Seu desejo, seu brilho, sua essência.', 'Banner — frase'),
  ('hero_cta', 'Comprar agora', 'Banner — botão principal'),
  ('whatsapp_number', '5512991139998', 'WhatsApp para pedidos');

INSERT INTO public.products (slug,name,category,category_name,price,compare_at,images,badge,rating,reviews,colors,sizes,material,in_stock,bestseller,created_on,description,details,care,sort_order) VALUES
('conjunto-mare-noturna', 'Conjunto Maré Noturna', 'lingerie', 'Lingerie', 289.9, 349.9, ARRAY['/img/cat-lingerie.jpg','/img/prod-lingerie2.jpg']::text[], 'oferta', 4.9, 128, ARRAY['Preto','Pérola']::text[], ARRAY['P','M','G','GG']::text[], 'Renda francesa', true, true, '2026-07-02', 'Renda francesa aplicada sobre tule leve, com detalhes metálicos em prata envelhecida. Um conjunto para as noites em que você quer se sentir maré alta.', '[{"label":"Tecido","value":"Renda francesa com tule de seda"},{"label":"Composição","value":"82% poliamida, 18% elastano"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Aro leve, alças reguláveis, fecho metálico prata"}]'::jsonb, 'Lavar à mão em água fria com sabão neutro. Não torcer, secar à sombra.', 0),
('body-luar-de-renda', 'Body Luar de Renda', 'lingerie', 'Lingerie', 349.9, NULL, ARRAY['/img/prod-lingerie2.jpg','/img/cat-lingerie.jpg']::text[], 'novidade', 4.8, 64, ARRAY['Pérola','Preto']::text[], ARRAY['P','M','G','GG']::text[], 'Renda bordada', true, false, '2026-08-08', 'Body de renda bordada com pequenas pérolas costuradas à mão. Transparência calculada, presença absoluta.', '[{"label":"Tecido","value":"Renda bordada com pérolas"},{"label":"Composição","value":"90% poliamida, 10% elastano"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Bordado manual, forro discreto"}]'::jsonb, 'Lavagem delicada à mão. Não usar alvejante nem secadora.', 1),
('camisola-seda-da-lua', 'Camisola Seda da Lua', 'moda-intima', 'Moda Íntima', 259.9, 299.9, ARRAY['/img/prod-robe.jpg','/img/cat-cama.jpg']::text[], 'mais-vendido', 4.9, 212, ARRAY['Pérola','Marinho']::text[], ARRAY['P','M','G','GG']::text[], 'Cetim de seda', true, true, '2026-06-14', 'Cetim fluido que desliza como água. Camisola de alças finas com acabamento em viés acetinado.', '[{"label":"Tecido","value":"Cetim de seda toque frio"},{"label":"Composição","value":"95% poliéster, 5% elastano"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Alças reguláveis, fenda lateral discreta"}]'::jsonb, 'Lavar à mão ou ciclo delicado a 30°C. Passar em temperatura baixa.', 2),
('robe-mare-alta', 'Robe Maré Alta', 'cama-banho', 'Cama & Banho', 379.9, NULL, ARRAY['/img/prod-robe.jpg','/img/cat-cama.jpg']::text[], NULL, 4.7, 88, ARRAY['Pérola','Marinho']::text[], ARRAY['P','M','G','GG']::text[], 'Cetim', true, false, '2026-05-20', 'Robe longo de cetim com faixa para amarrar na cintura. O gesto final de qualquer ritual noturno.', '[{"label":"Tecido","value":"Cetim premium"},{"label":"Composição","value":"100% poliéster"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Manga ampla, faixa removível"}]'::jsonb, 'Ciclo delicado a 30°C. Não usar secadora.', 3),
('jogo-de-cama-pearl-tide', 'Jogo de Cama Pearl Tide', 'cama-banho', 'Cama & Banho', 649.9, 799.9, ARRAY['/img/cat-cama.jpg','/img/prod-robe.jpg']::text[], 'oferta', 4.8, 51, ARRAY['Pérola','Marinho']::text[], ARRAY['Casal','Queen','King']::text[], 'Cetim 400 fios', true, false, '2026-04-11', 'Jogo de cama acetinado de 400 fios com brilho suave e toque fresco. Quatro peças que mudam a temperatura do quarto.', '[{"label":"Tecido","value":"Cetim 400 fios"},{"label":"Composição","value":"100% microfibra acetinada"},{"label":"Peças","value":"1 lençol com elástico, 1 lençol de cima, 2 fronhas"},{"label":"Tamanhos","value":"Casal, Queen e King"}]'::jsonb, 'Lavar a 30°C com peças de cor semelhante. Passar do lado avesso.', 4),
('colar-pearl-tide-prata', 'Colar Pearl Tide Prata 925', 'semijoias', 'Semijoias', 219.9, NULL, ARRAY['/img/prod-joia.jpg','/img/cat-semijoias.jpg']::text[], 'novidade', 5, 76, ARRAY['Prata']::text[], ARRAY['14','16','18','Único']::text[], 'Prata 925', true, true, '2026-08-12', 'Corrente delicada em prata 925 com pêndulo de pérola natural abraçada por uma lua minimalista.', '[{"label":"Material","value":"Prata 925"},{"label":"Banho","value":"Ródio branco"},{"label":"Acabamento","value":"Polimento espelhado"},{"label":"Tamanho","value":"Corrente 45cm com extensor de 3cm"}]'::jsonb, 'Evite contato com perfume, cloro e produtos de limpeza. Guarde em saquinho antioxidante.', 5),
('brincos-maresia-ouro', 'Brincos Maresia Ouro 18k', 'semijoias', 'Semijoias', 189.9, 239.9, ARRAY['/img/cat-semijoias.jpg','/img/prod-joia.jpg']::text[], 'oferta', 4.9, 143, ARRAY['Dourado']::text[], ARRAY['Único']::text[], 'Banho de ouro 18k', true, false, '2026-07-25', 'Brincos com pérola de água doce em base folheada a ouro 18k. Movimento de onda em escala de joia.', '[{"label":"Material","value":"Latão nobre com pérola de água doce"},{"label":"Banho","value":"Ouro 18k, 5 camadas"},{"label":"Acabamento","value":"Brilho acetinado"},{"label":"Tamanho","value":"2,2cm de comprimento"}]'::jsonb, 'Retire antes de dormir e de tomar banho. Limpe com flanela seca.', 6),
('kit-toque-de-seda', 'Kit Toque de Seda', 'sexy-shop', 'Sexy Shop', 199.9, NULL, ARRAY['/img/cat-sexyshop.jpg','/img/cat-lingerie.jpg']::text[], 'mais-vendido', 4.8, 97, ARRAY['Preto']::text[], ARRAY['Único']::text[], 'Cetim e veludo', true, true, '2026-06-30', 'Kit sensorial com faixa de cetim, pluma e óleo de massagem de aroma amadeirado. Enviado sempre em embalagem discreta.', '[{"label":"Conteúdo","value":"Faixa de cetim, pluma e óleo de massagem 100ml"},{"label":"Material","value":"Cetim, veludo e óleos vegetais"},{"label":"Privacidade","value":"Embalagem neutra, sem identificação do conteúdo"},{"label":"Validade","value":"24 meses (óleo)"}]'::jsonb, 'Mantenha em local seco e ao abrigo da luz. Uso externo.', 7),
('oleo-de-banho-noite-de-mare', 'Óleo de Banho Noite de Maré', 'sexy-shop', 'Sexy Shop', 129.9, NULL, ARRAY['/img/cat-sexyshop.jpg','/img/cat-cama.jpg']::text[], NULL, 4.6, 42, ARRAY['Neutro']::text[], ARRAY['120ml']::text[], 'Óleos vegetais', false, false, '2026-03-18', 'Óleo corporal de absorção rápida com brilho perolado discreto e aroma de sal, âmbar e flor branca.', '[{"label":"Conteúdo","value":"120ml"},{"label":"Composição","value":"Óleo de amêndoas, jojoba e vitamina E"},{"label":"Privacidade","value":"Embalagem neutra"},{"label":"Validade","value":"24 meses"}]'::jsonb, 'Uso externo. Realize teste de sensibilidade antes do primeiro uso.', 8),
('conjunto-pulseira-e-anel-onda', 'Conjunto Pulseira e Anel Onda', 'semijoias', 'Semijoias', 279.9, NULL, ARRAY['/img/prod-joia.jpg','/img/cat-semijoias.jpg']::text[], NULL, 4.9, 33, ARRAY['Prata','Dourado']::text[], ARRAY['14','16','18','Único']::text[], 'Prata 925', true, false, '2026-08-01', 'Dupla em prata 925 com desenho de onda contínua e pérola central. Para usar junto ou separado.', '[{"label":"Material","value":"Prata 925"},{"label":"Banho","value":"Ródio branco ou ouro 18k"},{"label":"Acabamento","value":"Polido com detalhe fosco"},{"label":"Tamanho","value":"Anel 14 ao 20, pulseira ajustável"}]'::jsonb, 'Guarde separadamente para evitar riscos. Limpe com flanela.', 9),
('calcinha-brisa-de-renda', 'Calcinha Brisa de Renda', 'moda-intima', 'Moda Íntima', 79.9, NULL, ARRAY['/img/prod-lingerie2.jpg','/img/cat-lingerie.jpg']::text[], NULL, 4.7, 189, ARRAY['Pérola','Preto','Marinho']::text[], ARRAY['P','M','G','GG']::text[], 'Microfibra', true, false, '2026-02-09', 'Cintura média em microfibra com laterais de renda e acabamento sem costura aparente.', '[{"label":"Tecido","value":"Microfibra com renda"},{"label":"Composição","value":"88% poliamida, 12% elastano"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Forro em algodão"}]'::jsonb, 'Lavar à mão em água fria. Não usar alvejante.', 10),
('pijama-cetim-maresia', 'Pijama Cetim Maresia', 'cama-banho', 'Cama & Banho', 299.9, 359.9, ARRAY['/img/prod-robe.jpg','/img/prod-lingerie2.jpg']::text[], 'oferta', 4.8, 74, ARRAY['Pérola','Marinho']::text[], ARRAY['P','M','G','GG']::text[], 'Cetim', true, false, '2026-05-02', 'Camisa de botões e calça de cetim com vivo contrastante em tom prata. Elegância para ficar em casa.', '[{"label":"Tecido","value":"Cetim toque frio"},{"label":"Composição","value":"97% poliéster, 3% elastano"},{"label":"Tamanhos","value":"P ao GG"},{"label":"Detalhes","value":"Vivo prata, bolso frontal"}]'::jsonb, 'Ciclo delicado a 30°C. Passar em temperatura baixa.', 11);

INSERT INTO public.categories (slug,name,tagline,description,image,sort_order) VALUES
('lingerie', 'Lingerie', 'Renda, seda e segundos olhares', 'Sutiãs, calcinhas, conjuntos, bodys, camisolas e peças sensuais para quem escolhe como quer se sentir.', '/img/cat-lingerie.jpg', 0),
('sexy-shop', 'Sexy Shop', 'Intimidade com discrição', 'Uma curadoria elegante de produtos para prazer e intimidade, com embalagem discreta em todos os pedidos.', '/img/cat-sexyshop.jpg', 1),
('moda-intima', 'Moda Íntima', 'Conforto que não abre mão do brilho', 'Básicos refinados, modeladores e peças do dia a dia com toque suave e caimento impecável.', '/img/prod-lingerie2.jpg', 2),
('cama-banho', 'Cama & Banho', 'O quarto como cenário', 'Roupas de cama, tecidos acetinados, pijamas, robes e itens para transformar a sua noite.', '/img/cat-cama.jpg', 3),
('semijoias', 'Semijoias', 'Prata, ouro e maresia', 'Brincos, colares, anéis, pulseiras e conjuntos em banho de prata e ouro 18k.', '/img/cat-semijoias.jpg', 4);