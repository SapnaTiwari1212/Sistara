import Hero from '../components/home/Hero'
import ServicesSection from '../components/home/ServicesSection'
import HowItWorks from '../components/home/HowItWorks'
import WhySistara from '../components/home/WhySistara'
import InstagramSection from '../components/home/InstagramSection'
import { AboutSection, ContactSection } from '../components/home/ContactSection'

const Home = () => (
  <>
    <Hero />
    <ServicesSection limit={6} />
    <HowItWorks />
    <WhySistara />
    <InstagramSection />

    <section className="py-4">
      <div className="container-sistara">
        <AboutSection />
      </div>
    </section>

    <ContactSection />
  </>
)

export default Home
