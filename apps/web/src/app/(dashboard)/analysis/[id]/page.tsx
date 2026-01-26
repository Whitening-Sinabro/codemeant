import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!analysis) {
    notFound();
  }

  const priceEstimation = analysis.price_estimation;
  const salesStrategy = analysis.sales_strategy;

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <Link href="/dashboard" style={{ color: "#666" }}>
        &larr; 대시보드로 돌아가기
      </Link>

      <h1 style={{ marginTop: "1rem" }}>{analysis.project_name}</h1>

      <div
        style={{
          display: "inline-block",
          padding: "0.25rem 0.75rem",
          backgroundColor:
            analysis.status === "completed" ? "#d4edda" :
            analysis.status === "failed" ? "#f8d7da" : "#fff3cd",
          borderRadius: "4px",
          marginBottom: "2rem",
        }}
      >
        {analysis.status === "completed" && "분석 완료"}
        {analysis.status === "failed" && "분석 실패"}
        {analysis.status === "pending" && "분석 대기 중"}
        {analysis.status === "processing" && "분석 중..."}
      </div>

      {analysis.status === "completed" && priceEstimation && (
        <>
          <section style={{ marginBottom: "2rem" }}>
            <h2>가격 추정</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ color: "#666" }}>최소</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  ${priceEstimation.minimum}
                </div>
              </div>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #0070f3",
                  borderRadius: "8px",
                  textAlign: "center",
                  backgroundColor: "#f0f7ff",
                }}
              >
                <div style={{ color: "#0070f3" }}>추천</div>
                <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#0070f3" }}>
                  ${priceEstimation.recommended}
                </div>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px", textAlign: "center" }}>
                <div style={{ color: "#666" }}>최대</div>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  ${priceEstimation.maximum}
                </div>
              </div>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
              <strong>가격 책정 근거</strong>
              <p style={{ marginTop: "0.5rem" }}>{priceEstimation.reasoning}</p>
            </div>

            {priceEstimation.comparable_projects?.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <strong>유사 프로젝트</strong>
                <ul>
                  {priceEstimation.comparable_projects.map((proj: any, i: number) => (
                    <li key={i}>
                      {proj.name} - ${proj.price} ({proj.platform}) - {proj.similarity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {salesStrategy && (
            <section style={{ marginBottom: "2rem" }}>
              <h2>판매 전략</h2>

              <div style={{ marginBottom: "1rem" }}>
                <strong>추천 플랫폼</strong>
                <div style={{ display: "grid", gap: "1rem", marginTop: "0.5rem" }}>
                  {salesStrategy.recommended_platforms?.map((platform: any, i: number) => (
                    <div
                      key={i}
                      style={{ padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}
                    >
                      <div style={{ fontWeight: "bold" }}>{platform.name}</div>
                      {platform.url && (
                        <a href={platform.url} target="_blank" rel="noopener" style={{ color: "#0070f3" }}>
                          {platform.url}
                        </a>
                      )}
                      <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
                        <div>
                          <span style={{ color: "green" }}>장점: </span>
                          {platform.pros?.join(", ")}
                        </div>
                        <div>
                          <span style={{ color: "red" }}>단점: </span>
                          {platform.cons?.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>타겟 고객</strong>
                <p>{salesStrategy.target_customers?.join(", ")}</p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <strong>포지셔닝</strong>
                <p>{salesStrategy.positioning}</p>
              </div>

              <div>
                <strong>핵심 셀링 포인트</strong>
                <ul>
                  {salesStrategy.key_selling_points?.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      {analysis.status === "failed" && (
        <div style={{ padding: "1rem", backgroundColor: "#f8d7da", borderRadius: "8px" }}>
          <strong>분석 실패</strong>
          <p>{analysis.error_message || "알 수 없는 오류가 발생했습니다."}</p>
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>프로젝트 정보</h2>

        {analysis.tech_stack && (
          <div style={{ marginBottom: "1rem" }}>
            <strong>기술 스택</strong>
            <p>
              언어: {analysis.tech_stack.languages?.join(", ") || "없음"}<br />
              프레임워크: {analysis.tech_stack.frameworks?.join(", ") || "없음"}<br />
              데이터베이스: {analysis.tech_stack.databases?.join(", ") || "없음"}
            </p>
          </div>
        )}

        <div style={{ color: "#666", fontSize: "0.9rem" }}>
          분석일: {new Date(analysis.created_at).toLocaleString("ko-KR")}<br />
          사용 크레딧: {analysis.credits_used}
        </div>
      </section>
    </div>
  );
}
