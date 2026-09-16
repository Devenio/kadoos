"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { deskLogin, deskLogout, deskMe } from "@/lib/api/desk";
import { text } from "@/lib/shop-format";
import { cn } from "@/lib/utils";
import type { DeskUser } from "@/types/booking";
import {
  CalendarDaysIcon,
  Clock3Icon,
  MenuIcon,
  ScissorsIcon,
  SettingsIcon,
  StoreIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const fieldClass =
  "mt-2 h-12 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type DeskContextValue = {
  locale: Locale;
  dictionary: Dictionary;
  user: DeskUser;
  toast: (message: string) => void;
  fail: () => void;
};

const DeskContext = createContext<DeskContextValue | null>(null);

export function useDesk(): DeskContextValue {
  const value = useContext(DeskContext);
  if (!value) {
    throw new Error("useDesk must be used inside DeskShell");
  }
  return value;
}

export function deskFieldClass(): string {
  return fieldClass;
}

type DeskShellProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
};

export function DeskShell({ locale, dictionary, children }: DeskShellProps) {
  const [user, setUser] = useState<DeskUser | null>(null);
  const [notice, setNotice] = useState<string>();
  const copy = dictionary.desk;

  useEffect(() => {
    void deskMe().then((next) => {
      if (next) {
        setUser(next);
      }
    });
  }, []);

  const toast = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(undefined), 3200);
  }, []);

  const fail = useCallback(() => {
    toast(copy.saveError);
  }, [copy.saveError, toast]);

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
        <DeskLogin
          locale={locale}
          dictionary={dictionary}
          onSignedIn={setUser}
        />
      </div>
    );
  }

  return (
    <DeskContext.Provider
      value={{ locale, dictionary, user, toast, fail }}
    >
      <div className="fixed inset-0 z-50 flex bg-background">
        <DeskFrame
          locale={locale}
          dictionary={dictionary}
          user={user}
          notice={notice}
          onSignedOut={() => setUser(null)}
        >
          {children}
        </DeskFrame>
      </div>
    </DeskContext.Provider>
  );
}

function DeskLogin({
  locale,
  dictionary,
  onSignedIn,
}: {
  locale: Locale;
  dictionary: Dictionary;
  onSignedIn: (user: DeskUser) => void;
}) {
  const copy = dictionary.desk;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-3">
        <p className="font-display text-xl text-foreground">{dictionary.brand}</p>
        <LanguageSwitcher locale={locale} labels={dictionary.language} />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{copy.eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl text-foreground">{copy.title}</h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">{copy.body}</p>
      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setLoading(true);
          setError(undefined);
          void deskLogin(email.trim(), password)
            .then(onSignedIn)
            .catch(() => setError(copy.signInError))
            .finally(() => setLoading(false));
        }}
      >
        <label className="block">
          <span className="text-base text-foreground">{copy.email}</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="username"
            dir="ltr"
            required
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-base text-foreground">{copy.password}</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            required
            className={fieldClass}
          />
        </label>
        {error ? (
          <p className="text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button size="touch" type="submit" loading={loading} className="w-full">
          {copy.signIn}
        </Button>
      </form>
    </div>
  );
}

function DeskFrame({
  locale,
  dictionary,
  user,
  notice,
  onSignedOut,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  user: DeskUser;
  notice?: string;
  onSignedOut: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const copy = dictionary.desk;
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useMemo(() => navItems(locale, copy), [copy, locale]);
  const primary = items.slice(0, 2);
  const rest = items.slice(2);

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="hidden w-56 shrink-0 flex-col border-e border-border lg:flex">
        <div className="px-5 py-6">
          <p className="text-sm text-muted-foreground">{copy.hello}</p>
          <p className="mt-1 font-display text-2xl leading-tight text-foreground">
            {text(locale, user.shopName)}
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>
        <div className="px-3 py-4">
          <Button
            variant="outline"
            size="touch"
            className="w-full"
            onClick={() => {
              void deskLogout().then(onSignedOut);
            }}
          >
            {copy.signOut}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 lg:px-8">
          <div className="min-w-0 lg:hidden">
            <p className="truncate font-display text-xl text-foreground">
              {text(locale, user.shopName)}
            </p>
          </div>
          <div className="ms-auto flex items-center gap-2">
            <LanguageSwitcher locale={locale} labels={dictionary.language} />
            <Button
              variant="outline"
              size="touch"
              className="hidden sm:inline-flex lg:hidden"
              onClick={() => {
                void deskLogout().then(onSignedOut);
              }}
            >
              {copy.signOut}
            </Button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-3">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-xs",
                isActive(pathname, item.href)
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="size-5" />
            {copy.nav.menu}
          </button>
        </div>
      </nav>

      {menuOpen ? (
        <div className="fixed inset-0 z-20 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20"
            aria-label={copy.nav.close}
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-background px-4 pb-8 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-display text-xl">{copy.nav.menu}</p>
              <Button
                size="icon-lg"
                variant="outline"
                aria-label={copy.nav.close}
                onClick={() => setMenuOpen(false)}
              >
                <XIcon />
              </Button>
            </div>
            <div className="grid gap-1">
              {rest.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-base text-foreground hover:bg-muted"
                >
                  <item.icon className="size-5 text-muted-foreground" />
                  {item.label}
                </Link>
              ))}
              <Button
                variant="outline"
                size="touch"
                className="mt-3"
                onClick={() => {
                  void deskLogout().then(onSignedOut);
                }}
              >
                {copy.signOut}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p
          role="status"
          className="pointer-events-none fixed inset-x-4 bottom-20 z-30 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-lg lg:bottom-6 lg:end-6 lg:start-auto lg:w-80"
        >
          {notice}
        </p>
      ) : null}
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: typeof CalendarDaysIcon;
};

function navItems(locale: Locale, copy: Dictionary["desk"]): NavItem[] {
  const base = `/${locale}/desk`;
  return [
    { href: base, label: copy.nav.today, icon: ScissorsIcon },
    { href: `${base}/calendar`, label: copy.nav.calendar, icon: CalendarDaysIcon },
    { href: `${base}/barbers`, label: copy.nav.barbers, icon: UsersIcon },
    { href: `${base}/services`, label: copy.nav.services, icon: ScissorsIcon },
    { href: `${base}/hours`, label: copy.nav.hours, icon: Clock3Icon },
    { href: `${base}/shop`, label: copy.nav.shop, icon: StoreIcon },
    { href: `${base}/payouts`, label: copy.nav.payouts, icon: WalletIcon },
    { href: `${base}/settings`, label: copy.nav.settings, icon: SettingsIcon },
  ];
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
      )}
    >
      <item.icon className="size-4" />
      {item.label}
    </Link>
  );
}

function isActive(pathname: string, href: string): boolean {
  if (pathname === href) {
    return true;
  }
  if (href.endsWith("/desk")) {
    return pathname === href;
  }
  return pathname.startsWith(href);
}
