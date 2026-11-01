import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaPhone,
  FaArrowUp,
} from 'react-icons/fa6'
import { useContent } from '../context/ContentContext'

export interface ContactWidgetItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  ariaLabel: string
  bgClass: string
  glowColor: string
  isExternal?: boolean
}

export default function FloatingContactWidget() {
  const { settings } = useContent()
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Track window scroll position to toggle the Scroll-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll handler
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  // Configuration with fallback values
  const rawPhone = settings?.phone || '+91 9977413362'
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '')
  const rawWhatsApp = settings?.whatsapp || settings?.phone || '+91 9977413362'
  const cleanWhatsApp = rawWhatsApp.replace(/[^\d]/g, '')

  const instagramUrl =
    settings?.socials?.find((s) => s.label.toLowerCase().includes('instagram'))
      ?.url || 'https://www.instagram.com/tavqen.tech/'

  const linkedInUrl =
    settings?.socials?.find((s) => s.label.toLowerCase().includes('linkedin'))
      ?.url || 'https://www.linkedin.com/company/tavqen-technologies/'

  const items: ContactWidgetItem[] = [
    {
      id: 'instagram',
      label: 'Instagram',
      ariaLabel: 'Visit TAVQEN Technologies on Instagram',
      href: instagramUrl,
      icon: <FaInstagram size={20} />,
      bgClass: 'floating-btn-instagram',
      glowColor: 'rgba(225, 48, 108, 0.45)',
      isExternal: true,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp Chat',
      ariaLabel: 'Chat with TAVQEN Technologies on WhatsApp',
      href: `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
        'Hello TAVQEN Technologies, I would like to inquire about your software and engineering services.'
      )}`,
      icon: <FaWhatsapp size={20} />,
      bgClass: 'floating-btn-whatsapp',
      glowColor: 'rgba(37, 211, 102, 0.45)',
      isExternal: true,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      ariaLabel: 'Visit TAVQEN Technologies on LinkedIn',
      href: linkedInUrl,
      icon: <FaLinkedinIn size={18} />,
      bgClass: 'floating-btn-linkedin',
      glowColor: 'rgba(10, 102, 194, 0.45)',
      isExternal: true,
    },
    {
      id: 'phone',
      label: 'Call Direct',
      ariaLabel: `Call TAVQEN Technologies at ${rawPhone}`,
      href: `tel:${cleanPhone}`,
      icon: <FaPhone size={17} />,
      bgClass: 'floating-btn-phone',
      glowColor: 'rgba(7, 91, 255, 0.5)',
      isExternal: false,
    },
  ]

  // Container motion variants
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.7, x: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 350,
        damping: 22,
      },
    },
  }

  return (
    <div
      className="floating-widget-wrapper"
      role="region"
      aria-label="Quick contact and navigation shortcuts"
    >
      <motion.div
        className="floating-widget-stack"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Social Media & Direct Action Icons */}
        {items.map((item) => (
          <div
            key={item.id}
            className="floating-item-anchor-wrap"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Tooltip Label */}
            <AnimatePresence>
              {hoveredId === item.id && (
                <motion.div
                  className="floating-widget-tooltip"
                  initial={{ opacity: 0, x: 8, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 6, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  role="tooltip"
                >
                  <span>{item.label}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Action Button */}
            <motion.a
              href={item.href}
              target={item.isExternal ? '_blank' : undefined}
              rel={item.isExternal ? 'noopener noreferrer' : undefined}
              className={`floating-btn ${item.bgClass}`}
              aria-label={item.ariaLabel}
              variants={itemVariants}
              whileHover={{
                scale: 1.12,
                y: -2,
                boxShadow: `0 8px 24px ${item.glowColor}`,
                transition: { type: 'spring', stiffness: 400, damping: 15 },
              }}
              whileTap={{ scale: 0.92 }}
              onFocus={() => setHoveredId(item.id)}
              onBlur={() => setHoveredId(null)}
            >
              {item.icon}
            </motion.a>
          </div>
        ))}

        {/* Scroll-to-Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.div
              className="floating-item-anchor-wrap scroll-top-wrap"
              initial={{ opacity: 0, scale: 0.6, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 16 }}
              transition={{ type: 'spring', stiffness: 360, damping: 20 }}
              onMouseEnter={() => setHoveredId('scroll-top')}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Subtle glowing divider */}
              <div className="floating-divider" aria-hidden="true" />

              {/* Tooltip Label */}
              <AnimatePresence>
                {hoveredId === 'scroll-top' && (
                  <motion.div
                    className="floating-widget-tooltip"
                    initial={{ opacity: 0, x: 8, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 6, scale: 0.95 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    role="tooltip"
                  >
                    <span>Scroll to Top</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Scroll Button */}
              <motion.button
                type="button"
                onClick={handleScrollToTop}
                className="floating-btn floating-btn-scroll"
                aria-label="Scroll back to the top of the page"
                whileHover={{
                  scale: 1.12,
                  y: -2,
                  boxShadow: '0 8px 25px rgba(0, 217, 255, 0.45)',
                  borderColor: 'rgba(0, 217, 255, 0.7)',
                  transition: { type: 'spring', stiffness: 400, damping: 15 },
                }}
                whileTap={{ scale: 0.92 }}
                onFocus={() => setHoveredId('scroll-top')}
                onBlur={() => setHoveredId(null)}
              >
                <FaArrowUp size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

