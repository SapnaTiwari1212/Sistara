import { Link } from 'react-router-dom'
import Logo from './Logo'
import { siteConfig } from '../../config/siteConfig'
import { cn } from '../../lib/utils'

/**
 * Page-header brand lockup.
 *
 * Renders the exact same `Logo` component the navbar and footer use, centred
 * above a page heading. Having one component means every screen is guaranteed
 * to carry the identical SISTARA mark, and swapping in a real logo file
 * through `siteConfig.brandAssets.logo.src` updates all of them at once.
 *
 * `to` lets a screen send the mark somewhere other than home if it ever needs
 * to; the default keeps it clickable back to the home page.
 */
const BrandLockup = ({ size = 'md', to = '/', className = '', ...rest }) => (
  <div className={cn('flex justify-center', className)} {...rest}>
    <Link to={to} aria-label={`${siteConfig.brand.name} — home`}>
      <Logo size={size} />
    </Link>
  </div>
)

export default BrandLockup
