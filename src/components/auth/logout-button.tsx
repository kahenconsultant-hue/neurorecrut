"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-graphite hover:bg-mist"
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="h-4 w-4" />
      Déconnexion
    </button>
  );
}
