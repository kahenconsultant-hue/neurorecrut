"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false
          });
          if (result?.error) {
            setError("Identifiants invalides.");
            return;
          }
          const sessionResponse = await fetch("/api/auth/session");
          const session = (await sessionResponse.json()) as { user?: { role?: string } };
          const destination =
            session.user?.role === "ADMIN"
              ? "/admin/dashboard"
              : session.user?.role === "CANDIDATE"
                ? "/candidate/dashboard"
                : "/company/dashboard";
          router.push(destination);
          router.refresh();
        });
      }}
    >
      {searchParams.get("registered") ? (
        <div className="rounded-md border border-teal/30 bg-teal/10 px-3 py-2 text-sm text-graphite">
          Compte créé. Vous pouvez vous connecter.
        </div>
      ) : null}
      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input className="field" id="email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
        </label>
        <input className="field" id="password" name="password" type="password" required />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button className="btn-primary w-full" type="submit" disabled={isPending}>
        {isPending ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
