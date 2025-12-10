"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function GoogleButton() {
  const buttonRef = useRef(null);
  const { loginGoogle } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined" && window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleGoogleResponse,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
      });
    }
  }, []);

  const handleGoogleResponse = async (response: any) => {
    await loginGoogle(response.credential);
  };

  return <div ref={buttonRef}></div>;
}
