import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ScrollToTop from './ScrollToTop'

/**
 * App shell.
 *
 * Navbar/footer are hidden on the full-screen success celebration so that
 * page feels like a proper reward moment.
 */
const RootLayout = ({ children }) => {
  const { pathname } = useLocation()
  const bare = pathname === '/order-success'

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <ScrollToTop />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-pink-300 focus:px-5 focus:py-3 focus:font-display focus:font-bold"
      >
        Skip to content
      </a>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease: [0.22, 0.68, 0.36, 1] }}
          className="flex min-h-screen flex-1 flex-col"
        >
          {!bare && <Navbar />}

          <main id="main" className="flex-1">
            {children}
          </main>

          {!bare && <Footer />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default RootLayout
