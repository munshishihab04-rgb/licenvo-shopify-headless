# Shopify Storefront API Integration

## 1. Create Private App

1. Go to Shopify Admin > Apps > Develop apps
2. Create an app
3. Configure Storefront API access

## 2. Required Scopes

- read_products
- read_collections
- read_customers
- read_orders (if needed)

## 3. Environment Variables

Add to .env:

SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxx
SHOPIFY_API_VERSION=2025-07

## 4. Usage

Use the generated client from lib/api-client-react

Example:

```ts
import { useQuery } from '@tanstack/react-query'
import { storefrontClient } from '../lib/api-client-react'

const { data } = useQuery({
  queryKey: ['products'],
  queryFn: () => storefrontClient.getProducts()
})
```
