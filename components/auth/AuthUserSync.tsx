"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import { getUser, setUser } from "@/lib/auth";

// Middleware guarantees a valid server session on /dashboard. If the cached
// user is missing (e.g. localStorage was cleared), restore it from the server
// instead of bouncing to /login, which middleware would bounce back.
export function AuthUserSync({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getUser()) {
      setReady(true);
      return;
    }
    authApi
      .me()
      .then((user) => {
        setUser(user);
        setReady(true);
      })
      .catch(() => {
        // apiFetch already redirects to /login on 401
      });
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
