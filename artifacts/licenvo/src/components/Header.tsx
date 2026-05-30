import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

const navCategories = [
  { label: 'Windows & Office', href: '/product-catalog?cat=windows-office', icon: 'WindowIcon' },
  { label: 'Abbonamenti', href: '/product-catalog?cat=abbonamenti', icon: 'CreditCardIcon' },
  { label: 'Antivirus', href: '/product-catalog?cat=antivirus', icon: 'ShieldCheckIcon' },
  { label: 'Gaming Keys', href: '/product-catalog?cat=gaming', icon: 'PuzzlePieceIcon' },
  { label: 'VPN', href: '/product-catalog?cat=vpn', icon: 'LockClosedIcon' },
  { label: 'Adobe', href: '/product-catalog?cat=adobe', icon: 'SparklesIcon' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');
  const catRef = useRef<HTMLDivElement>(null);
  const { openCart, itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearch.trim()) {
      setMobileOpen(false);
      navigate(`/product-catalog?q=${encodeURIComponent(mobileSearch)}`);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="section-container">
          {/* ── MOBILE HEADER (< lg) ── */}
          <div className="flex lg:hidden items-center h-16 relative">
            {/* Left: hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
            >
              <Icon name="Bars3Icon" size={22} />
            </button>

            {/* Center: logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <AppLogo size={30} />
              <span className="font-bold text-lg text-foreground tracking-tight">Licenvo</span>
            </Link>

            {/* Right: cart */}
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={openCart}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                <Icon name="ShoppingCartIcon" size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── DESKTOP HEADER (>= lg) ── */}
          <div className="hidden lg:flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <AppLogo size={32} />
              <span className="font-bold text-xl text-foreground tracking-tight">Licenvo</span>
            </Link>

            {/* Category Dropdown */}
            <div className="relative" ref={catRef}>
              <button
                onClick={() => setCatOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted/50"
              >
                <Icon name="Squares2X2Icon" size={16} />
                Categorie
                <Icon name="ChevronDownIcon" size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 glass-card rounded-xl shadow-xl overflow-hidden z-50">
                  {navCategories.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setCatOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Icon name={cat.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary" />
                      {cat.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <form
              className="flex flex-1 max-w-md"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate(`/product-catalog?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery('');
                }
              }}
            >
              <div className="relative w-full">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cerca licenze, giochi, antivirus..."
                  className="w-full bg-muted/60 border border-border text-foreground placeholder-muted-foreground rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 ml-auto">
              <Link href="/product-catalog" className="btn-ghost text-sm flex items-center gap-1.5">
                Catalogo
              </Link>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                <Icon name="HeartIcon" size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button
                onClick={openCart}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                <Icon name="ShoppingCartIcon" size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <Link href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50 flex">
                <Icon name="UserCircleIcon" size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE MENU DRAWER (slides from left) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AppLogo size={26} />
                <span className="font-bold text-foreground">Licenvo</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-4 py-3 border-b border-border">
              <form onSubmit={handleMobileSearch}>
                <div className="relative">
                  <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={mobileSearch}
                    onChange={(e) => setMobileSearch(e.target.value)}
                    placeholder="Cerca prodotti..."
                    className="w-full bg-muted/60 border border-border text-foreground placeholder-muted-foreground rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
                    autoFocus
                  />
                </div>
              </form>
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
              {/* Essential links */}
              <Link
                href="/product-catalog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Icon name="TagIcon" size={17} className="text-primary" />
                Tutti i Prodotti
              </Link>

              <div className="pt-3 pb-1 px-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Categorie</span>
              </div>

              {navCategories.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Icon name={cat.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-primary/70" />
                  {cat.label}
                </Link>
              ))}

              <div className="border-t border-border my-2" />

              <button
                onClick={() => { setMobileOpen(false); openCart(); }}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Icon name="ShoppingCartIcon" size={17} className="text-primary/70" />
                Carrello
                {itemCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              <Link
                href="#"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Icon name="HeartIcon" size={17} className="text-primary/70" />
                Preferiti
                {wishlistCount > 0 && (
                  <span className="ml-auto bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="#"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Icon name="UserCircleIcon" size={17} className="text-primary/70" />
                Il Mio Account
              </Link>

              <Link
                href="/help-center"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Icon name="QuestionMarkCircleIcon" size={17} className="text-primary/70" />
                Assistenza
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
