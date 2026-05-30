# 🚀 Licenvo - Shopify Headless Monorepo

**Modern, flexible & production-ready Shopify Headless starter**

Built with **React 19 + Vite 7 + pnpm workspaces**. A powerful, customizable alternative to Shopify Hydrogen.

[![CI](https://github.com/munshishihab04-rgb/licenvo-shopify-headless/actions/workflows/ci.yml/badge.svg)](https://github.com/munshishihab04-rgb/licenvo-shopify-headless/actions/workflows/ci.yml)

---

## ✨ Why Licenvo instead of Hydrogen?

Shopify Hydrogen is excellent if you want the fastest path inside the Shopify ecosystem.

**Licenvo** is the better choice when you want:

- **Maximum customization freedom**
- Full control over hosting, routing, and backend logic
- Easier long-term evolution of the project
- Native support for custom business logic (B2B, subscriptions, complex pricing, etc.)
- Better separation between web, mobile, and API layers

### Comparison Table (2026)

| Feature                      | Shopify Hydrogen                          | **Licenvo (This Repo)**                      | Winner      |
|-----------------------------|-------------------------------------------|----------------------------------------------|-------------|
| **Framework**               | React Router 7 (Remix-based)             | React 19 + Wouter (or React Router)         | Licenvo    |
| **Hosting**                 | Best on Oxygen                           | Any (Vercel, Cloudflare, Railway, self-host)| **Licenvo**|
| **Customization**           | High (but opinionated)                   | **Maximum**                                  | **Licenvo**|
| **Custom Backend**          | Limited                                  | Full (your own `api-server`)                 | **Licenvo**|
| **Mobile App**              | Possible                                 | Dedicated folder ready                       | **Licenvo**|
| **Italian Legal Pages**     | Manual work                              | **Included & complete**                      | **Licenvo**|
| **Dev Experience**          | Excellent (Shopify tools)                | Excellent + full monorepo control            | Pareggio   |
| **Long-term Ownership**     | Tied to Shopify conventions              | Full ownership                               | **Licenvo**|

**Recommendation**: Use Licenvo if Shopify is < 70-80% of your commerce logic or you need heavy customization.

---

## 📁 Project Structure

```
licenvo-shopify-headless/
├── artifacts/
│   ├── licenvo/              # Main storefront (React + Vite + shadcn/ui)
│   ├── licenvo-mobile/       # Mobile app (Expo / React Native ready)
│   ├── api-server/           # Your custom backend (Drizzle + OpenAPI)
│   └── mockup-sandbox/
├── lib/
│   ├── api-spec/             # OpenAPI 3.1 + Orval codegen
│   ├── api-zod/              # Shared validation schemas
│   ├── api-client-react/     # Generated typed client
│   └── db/                   # Drizzle ORM schemas
├── scripts/                    # Utility & setup scripts
├── .github/workflows/ci.yml    # CI pipeline
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/munshishihab04-rgb/licenvo-shopify-headless.git
cd licenvo-shopify-headless

# 1. Install dependencies
pnpm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your Shopify Storefront credentials

# 3. Start development
pnpm dev
```

## 🔧 Connect to Your Shopify Store

1. Shopify Admin → Apps → Develop apps → Create an app
2. Configure **Storefront API** access (read products, collections, cart, etc.)
3. Copy the **Storefront access token**
4. Paste it in `.env`
5. Use the generated client from `lib/api-client-react`

## 📊 Available Scripts

```bash
pnpm dev          # Start all dev servers
pnpm build        # Build everything
pnpm typecheck    # TypeScript strict check
pnpm lint         # Lint all packages
```

## 🚀 Deploy Recommendations

- **Web (licenvo)**: Vercel or Cloudflare Pages (best DX)
- **API Server**: Railway, Render or Fly.io
- **Full monorepo**: Railway or your own VPS

---

## 🎯 Key Advantages of This Starter

- Professional monorepo with pnpm
- Type-safe API layer (OpenAPI + Orval + Zod)
- Complete Italian legal pages ready (GDPR, CGV, Resi 30gg)
- CI/CD with GitHub Actions included
- Maximum flexibility vs opinionated frameworks
- Ready for custom business logic

---

## 📄 License

MIT © 2026

**Built for developers who want full control over their Shopify Headless experience.**
