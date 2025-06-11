"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function AuthObserver({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      localStorage.removeItem("projectid");
    }
  }, [isLoaded, isSignedIn]);

  return <>{children}</>;
}
