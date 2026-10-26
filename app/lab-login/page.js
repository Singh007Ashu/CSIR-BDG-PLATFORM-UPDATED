"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LabLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/lab-dashboard";

  const [form, setForm] = useState({ labId: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setSaving(true);
    const res = await fetch("/api/lab-auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Login failed."); return; }
    router.push(nextPath);
    router.refresh();
  }

  return (
    <div className="container hq-lab-panel" style={{ maxWidth: 460 }}>
      <h2 className="section-title">CSIR Laboratory Login</h2>
      <p className="section-sub">
        Internal portal for CSIR laboratories. Use the Lab ID issued at registration.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <label>Lab ID</label>
          <input
            required
            placeholder="e.g. CSIR-CSIO-0001"
            value={form.labId}
            onChange={(e) => setForm({ ...form, labId: e.target.value })}
          />
          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p style={{ color: "#c0392b", fontSize: 13 }}>{error}</p>}
          <button className="btn" disabled={saving} type="submit">{saving ? "Signing in..." : "Login"}</button>
          <p style={{ fontSize: 13, marginTop: 12 }}>
            New laboratory?{" "}
            <a href="/register-lab" style={{ color: "var(--csir-blue)", fontWeight: 600 }}>
              Register your lab
            </a>
          </p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Forgot password?{" "}
            <a href="/lab-forgot-password" style={{ color: "var(--csir-blue)", fontWeight: 600 }}>
              Reset it here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
