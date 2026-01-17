import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AppShowcase } from '@/components/landing/AppShowcase';
import { WaitlistForm } from '@/components/forms/WaitlistForm';

import { MadeInIndiaBanner } from '@/components/landing/MadeInIndiaBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Hero />
      <MadeInIndiaBanner />
      <div className="flex justify-center py-8 bg-muted/20">
        <WaitlistForm />
      </div>
      <AppShowcase />
      <Features />

      {/* Download CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Experience ThodiBaat?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg mb-8">
            Join millions of users who trust ThodiBaat for secure, seamless communication.
            Available on iOS and Android.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-black text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-all font-bold">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.525 10.32c0-2.342 1.918-4.17 1.954-4.204-.023-.082-1.206-4.14-4.782-4.25-2.022-.062-3.953 1.196-4.99 1.196-1.042 0-2.633-1.157-4.322-1.127-2.227.034-4.27 1.293-5.418 3.284-2.31 4.01-.588 9.92 1.673 13.193 1.11 1.606 2.43 3.398 4.176 3.336 1.666-.07 2.302-1.077 4.32-1.077 2.01 0 2.585 1.077 4.35 1.043 1.796-.034 2.936-1.637 4.03-3.23 1.267-1.838 1.786-3.62 1.8-3.682-.04-.02-3.468-1.332-3.468-5.32zM12.984 2.825c.915-1.11 1.533-2.652 1.365-4.192-1.32.054-2.915.88-3.86 2.002-.85.987-1.587 2.572-1.387 4.08 1.472.115 2.97-.738 3.883-1.89z" /></svg>
              App Store
            </button>
            <button className="bg-black text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-black/80 transition-all font-bold">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L3.84,2.15C3.84,2.15 6.05,2.66 6.05,2.66Z" /></svg>
              Play Store
            </button>
          </div>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </section>

      <Footer />
    </main>
  );
}
