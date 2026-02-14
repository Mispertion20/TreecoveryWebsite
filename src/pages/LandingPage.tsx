import { lazy, Suspense } from 'react'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'
import LiveStatisticsTicker from '../components/LiveStatisticsTicker'

// Lazy load below-the-fold components for better LCP
const MapPreview = lazy(() => import('../components/MapPreview'))
const FeaturesGrid = lazy(() => import('../components/FeaturesGrid'))
const HowItWorks = lazy(() => import('../components/HowItWorks'))
const ImpactStats = lazy(() => import('../components/ImpactStats'))
const Testimonials = lazy(() => import('../components/Testimonials'))
const NewsletterSignup = lazy(() => import('../components/NewsletterSignup'))
const AdminSection = lazy(() => import('../components/AdminSection'))
const FinalCTA = lazy(() => import('../components/FinalCTA'))
const Footer = lazy(() => import('../components/Footer'))
const UserTutorial = lazy(() => import('../components/onboarding/UserTutorial'))

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <LiveStatisticsTicker />
      <HeroSection />
      <Suspense fallback={<div className="h-20" />}>
        <MapPreview />
        <FeaturesGrid />
        <HowItWorks />
        <ImpactStats />
        <Testimonials />
        <NewsletterSignup />
        <AdminSection />
        <FinalCTA />
        <Footer />
        <UserTutorial />
      </Suspense>
    </main>
  )
}

