import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '뉴스 챗봇',
  description: '키워드로 뉴스를 검색하고 요약하며 대화할 수 있는 챗봇',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
