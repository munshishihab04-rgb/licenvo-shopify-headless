import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useSearch } from 'wouter';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById } from '@/data/products';
import { fetchProductById, shopifyProductToProduct, createCart } from '@/lib/shopify';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import type { Product } from '@/data/products';

const faqItems = [
  { q: 'Come ricevo la mia chiave di licenza?', a: 'Dopo il pagamento, riceverai la chiave di attivazione via email entro pochi secondi. Controlla anche la cartella spam se non la trovi nella posta in arrivo.' },
  { q: 'La licenza è originale e legale?', a: 'Sì, tutte le licenze vendute su Licenvo sono originali e legittime. Le chiavi vengono acquistate direttamente dai distributori autorizzati e attivano i prodotti sui server ufficiali del produttore.' },
  { q: 'Cosa fare se la chiave non funziona?', a: "In caso di problemi con l'attivazione, contatta immediatamente il nostro supporto via email o chat. Offriamo sostituzione gratuita o rimborso completo entro 30 giorni dall'acquisto." },
  { q: 'Posso usare la licenza su più dispositivi?', a: 'Dipende dal tipo di licenza. Le licenze per singolo utente si attivano su 1 dispositivo. Le licenze family o multi-device sono indicate nella descrizione del prodotto.' },
];

const reviews = [
  { name: 'Alessandro Ricci', date: '10 Maggio 2025', rating: 5, text: 'Chiave ricevuta in 20 secondi. Attivazione perfetta al primo tentativo. Prezzo imbattibile!', verified: true },
  { name: 'Francesca Conti', date: '5 Maggio 2025', rating: 5, text: 'Ottimo servizio, prodotto originale come promesso. Lo consiglio a tutti.', verified: true },
  { name: 'Roberto Mancini', date: '28 Aprile 2025', rating: 4, text: 'Tutto funzionante, piccolo ritardo nell\'email ma risolto subito dal supporto.', verified: true },
];

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const sz = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`${sz} ${s <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {faqItems.map((item, idx) => (
        <div key={idx} className="border border-border rounded-xl overflow-hidden">
          <button onClick={() => setOpen(open === idx ? null : idx)} className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
            <span className="font-semibold text-sm text-foreground">{item.q}</span>
            <Icon name="ChevronDownIcon" size={16} className={`text-muted-foreground transition-transform duration-300 shrink-0 ml-3 ${open === idx ? 'rotate-180' : ''}`} />
          </button>
          <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open === idx ? '200px' : '0px' }}>
            <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailClient() {
  const searchStr = useSearch();
  const urlParams = new URLSearchParams(searchStr);
  const productId = urlParams.get('id') || '1';

  const { products: shopifyProducts } = useShopifyProducts();
  const [product, setProduct] = useState<(Product & { variantId?: string }) | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'descrizione' | 'compatibilita' | 'istruzioni'>('descrizione');
  const [quantity, setQuantity] = useState(1);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [quickCheckoutLoading, setQuickCheckoutLoading] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -20px 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [product]);

  const handleQuickCheckout = async () => {
    if (!product) return;
    const variantId = (product as Product & { variantId?: string }).variantId;
    if (!variantId) {
      // fallback: add to cart and open it
      addToCart(product);
      return;
    }
    setQuickCheckoutLoading(true);
    try {
      const cart = await createCart([{ merchandiseId: variantId, quantity: 1 }]);
      window.location.href = cart.checkoutUrl;
    } catch (err) {
      console.error('Quick checkout error:', err);
      addToCart(product);
    } finally {
      setQuickCheckoutLoading(false);
    }
  };

  useEffect(() => {
    setLoadingProduct(true);
    setActiveImage(0);

    fetchProductById(productId)
      .then((shopifyProduct) => {
        if (shopifyProduct) {
          setProduct(shopifyProductToProduct(shopifyProduct));
        } else {
          const fallback = getProductById(productId);
          if (fallback) setProduct(fallback);
        }
      })
      .catch(() => {
        const fallback = getProductById(productId);
        if (fallback) setProduct(fallback);
      })
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  if (loadingProduct || !product) {
    return (
      <div className="section-container py-20 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Caricamento prodotto da Shopify...</p>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.nameIt,
            description: product.descriptionIt,
            offers: {
              '@type': 'Offer',
              price: product.salePrice,
              priceCurrency: 'EUR',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: product.reviewCount > 0 ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            } : undefined,
          }),
        }}
      />

      <div className="section-container py-8">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <Icon name="ChevronRightIcon" size={12} />
          <Link href="/product-catalog" className="hover:text-foreground transition-colors">Catalogo</Link>
          <Icon name="ChevronRightIcon" size={12} />
          <span className="text-foreground truncate max-w-[200px]">{product.nameIt}</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-10 mb-16">
          {/* Gallery */}
          <div className="lg:col-span-5 space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border relative flex items-center justify-center">
              <AppImage
                src={product.images[activeImage] || product.image}
                alt={`${product.nameIt} — immagine ${activeImage + 1}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-6"
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="discount-badge text-sm font-bold px-3 py-1 rounded-full">-{product.discount}%</span>
                </div>
              )}
              {product.instantDelivery && (
                <div className="absolute top-4 right-4">
                  <span className="instant-badge text-xs font-bold px-3 py-1.5 rounded-full">⚡ Consegna Istantanea</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(idx)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all bg-muted ${activeImage === idx ? 'border-primary' : 'border-border hover:border-primary/50'}`}>
                    <AppImage src={img} alt={`thumbnail ${idx + 1}`} width={64} height={64} className="w-full h-full object-contain p-1.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-primary bg-primary/15 px-2.5 py-1 rounded-full">{product.category}</span>
                {product.isBestseller && <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">🔥 Più Venduto</span>}
                {product.isNew && <span className="text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-full">✨ Nuovo</span>}
              </div>
              <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-3">{product.nameIt}</h1>
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size="sm" />
                <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                {product.reviewCount > 0 && <span className="text-sm text-muted-foreground">({product.reviewCount.toLocaleString('it-IT')} recensioni)</span>}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2">
                <Icon name="ComputerDesktopIcon" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{product.platform}</span>
              </div>
              <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl px-3 py-2">
                <Icon name="GlobeAltIcon" size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{product.region}</span>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: 'BoltIcon', text: 'Consegna istantanea via email', color: 'text-amber-400' },
                { icon: 'ShieldCheckIcon', text: 'Licenza originale garantita al 100%', color: 'text-emerald-400' },
                { icon: 'ArrowPathIcon', text: 'Garanzia rimborso 30 giorni', color: 'text-blue-400' },
              ].map((g) => (
                <div key={g.text} className="flex items-center gap-2.5 text-sm">
                  <Icon name={g.icon as Parameters<typeof Icon>[0]['name']} size={15} className={g.color} />
                  <span className="text-muted-foreground">{g.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Box */}
          <div className="lg:col-span-3">
            <div className="sticky top-20 glass-card rounded-2xl p-6 space-y-5 border border-primary/20">
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="price-mono text-3xl font-extrabold text-primary">€{product.salePrice.toFixed(2)}</span>
                  {product.originalPrice > product.salePrice && (
                    <span className="price-mono text-base text-muted-foreground line-through">€{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                {product.discount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="discount-badge text-xs font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>
                    <span className="text-xs text-emerald-600 font-semibold">Risparmi €{(product.originalPrice - product.salePrice).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-widest font-semibold block mb-2">Quantità</label>
                <div className="flex items-center gap-3 border border-border rounded-xl overflow-hidden w-fit">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-bold">−</button>
                  <span className="px-3 font-bold text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors font-bold">+</button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  ref={ctaRef}
                  onClick={() => { for (let i = 0; i < quantity; i++) addToCart(product); }}
                  className="w-full btn-primary py-3.5 font-bold flex items-center justify-center gap-2 neon-glow-purple"
                >
                  <Icon name="ShoppingCartIcon" size={17} variant="solid" />
                  Aggiungi al Carrello
                </button>
                <button
                  onClick={() => toggle(product)}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold text-sm transition-all ${wishlisted ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:text-foreground'}`}
                >
                  <Icon name="HeartIcon" size={15} variant={wishlisted ? 'solid' : 'outline'} />
                  {wishlisted ? 'Nei Preferiti' : 'Aggiungi ai Preferiti'}
                </button>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-600 text-sm">⚡</span>
                  <span className="text-emerald-700 text-xs font-bold">Consegna Istantanea</span>
                </div>
                <p className="text-xs text-muted-foreground">Ricevi la chiave via email entro pochi secondi dal pagamento.</p>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest">Metodi di Pagamento</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['Visa', 'Mastercard', 'PayPal', 'Klarna'].map((pm) => (
                    <span key={pm} className="text-[10px] bg-muted px-2 py-1 rounded font-medium text-muted-foreground">{pm}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-16">
          <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto scrollbar-hide">
            {(['descrizione', 'compatibilita', 'istruzioni'] as const).map((tab) => {
              const labels = { descrizione: 'Descrizione', compatibilita: 'Compatibilità', istruzioni: 'Istruzioni di Attivazione' };
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          <div className="glass-card rounded-2xl p-6">
            {activeTab === 'descrizione' && (
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed mb-4">{product.descriptionIt}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {['Licenza originale con attivazione garantita', 'Aggiornamenti inclusi per tutta la durata della licenza', 'Supporto tecnico disponibile in italiano', 'Consegna via email in pochi secondi'].map((item) => (
                    <li key={item} className="flex items-center gap-2"><Icon name="CheckCircleIcon" size={14} className="text-emerald-500 shrink-0" /> {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {activeTab === 'compatibilita' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Piattaforma', value: product.platform },
                  { label: 'Regione', value: product.region },
                  { label: 'Categoria', value: product.category },
                  { label: 'Tipo Licenza', value: 'Retail' },
                  { label: 'Lingua', value: 'Multilingua' },
                  { label: 'Supporto', value: '24/7' },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/40 rounded-xl p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 'istruzioni' && (
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Completa il pagamento', desc: 'Procedi al checkout sicuro Shopify e completa il pagamento.' },
                  { step: '02', title: 'Ricevi la chiave', desc: 'Riceverai la chiave di attivazione via email entro pochi secondi.' },
                  { step: '03', title: 'Attiva il prodotto', desc: 'Segui le istruzioni nell\'email per attivare il prodotto sul tuo dispositivo.' },
                  { step: '04', title: 'Goditi il prodotto', desc: 'Inizia subito a utilizzare il tuo software con licenza originale.' },
                ].map((s) => (
                  <div key={s.step} className="flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">{s.step}</div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-0.5">{s.title}</p>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6">Recensioni dei Clienti</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="price-mono text-5xl font-extrabold text-foreground">{product.rating}</div>
              <StarRating rating={product.rating} size="lg" />
              {product.reviewCount > 0 && <p className="text-sm text-muted-foreground">{product.reviewCount.toLocaleString('it-IT')} recensioni verificate</p>}
            </div>
            <div className="lg:col-span-2 space-y-4">
              {reviews.map((r) => (
                <div key={r.name} className="glass-card-light rounded-xl p-4 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">{r.name[0]}</div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{r.name}</p>
                        <p className="text-[10px] text-muted-foreground">{r.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.rating} />
                      {r.verified && <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">✓ Verificato</span>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-foreground mb-6">Domande Frequenti</h2>
          <FaqAccordion />
        </div>

        {/* Related Products — only from Shopify */}
        {(() => {
          const related = shopifyProducts
            .filter((p) => p.id !== product.id && p.category === product.category)
            .slice(0, 4);
          const fallback = related.length >= 2 ? related : shopifyProducts.filter((p) => p.id !== product.id).slice(0, 4);
          if (shopifyProducts.length === 0) return null;
          return (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Prodotti Correlati</h2>
                <Link href="/product-catalog" className="btn-ghost text-sm flex items-center gap-1">
                  Vedi tutti <Icon name="ArrowRightIcon" size={14} />
                </Link>
              </div>
              {/* Horizontal scroll on mobile, grid on desktop */}
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible">
                {fallback.map((p) => (
                  <div key={p.id} className="snap-start shrink-0 w-[70vw] sm:w-auto">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* ── STICKY BOTTOM BAR (mobile only) ── */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          showStickyBar
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-card/95 backdrop-blur-xl border-t border-border shadow-lg px-4 pt-3 pb-4 safe-area-bottom">
          {/* Top row: thumbnail + name + price */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
              <img
                src={product.image}
                alt={product.nameIt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{product.nameIt}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="price-mono font-extrabold text-primary text-base leading-none">
                  €{product.salePrice.toFixed(2)}
                </span>
                {product.originalPrice > product.salePrice && (
                  <span className="price-mono text-xs text-muted-foreground line-through">
                    €{product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="discount-badge text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    -{product.discount}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom row: two buttons */}
          <div className="flex gap-2">
            {/* Add to cart */}
            <button
              onClick={() => addToCart(product)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary font-semibold text-sm transition-all hover:bg-primary/20"
            >
              <Icon name="ShoppingCartIcon" size={15} />
              Carrello
            </button>

            {/* Quick checkout */}
            <button
              onClick={handleQuickCheckout}
              disabled={quickCheckoutLoading}
              className="flex-1 btn-primary py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 neon-glow-purple disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {quickCheckoutLoading ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Attendi…
                </>
              ) : (
                <>
                  <Icon name="BoltIcon" size={15} variant="solid" />
                  Acquista ora
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
