import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button'
import Logo from '../components/brand/Logo'
import Mascot from '../components/brand/Mascot'
import FloatingDecorations from '../components/decor/FloatingDecorations'

const NotFound = () => (
  <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-blob-pink py-16">
    <FloatingDecorations density="sparse" />

    <div className="container-sistara relative text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Mascot size={180} className="mx-auto" />

        <p className="mt-4 font-display text-6xl font-extrabold text-pink-300 sm:text-7xl">
          404
        </p>
        <h1 className="mt-2 text-balance text-2xl sm:text-3xl">
          This page wandered off <span aria-hidden="true">🌸</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-pretty font-body text-base text-ink-soft">
          Zero Fault means zero broken links too. Let’s get you back to somewhere useful.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button to="/" size="lg" icon={Home}>
            Back to Home
          </Button>
          <Button to="/services" size="lg" variant="secondary" icon={Sparkles}>
            Browse Services
          </Button>
        </div>

        <div className="mt-9 flex justify-center">
          <Link to="/" aria-label="SISTARA home">
            <Logo size="sm" className="justify-center" />
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
)

export default NotFound
