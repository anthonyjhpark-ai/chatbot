import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NBA 선수 스탯 대시보드',
  description: 'NBA 선수들의 일일 스탯을 기반으로 한 종합 점수 랭킹 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
