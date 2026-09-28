import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import orderService from '../services/orderService'
import { getServiceById, DEFAULT_SERVICE_ID } from '../config/services'
import { calculateQuote } from '../lib/pricing'
import { useAuth } from './AuthContext'

const OrderContext = createContext(null)

/** The in-progress order the student is filling in. */
const emptyDraft = () => ({
  serviceId: DEFAULT_SERVICE_ID,
  quantity: null,
  deadline: '3d',
  instructions: '',
  notes: '',
  requirements: [],
  references: [],
})

export const OrderProvider = ({ children }) => {
  const { user } = useAuth()
  const [draft, setDraft] = useState(emptyDraft)
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState(null)

  /* Load this student's orders, seeding demo data on first run. */
  const refreshOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([])
      return
    }
    setLoadingOrders(true)
    try {
      if (orderService.isDemo) await orderService.seedIfEmpty(user.id)
      setOrders(await orderService.listByUser(user.id))
    } catch {
      setOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }, [user?.id])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  /* Keep the draft's quantity valid for whichever service is selected. */
  useEffect(() => {
    setDraft((d) => {
      const service = getServiceById(d.serviceId)
      if (!service) return d
      const qty = d.quantity ?? service.defaultQuantity
      const clamped = Math.min(Math.max(qty, service.minQuantity), service.maxQuantity)
      if (qty === clamped && d.quantity !== null) return d
      return { ...d, quantity: clamped }
    })
  }, [draft.serviceId])

  const updateDraft = useCallback((patch) => {
    setDraft((d) => ({ ...d, ...patch }))
  }, [])

  const resetDraft = useCallback(() => setDraft(emptyDraft()), [])

  /* ---------------------------------------------------------------------- */
  /* Pricing                                                                */
  /* ---------------------------------------------------------------------- */

  const service = getServiceById(draft.serviceId)

  const pricing = useMemo(
    () =>
      calculateQuote({
        service: getServiceById(draft.serviceId),
        quantity: draft.quantity,
        deadline: draft.deadline,
      }),
    [draft.serviceId, draft.quantity, draft.deadline],
  )

  /* ---------------------------------------------------------------------- */
  /* Order lifecycle                                                        */
  /* ---------------------------------------------------------------------- */

  /** Creates the order, then routes the student to payment. */
  const placeOrder = useCallback(async () => {
    if (!user?.id) throw new Error('Please log in to place an order.')
    const delivery = new Date()
    const days = { '24h': 1, '3d': 3, '5d': 5, '7d': 7 }[draft.deadline] ?? 3
    delivery.setDate(delivery.getDate() + days)

    const order = await orderService.create({
      userId: user.id,
      serviceId: draft.serviceId,
      quantity: draft.quantity ?? service?.defaultQuantity ?? 1,
      requirements: draft.requirements,
      references: draft.references,
      instructions: draft.instructions,
      deadline: draft.deadline,
      notes: draft.notes,
      amount: pricing.total,
      // Snapshot the quote so the payment screen can show the same line items
      // the student saw, instead of recomputing them from today's config.
      price: {
        base: pricing.base,
        extras: pricing.extras,
        rush: pricing.rush,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        tax: pricing.tax,
        total: pricing.total,
      },
      deliveryDate: delivery.toISOString(),
    })

    setActiveOrderId(order.id)
    setOrders((prev) => [order, ...prev])
    return order
  }, [user?.id, draft, pricing, service])

  const getOrder = useCallback(
    (id) => orders.find((o) => o.id === id) || null,
    [orders],
  )

  const value = useMemo(
    () => ({
      draft,
      updateDraft,
      resetDraft,
      service,
      pricing,
      orders,
      loadingOrders,
      refreshOrders,
      placeOrder,
      getOrder,
      activeOrderId,
      setActiveOrderId,
    }),
    [
      draft,
      updateDraft,
      resetDraft,
      service,
      pricing,
      orders,
      loadingOrders,
      refreshOrders,
      placeOrder,
      getOrder,
      activeOrderId,
    ],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export const useOrders = () => {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used inside <OrderProvider>')
  return ctx
}
