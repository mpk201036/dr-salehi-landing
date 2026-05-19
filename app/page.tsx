import Navbar from '@/components/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import TrustSnapshot from '@/components/sections/TrustSnapshot'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
import EquipmentSection from '@/components/sections/EquipmentSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import InsuranceSection from '@/components/sections/InsuranceSection'
import BookingSection from '@/components/sections/BookingSection'
import FAQSection from '@/components/sections/FAQSection'
import LocationSection from '@/components/sections/LocationSection'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="relative">
      {/* Main content sits above the fixed footer during scroll */}
      <main className="relative z-10 bg-navy rounded-b-3xl shadow-2xl shadow-black/50">
        <Navbar />
        <HeroSection />
        <TrustSnapshot />
        <AboutSection />
        <ServicesSection />
        <EquipmentSection />
        <TestimonialsSection />
        <InsuranceSection />
        <BookingSection />
        <FAQSection />
        <LocationSection />
        <FinalCTA />
      </main>
      {/* Cinematic footer revealed as main scrolls away */}
      <Footer />
    </div>
  )
}
