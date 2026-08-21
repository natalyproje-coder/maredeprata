# Audit and Fix Plan - Maré de Prata E-commerce

## 1. Catalog & Data Structure
- Refine `Product` and `Category` types in `src/lib/catalog.ts`.
- Ensure "Lingerie" and "Moda Íntima" are distinct or well-organized.
- Update `relatedProducts` logic to stay within the same category.

## 2. Category Page (`src/routes/categoria.$slug.tsx`)
- **Contextual Filters**: Generate filter options (sizes, colors, materials) dynamically based on products in the current category.
- **Remove Category Filter**: On category pages, don't show the category list as a filter.
- **Mobile Filter UI**: Implement a proper modal/panel for filters on mobile instead of a long bar.
- **Empty States**: Add friendly "Soon we'll have news" messages for empty categories.
- **Sorting**: Verify all sorting options (price, best sellers, news) work correctly.

## 3. Product Page (`src/routes/produto.$slug.tsx`)
- **Stock Logic**: 
    - If `stock_quantity <= 0`, replace "Add to Cart" with "Produto Esgotado".
    - Prevent adding to cart if stock is 0.
- **Variations**: Require size/color selection before adding to cart. Show error message if not selected.
- **Conditional Layout**:
    - Customize Accordion items based on category (e.g., hide size charts for Sexy Shop items if not relevant).
    - Handle specific products like "Kit Toque de Seda" and "Óleo de Banho Noite de Maré" to hide irrelevant sections (wash instructions, etc.).
- **"Buy Now" vs "Add to Cart"**:
    - "Add to Cart": Adds item and opens the cart drawer (stay on page).
    - "Buy Now": Adds item and navigates directly to `/checkout`.
- **Empty Sections**: Ensure sections like "Material", "Garantia", etc., are hidden if the data is empty.
- **Reviews**: Only show rating/review count if `reviews > 0`. Otherwise, show "Be the first to review".

## 4. Cart & Stock Logic (`src/lib/store.tsx`)
- **Stock Validation**: Prevent adding more quantity than available in `addItem` and `updateQuantity`.
- **Checkout Sync**: Check stock availability before finalizing order (in checkout loader or action).

## 5. Search & Global Navigation
- **Search Logic**: Ensure case-insensitivity, partial matches, and functional mobile search.
- **Search Empty State**: Add "No products found" with "Clear filters" and "See all products" links.
- **Mobile Responsiveness**: Audit all pages for horizontal overflow and broken layouts on 360px-430px widths.

## 6. Account & Security
- **Favorites**: Ensure persistence and proper feedback.
- **Orders**: Test the ID generation `MP-YYYY-XXXX` and ensure users can only see their own orders.

## Technical Details
- Use `framer-motion` for mobile filter transitions (already in project?).
- Use `sonner` for toast notifications.
- Ensure all Supabase calls are optimized and handled through `createServerFn` where appropriate.
