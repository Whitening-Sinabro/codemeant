"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("확인 이메일을 보냈습니다. 이메일을 확인해주세요.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "오류가 발생했습니다.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem" }}>
      <h1>{isSignUp ? "회원가입" : "로그인"}</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>

        {message && (
          <div style={{ marginBottom: "1rem", color: isSignUp ? "green" : "red" }}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "처리 중..." : isSignUp ? "회원가입" : "로그인"}
        </button>
      </form>

      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        {isSignUp ? "이미 계정이 있나요?" : "계정이 없나요?"}{" "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          style={{
            background: "none",
            border: "none",
            color: "#0070f3",
            cursor: "pointer",
          }}
        >
          {isSignUp ? "로그인" : "회원가입"}
        </button>
      </p>
    </div>
  );
}
