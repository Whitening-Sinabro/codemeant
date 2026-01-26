import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 크레딧 조회
  const { data: credits } = await supabase
    .from("credits")
    .select("balance")
    .eq("user_id", user.id)
    .single();

  // 최근 분석 조회
  const { data: analyses } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1>CodeMeant</h1>
        <div>
          <span style={{ marginRight: "1rem" }}>{user.email}</span>
          <form action="/api/auth/signout" method="POST" style={{ display: "inline" }}>
            <button type="submit">로그아웃</button>
          </form>
        </div>
      </header>

      <section style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>크레딧</h2>
        <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
          {credits?.balance ?? 0} 크레딧
        </p>
        <p style={{ color: "#666" }}>분석 1회 = 5 크레딧</p>
        <Link
          href="/credits"
          style={{
            display: "inline-block",
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          크레딧 충전
        </Link>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>CLI 사용법</h2>
        <div style={{ backgroundColor: "#f5f5f5", padding: "1rem", borderRadius: "4px" }}>
          <code>
            npm install -g codemeant<br />
            codemeant login<br />
            codemeant analyze ./my-project
          </code>
        </div>
      </section>

      <section>
        <h2>최근 분석</h2>
        {analyses && analyses.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {analyses.map((analysis: any) => (
              <li
                key={analysis.id}
                style={{
                  padding: "1rem",
                  border: "1px solid #eee",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong>{analysis.project_name}</strong>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      backgroundColor:
                        analysis.status === "completed" ? "#d4edda" :
                        analysis.status === "failed" ? "#f8d7da" : "#fff3cd",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {analysis.status}
                  </span>
                </div>
                <div style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
                </div>
                {analysis.status === "completed" && (
                  <Link href={`/analysis/${analysis.id}`} style={{ color: "#0070f3" }}>
                    결과 보기
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666" }}>아직 분석 내역이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
