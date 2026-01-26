import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const CREDIT_PACKS = [
  { id: "starter", name: "Starter", credits: 50, price: 4.99, analyses: 10 },
  { id: "basic", name: "Basic", credits: 150, price: 9.99, analyses: 30, popular: true },
  { id: "pro", name: "Pro", credits: 500, price: 24.99, analyses: 100 },
];

export default async function CreditsPage() {
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

  // 거래 내역 조회
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <Link href="/dashboard" style={{ color: "#666" }}>
        &larr; 대시보드로 돌아가기
      </Link>

      <h1 style={{ marginTop: "1rem" }}>크레딧</h1>

      <section style={{ marginBottom: "2rem", padding: "1.5rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>현재 잔액</h2>
        <p style={{ fontSize: "2.5rem", fontWeight: "bold" }}>
          {credits?.balance ?? 0} <span style={{ fontSize: "1rem", color: "#666" }}>크레딧</span>
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>크레딧 구매</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.id}
              style={{
                padding: "1.5rem",
                border: pack.popular ? "2px solid #0070f3" : "1px solid #ddd",
                borderRadius: "8px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {pack.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    backgroundColor: "#0070f3",
                    color: "white",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                  }}
                >
                  인기
                </span>
              )}
              <h3>{pack.name}</h3>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {pack.credits} 크레딧
              </p>
              <p style={{ color: "#666" }}>~{pack.analyses}회 분석</p>
              <p style={{ fontSize: "1.25rem", marginTop: "1rem" }}>
                ${pack.price}
              </p>
              <button
                style={{
                  marginTop: "1rem",
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                구매하기
              </button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.9rem" }}>
          * Polar를 통한 안전한 결제
        </p>
      </section>

      <section>
        <h2>거래 내역</h2>
        {transactions && transactions.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>날짜</th>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>유형</th>
                <th style={{ textAlign: "right", padding: "0.75rem" }}>변동</th>
                <th style={{ textAlign: "right", padding: "0.75rem" }}>잔액</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>
                    {new Date(tx.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    {tx.type === "purchase" && "충전"}
                    {tx.type === "analysis" && "분석"}
                    {tx.type === "bonus" && "보너스"}
                    {tx.type === "refund" && "환불"}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      color: tx.amount > 0 ? "green" : "red",
                    }}
                  >
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    {tx.balance_after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#666" }}>거래 내역이 없습니다.</p>
        )}
      </section>
    </div>
  );
}
