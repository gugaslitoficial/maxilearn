"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties, FormEvent } from "react";

type View = "request" | "sent";

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

function BackLink() {
  return (
    <Link
      href="/login"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        fontSize: 14,
        fontWeight: 700,
        color: "#6a605e",
        textDecoration: "none",
        marginTop: 24,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Voltar ao login
    </Link>
  );
}

export function RecuperarSenhaForm() {
  const [view, setView] = useState<View>("request");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Digite um e-mail válido");
      return;
    }
    setError("");
    // TODO: integrar com API de recuperação de senha (ainda não implementada no backend)
    setView("sent");
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

        {view === "request" ? (
          <>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#16100f",
              }}
            >
              Esqueceu a senha?
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
              Sem problemas. Digite o e-mail da sua conta e enviaremos um link para redefinir a senha.
            </p>

            <form onSubmit={handleSend} noValidate>
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
                style={{ ...inputBase, borderColor: error ? "#CC1F1F" : "#eadfdf" }}
                className="focus:border-[#CC1F1F] focus:bg-white"
              />
              {error && (
                <p style={{ fontSize: 12, color: "#CC1F1F", marginTop: 4, fontWeight: 600 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: "100%",
                  marginTop: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  fontFamily: "inherit",
                  fontSize: 15.5,
                  fontWeight: 800,
                  color: "#fff",
                  background: "#CC1F1F",
                  border: "none",
                  borderRadius: 11,
                  padding: 15,
                  cursor: "pointer",
                  boxShadow: "0 10px 24px rgba(204,31,31,0.28)",
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                Enviar link de recuperação
              </button>
            </form>

            <BackLink />
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                background: "#e8f5ee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                animation: "ml-pop .4s ease",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1f8a5b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="M22 4 12 14.01l-3-3" />
              </svg>
            </div>

            <h2
              style={{
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#16100f",
              }}
            >
              Verifique seu e-mail
            </h2>
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                fontWeight: 500,
                color: "#6a605e",
                marginTop: 10,
              }}
            >
              Enviamos um link de recuperação para{" "}
              <strong style={{ fontWeight: 800, color: "#16100f" }}>{email}</strong>. O link expira em 30 minutos.
            </p>

            <button
              type="button"
              onClick={() => {
                // reenvio de e-mail de recuperação (backend endpoint pendente)
              }}
              style={{
                width: "100%",
                marginTop: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 800,
                color: "#fff",
                background: "#CC1F1F",
                border: "none",
                borderRadius: 11,
                padding: 14,
                cursor: "pointer",
                boxShadow: "0 10px 24px rgba(204,31,31,0.28)",
              }}
              className="hover:opacity-90 transition-opacity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v6h6" />
                <path d="M3 8a9 9 0 1 0 2.6-5.6L3 8" />
              </svg>
              Reenviar link
            </button>

            <p style={{ fontSize: 13, fontWeight: 500, color: "#a89e9c", marginTop: 14 }}>
              Não recebeu? Verifique a caixa de spam.
            </p>

            <BackLink />
          </div>
        )}
      </div>
    </div>
  );
}
