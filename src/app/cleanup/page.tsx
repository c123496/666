'use client';

import { Navbar } from '@/components/cleanup/navbar';
import { HeroSection } from '@/components/cleanup/hero-section';
import { Footer } from '@/components/cleanup/footer';

export default function CleanupPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
}
