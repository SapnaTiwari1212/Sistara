import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, LogOut, LayoutDashboard, Sparkles } from 'lucide-react'
import Logo from '../brand/Logo'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/utils'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/orders', label: 'My Orders' },
]

const Navbar = () => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isAuthenticated, user, signOut } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  /* Solidify the bar once the page scrolls. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Close the mobile sheet on navigation. */
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  /* Lock body scroll while the sheet is open. */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSignOut = async () => {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  const linkClass = ({ isActive }) =>
    cn(
      'relative rounded-full px-4 py-2 font-display text-[15px] font-bold transition-colors duration-200',
      isActive ? 'text-pink-600' : 'text-ink-soft hover:text-pink-600',
    )

  return (
    <>
      {/* Sticky, but visually soft — no heavy bar. */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-pink-100 bg-cream/85 shadow-soft backdrop-blur-lg'
            : 'bg-transparent',
        )}
      >
        <nav className="container-sistara">
          <div
            className={cn(
              'flex items-center justify-between gap-3 transition-all duration-300',
              scrolled ? 'h-[68px]' : 'h-[76px] sm:h-[84px]',
            )}
          >
            <Link to="/" className="shrink-0" aria-label="SISTARA home">
              <Logo size="sm" />
            </Link>

            {/* Desktop links */}
            <div className="hidden items-center gap-1 lg:flex">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      {l.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-pink-100"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Desktop actions */}
            <div className="hidden items-center gap-2.5 lg:flex">
              {isAuthenticated ? (
                <>
                  <Button to="/dashboard" variant="ghost" size="sm" icon={LayoutDashboard}>
                    Hi, {user?.name?.split(' ')[0]}
                  </Button>
                  <Button to="/order" size="sm" icon={Sparkles}>
                    Order Now
                  </Button>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="grid h-10 w-10 place-items-center rounded-full text-ink-muted transition-colors hover:bg-pink-50 hover:text-pink-600"
                    aria-label="Log out"
                    title="Log out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Button to="/login" variant="ghost" size="sm">
                    Login
                  </Button>
                  <Button to="/order" size="sm" icon={Sparkles}>
                    Order Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile trigger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-lavender-200 bg-white text-ink shadow-soft transition-transform active:scale-95 lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/25 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-50 mx-3 mt-3 rounded-4xl border-2 border-pink-100 bg-cream p-5 shadow-card lg:hidden"
              initial={{ opacity: 0, y: -18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.22, 0.68, 0.36, 1] }}
            >
              <div className="mb-4 flex items-center justify-between">
                <Logo size="sm" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full text-ink-muted hover:bg-pink-50"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      cn(
                        'rounded-2xl px-4 py-3.5 font-display text-lg font-bold transition-colors',
                        isActive
                          ? 'bg-pink-100 text-pink-600'
                          : 'text-ink-soft hover:bg-white',
                      )
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2.5 border-t-2 border-dashed border-pink-100 pt-4">
                {isAuthenticated ? (
                  <>
                    <Button to="/dashboard" variant="secondary" fullWidth icon={LayoutDashboard}>
                      My Dashboard
                    </Button>
                    <Button to="/order" fullWidth icon={Sparkles}>
                      Order Now
                    </Button>
                    <Button variant="ghost" fullWidth icon={LogOut} onClick={handleSignOut}>
                      Log Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button to="/order" fullWidth icon={Sparkles}>
                      Order Now
                    </Button>
                    <Button to="/login" variant="secondary" fullWidth>
                      Login
                    </Button>
                    <Button to="/signup" variant="ghost" fullWidth>
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar
