import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

/*
 * Opt in to the React Router v7 behaviours now, so upgrading to v7 later is a
 * version bump rather than a migration:
 *
 *   v7_startTransition     wrap router state updates in React.startTransition,
 *                          keeping navigation interruptible during typing.
 *   v7_relativeSplatPath   resolve relative routes inside splat routes the v7
 *                          way, instead of the v6 behaviour.
 *
 * Without these, React Router logs a Future Flag Warning on every page load.
 */
const future = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={future}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
