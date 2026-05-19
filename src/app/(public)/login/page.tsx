import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PublicNav } from "@/components/layout/public-nav";

export default function LoginPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-4 py-12">
        <div className="panel w-full p-6">
          <h1 className="text-2xl font-bold text-ink">Connexion</h1>
          <p className="mt-2 text-sm text-gray-600">Accédez à votre espace entreprise ou admin.</p>
          <div className="mt-6">
            <Suspense fallback={<div className="text-sm text-gray-500">Chargement...</div>}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-5 text-sm text-gray-600">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-coral">
              Créer une entreprise
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
