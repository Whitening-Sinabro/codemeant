import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodeMeant - 프로젝트 가치 분석",
  description: "바이브코더를 위한 프로젝트 가치 분석 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
