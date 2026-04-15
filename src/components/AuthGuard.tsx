"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If no one is logged in and they are trying to access a protected page
      if (!user && pathname !== "/auth") {
        router.replace("/auth");
      } 
      // If they are ALREADY logged in but trying to visit the login page
      else if (user && pathname === "/auth") {
        router.replace("/");
      } 
      // Stop the loading state once auth is resolved
      else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        height: "100vh", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily: "Arial, Helvetica, sans-serif"
      }}>
        <div style={{
          padding: "1.5rem",
          borderRadius: "12px",
          background: "rgba(100, 100, 100, 0.1)"
        }}>
          Authenticating...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
