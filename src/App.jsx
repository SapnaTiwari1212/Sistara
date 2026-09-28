import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from './components/layout/RootLayout'
import ProtectedRoute, { PublicOnlyRoute } from './components/layout/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { OrderProvider } from './context/OrderContext'

import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Order from './pages/Order'
import NotFound from './pages/NotFound'

/* The heavier authenticated screens load on demand. */
const Dashboard = lazy(() => import('./pages/Dashboard'))
const MyOrders = lazy(() => import('./pages/MyOrders'))
const Payment = lazy(() => import('./pages/Payment'))
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const Contact = lazy(() => import('./pages/Contact'))
const Profile = lazy(() => import('./pages/Profile'))

const RouteFallback = () => (
  <div className="grid min-h-[60vh] place-items-center">
    <div className="flex flex-col items-center gap-3">
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-lavender-200 border-t-pink-400" />
      <p className="font-display text-sm font-bold text-ink-muted">Loading…</p>
    </div>
  </div>
)

const App = () => (
  <AuthProvider>
    <OrderProvider>
      <RootLayout>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            {/* public */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:serviceId" element={<ServiceDetail />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/order" element={<Order />} />

            {/* auth */}
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute>
                  <Signup />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicOnlyRoute>
                  <ForgotPassword />
                </PublicOnlyRoute>
              }
            />

            {/* protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            {/* Older links and bookmarks still point at /my-orders — keep them
                working by bouncing to the canonical /orders path. */}
            <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <ProtectedRoute>
                  <OrderSuccess />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </RootLayout>
    </OrderProvider>
  </AuthProvider>
)

export default App
