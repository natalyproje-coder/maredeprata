# Auditoria e Finalização Maré de Prata

Este plano detalha as ações para auditar, corrigir e finalizar o e-commerce Maré de Prata, transformando-o em uma loja profissional e pronta para produção.

## 1. Configuração Centralizada (Single Source of Truth)
- Criar um arquivo de configuração central para dados da empresa (CNPJ, Razão Social, Contato, Redes Sociais).
- Substituir todos os placeholders (00.000.000/0001-00) por variáveis desta configuração.
- Facilitar a alteração futura pelo proprietário.

## 2. Catálogo e Filtros Inteligentes
- **Estrutura Dinâmica**: Adaptar os campos de detalhes do produto por categoria (ex: Tabela de medidas para Lingerie vs. Modo de uso para Sexy Shop).
- **Filtros Contextuais**: Corrigir a lógica para que filtros de Semijoias (Prata 925) não apareçam em Sexy Shop.
- **Estoque Real**: Impedir compra de itens esgotados e adicionar botão "Avise-me".

## 3. Experiência de Compra e Checkout
- **Carrinho**: Implementar barra de progresso para Frete Grátis (alvo: R$399).
- **Botões**: Diferenciar claramente "Adicionar ao Carrinho" (permanece na página) de "Comprar Agora" (vai para checkout).
- **Checkout**: Validar CPF/CEP, persistir dados em caso de erro e integrar geração de ID de pedido único.
- **Pagamentos**: Exibir apenas métodos realmente funcionais.

## 4. Auditoria de UX/UI e Responsividade
- **Mobile-First**: Refinar menu, filtros e checkout para telas pequenas.
- **Políticas Reais**: Criar páginas de Troca e Devolução específicas para produtos íntimos.
- **Busca**: Implementar busca por palavras-chave relacionadas e estados "não encontrado".

## 5. Qualidade e Segurança
- **Dados Reais**: Remover avaliações fictícias e placeholders de texto.
- **Acessibilidade**: Revisar contrastes e labels para navegação assistida.
- **Performance**: Otimizar carregamento de imagens e assets.

## Detalhes Técnicos
- Armazenamento de configurações na tabela `site_content` (Supabase).
- Lógica de filtros baseada em metadados de categoria.
- Middleware de validação de estoque em server functions.
