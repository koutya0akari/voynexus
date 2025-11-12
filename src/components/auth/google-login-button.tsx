"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  callbackUrl?: string;
  label?: string;
  className?: string;
};

export function GoogleLoginButton({
  callbackUrl = "/",
  label = "Googleでログイン",
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    signIn("google", { callbackUrl }).catch((error) => {
      console.error("Google login failed", error);
      setLoading(false);
    });
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "リダイレクト中..." : label}
    </button>
  );
}
