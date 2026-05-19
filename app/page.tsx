import Navbar from '@/components/Navbar'
import HeroSection from '@/components/sections/HeroSection'
import TrustSnapshot from '@/components/sections/TrustSnapshot'
import AboutSection from '@/components/sections/AboutSection'
import ServicesSection from '@/components/sections/ServicesSection'
import EquipmentSection from '@/components/sections/EquipmentSection'
import TestimonialsSection from '@/components/sections/TestimonialsSection'
import InsuranceSection from '@/components/sections/InsuranceSection'
import FAQSection from '@/components/sections/FAQSection'
import LocationSection from '@/components/sections/LocationSection'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <TrustSnapshot />
      <AboutSection />
      <ServicesSection />
      <EquipmentSection />
      <TestimonialsSection />
      <InsuranceSection />
      <FAQSection />
      <LocationSection />
      <FinalCTA />
      <Footer />
    </main>
  )
}
