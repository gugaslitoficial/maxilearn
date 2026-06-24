"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import type { CSSProperties, FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";

interface FormErrors {
  email?: string;
  password?: string;
}

const inputBase: CSSProperties = {
  width: "100%",
  fontFamily: "inherit",
  fontSize: 14.5,
  fontWeight: 500,
  color: "#16100f",
  background: "#faf7f7",
  border: "1px solid #eadfdf",
  borderRadius: 11,
  padding: "13px 15px",
  outline: "none",
  transition: "border-color .15s, background .15s",
  boxSizing: "border-box",
};

function EyeOpen() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.75s linear infinite" }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function extractErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (typeof data?.message === "string") return data.message;
  }
  return "Erro ao fazer login. Tente novamente.";
}

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!email.trim()) e.email = "E-mail obrigatório";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Senha obrigatória";
    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setAuthError("");
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setAuthError(extractErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "40px clamp(28px,4vw,56px)",
        minHeight: "100vh",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: 380,
          width: "100%",
          margin: "0 auto",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            marginBottom: 36,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#CC1F1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(204,31,31,0.28)",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                border: "3px solid #fff",
                borderRadius: "50%",
                borderRightColor: "transparent",
                transform: "rotate(-45deg)",
              }}
            />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", color: "#1a1414" }}>
            MaxiLearn
          </span>
        </Link>

        <h2
          style={{
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#16100f",
          }}
        >
          Bem-vindo de volta
        </h2>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.55,
            fontWeight: 500,
            color: "#6a605e",
            marginTop: 8,
            marginBottom: 30,
          }}
        >
          Entre com suas credenciais para acessar a plataforma.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {/* E-mail */}
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#3a3030",
              marginBottom: 7,
            }}
          >
            E-mail
          </label>
          <input
            type="email"
            placeholder="voce@empresa.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            style={{ ...inputBase, borderColor: errors.email ? "#CC1F1F" : "#eadfdf" }}
            className="focus:border-[#CC1F1F] focus:bg-white"
          />
          {errors.email && (
            <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
              {errors.email}
            </p>
          )}

          {/* Senha */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 18,
              marginBottom: 7,
            }}
          >
            <label style={{ fontSize: 13, fontWeight: 700, color: "#3a3030" }}>Senha</label>
            <Link
              href="/recuperar-senha"
              style={{ fontSize: 13, fontWeight: 700, color: "#CC1F1F", textDecoration: "none" }}
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div style={{ position: "relative" }}>
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              style={{
                ...inputBase,
                paddingRight: 46,
                borderColor: errors.password ? "#CC1F1F" : "#eadfdf",
              }}
              className="focus:border-[#CC1F1F] focus:bg-white"
            />
            <button
              type="button"
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
              onClick={() => setShowPw((v) => !v)}
              style={{
                position: "absolute",
                right: 6,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#8a807e",
              }}
            >
              {showPw ? <EyeOff /> : <EyeOpen />}
            </button>
          </div>
          {errors.password && (
            <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
              {errors.password}
            </p>
          )}

          {/* Auth error */}
          {authError && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, background: "#fceeee", border: "1px solid #f6d6d6", borderRadius: 10, padding: "11px 14px", marginTop: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CC1F1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#CC1F1F", margin: 0 }}>{authError}</p>
            </div>
          )}

          {/* Entrar */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              marginTop: 24,
              fontFamily: "inherit",
              fontSize: 15.5,
              fontWeight: 800,
              color: "#fff",
              background: "#CC1F1F",
              border: "none",
              borderRadius: 11,
              padding: 15,
              cursor: isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 10px 24px rgba(204,31,31,0.28)",
              opacity: isSubmitting ? 0.8 : 1,
              transition: "opacity .15s",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Entrando…" : "Entrar"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#ece4e4" }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#a89e9c" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "#ece4e4" }} />
        </div>

        {/* Criar conta */}
        <Link
          href="/cadastro"
          style={{
            display: "block",
            textAlign: "center",
            width: "100%",
            fontFamily: "inherit",
            fontSize: 15.5,
            fontWeight: 700,
            color: "#16100f",
            textDecoration: "none",
            background: "#fff",
            border: "1.5px solid #e2d9d9",
            borderRadius: 11,
            padding: 14,
          }}
          className="hover:bg-[#faf7f7] transition-colors"
        >
          Criar conta
        </Link>

        {/* Legal */}
        <p
          style={{
            fontSize: 12.5,
            fontWeight: 500,
            color: "#a89e9c",
            textAlign: "center",
            marginTop: 26,
            lineHeight: 1.55,
          }}
        >
          Ao entrar, você concorda com os{" "}
          <a href="#" style={{ color: "#6a605e", fontWeight: 600 }}>
            Termos
          </a>{" "}
          e a{" "}
          <a href="#" style={{ color: "#6a605e", fontWeight: 600 }}>
            Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
