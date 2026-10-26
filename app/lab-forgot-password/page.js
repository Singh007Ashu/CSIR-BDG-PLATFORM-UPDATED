"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LabForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState("request"); // "request" | "reset"
  const [email, setEmail] = useState("");
  const [devToken, setDevToken] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleRequest(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch("/api/lab-auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ officialEmail: email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Something went wrong."); return; }
    setMessage(data.message);
    if (data.devResetToken) { setDevToken(data.devResetToken); setToken(data.devResetToken); }
    setStep("reset");
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch("/api/lab-auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Reset failed."); return; }
    router.push("/lab-login");
  }

  return (
    <div className="container" style={{ maxWidth: 460 }}>
      <h2 className="section-title">Reset Lab Password</h2>
      <div className="card">
        {step === "request" ? (
          <form onSubmit={handleRequest}>
            <label>Official Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}
            <button className="btn" disabled={saving} type="submit">{saving ? "Sending..." : "Send Reset Link"}</button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <p className="meta">{message}</p>
            {devToken && (
              <p className="meta" style={{ color: "var(--csir-gold)" }}>
                Email service isn't configured yet — dev mode: your reset token has been pre-filled below.
              </p>
            )}
            <label>Reset Token</label>
            <input required value={token} onChange={(e) => setToken(e.target.value)} />
            <label>New Password</label>
            <input type="password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}
            <button className="btn" disabled={saving} type="submit">{saving ? "Resetting..." : "Reset Password"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
