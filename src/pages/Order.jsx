import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import OrderForm from '../components/order/OrderForm'
import FloatingDecorations from '../components/decor/FloatingDecorations'
import { useOrders } from '../context/OrderContext'
import { getServiceById } from '../config/services'
import { useAuth } from '../context/AuthContext'

const Order = () => {
  const [params] = useSearchParams()
  const { updateDraft } = useOrders()
  const { isAuthenticated } = useAuth()

  /* Support /order?service=creative-ppt deep links from service cards. */
  useEffect(() => {
    const requested = params.get('service')
    if (requested && getServiceById(requested)) {
      updateDraft({ serviceId: requested })
    }
  }, [params, updateDraft])

  return (
    <section className="relative overflow-hidden bg-blob-pink py-10 sm:py-14">
      <FloatingDecorations density="sparse" />

      <div className="container-sistara relative">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="pill border-2 border-dashed border-pink-200 bg-white/80 text-pink-600">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {isAuthenticated ? 'Almost there' : 'Order in 1 minute'}
          </span>
          <h1 className="mt-4 text-balance text-3xl sm:text-4xl lg:text-[2.75rem]">
            Place your order
          </h1>
          <p className="mt-3 text-pretty font-body text-base leading-relaxed text-ink-soft sm:text-lg">
            {isAuthenticated
              ? 'Fill in the details, upload your files, and check your price on the right.'
              : 'Tell us what you need. We’ll ask you to log in before payment — it takes 10 seconds.'}
          </p>
        </motion.header>

        <div className="mt-8 sm:mt-10">
          <OrderForm />
        </div>

        <p className="mt-8 text-center font-body text-sm font-semibold text-ink-muted">
          Want to compare options first?{' '}
          <Link
            to="/services"
            className="font-bold text-pink-600 underline decoration-pink-200 decoration-2 underline-offset-4"
          >
            Browse all services
          </Link>
        </p>
      </div>
    </section>
  )
}

export default Order
