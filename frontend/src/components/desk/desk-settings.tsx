"use client";

import { deskFieldClass, useDesk } from "@/components/desk/desk-shell";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { Button } from "@/components/ui/button";
import { deskChangePassword, deskLogout } from "@/lib/api/desk";
import { defaultTheme, parseTheme, themeCookieName } from "@/lib/theme";
import { useState } from "react";

export function DeskSettings() {
  const { dictionary, user, fail, toast } = useDesk();
  const copy = dictionary.desk;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const theme =
    typeof document === "undefined"
      ? defaultTheme
      : parseTheme(
          document.cookie
            .split("; ")
            .find((part) => part.startsWith(`${themeCookieName}=`))
            ?.split("=")[1],
        );

  return (
    <section className="mx-auto w-full max-w-xl">
      <h1 className="font-display text-3xl">{copy.nav.settings}</h1>
      <p className="mt-4 text-lg">{user.name}</p>
      <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
        {user.email}
      </p>

      <div className="mt-8">
        <p className="mb-3 text-sm text-muted-foreground">{dictionary.theme.label}</p>
        <ThemeSwitcher currentTheme={theme} labels={dictionary.theme} />
      </div>

      <form
        className="mt-10 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          setBusy(true);
          setError(undefined);
          void deskChangePassword(currentPassword, newPassword)
            .then(() => {
              setCurrentPassword("");
              setNewPassword("");
              toast(copy.passwordChanged);
            })
            .catch(() => setError(copy.passwordError))
            .finally(() => setBusy(false));
        }}
      >
        <label className="block">
          {copy.currentPassword}
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        <label className="block">
          {copy.newPassword}
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className={deskFieldClass()}
          />
        </label>
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        <Button size="touch" type="submit" loading={busy}>
          {copy.save}
        </Button>
      </form>

      <Button
        className="mt-10"
        size="touch"
        variant="outline"
        onClick={() => {
          void deskLogout().catch(fail).then(() => {
            window.location.reload();
          });
        }}
      >
        {copy.signOut}
      </Button>
    </section>
  );
}
