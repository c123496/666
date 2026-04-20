import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '虚拟男友 - 你的AI伴侣',
  description: '体验最温暖的陪伴，最贴心的关怀',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
