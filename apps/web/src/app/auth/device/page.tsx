"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function DeviceAuthContent() {
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code");

  const [userCode, setUserCode] = useState(codeFromUrl || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  useEffect(() => {
    if (codeFromUrl) {
      setUserCode(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = `/login?redirect=/auth/device?code=${userCode}`;
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/auth/device/authorize?user_code=${userCode}&user_id=${user.id}`,
        { method: "POST" }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "인증 실패");
      }

      setMessage({ type: "success", text: "인증 완료! CLI로 돌아가세요." });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "오류가 발생했습니다.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (isLoggedIn === null) {
    return (
      <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem", textAlign: "center" }}>
        로딩 중...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem" }}>
      <h1>CLI 디바이스 인증</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        CLI에서 표시된 코드를 입력하여 인증하세요.
      </p>

      {!isLoggedIn && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fff3cd",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          먼저 로그인이 필요합니다.{" "}
          <a href={`/login?redirect=/auth/device?code=${userCode}`} style={{ color: "#0070f3" }}>
            로그인하기
          </a>
        </div>
      )}

      <form onSubmit={handleAuthorize}>
        <div style={{ marginBottom: "1rem" }}>
          <label>인증 코드</label>
          <input
            type="text"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            placeholder="XXXXXX"
            maxLength={6}
            required
            style={{
              width: "100%",
              padding: "1rem",
              marginTop: "0.5rem",
              fontSize: "1.5rem",
              textAlign: "center",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
            }}
          />
        </div>

        {message && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: message.type === "success" ? "#d4edda" : "#f8d7da",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isLoggedIn || userCode.length < 6}
          style={{
            width: "100%",
            padding: "1rem",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !isLoggedIn ? "not-allowed" : "pointer",
            opacity: loading || !isLoggedIn ? 0.7 : 1,
          }}
        >
          {loading ? "인증 중..." : "인증하기"}
        </button>
      </form>
    </div>
  );
}

export default function DeviceAuthPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 400, margin: "100px auto", padding: "2rem", textAlign: "center" }}>로딩 중...</div>}>
      <DeviceAuthContent />
    </Suspense>
  );
}
