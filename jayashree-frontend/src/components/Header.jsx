import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { TbMapPin, TbMenu2, TbPhone, TbX } from 'react-icons/tb';
import { useContent } from '../hooks/useContent.jsx';
import { formatPhone, telLink } from '../services/contact.js';
import SocialLinks from './SocialLinks.jsx';

export const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/projects', label: 'Projects' },
  { to: '/services', label: 'Services' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/contact', label: 'Contact Us' },
];

export default function Header() {
  const { get } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const phone = get('contact.phone1');

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="topbar">
        <div className="container topbar-inner">
          <div className="topbar-contact">
            <span>
              <TbMapPin aria-hidden="true" /> {get('contact.address')}
            </span>
            {phone && (
              <a href={telLink(phone)}>
                <TbPhone aria-hidden="true" /> {formatPhone(phone)}
              </a>
            )}
          </div>
          <div className="topbar-right">
            <SocialLinks className="topbar-social" />
            {/* Deliberately quiet: visitors should not be drawn to it. */}
            <Link to="/admin/login" className="admin-link" rel="nofollow">
              Admin
            </Link>
          </div>
        </div>
      </div>

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label={`${get('company.name')} home`}>
            <img src="/images/brand/logo.jpeg" alt={get('company.name')} width="640" height="640" />
          </Link>

          <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-quote-mobile">
                <Link to="/get-a-quote" className="btn btn-primary">
                  Get a Quote
                </Link>
              </li>
            </ul>
          </nav>

          <div className="header-actions">
            <Link to="/get-a-quote" className="btn btn-primary header-quote">
              <TbPhone aria-hidden="true" />
              Get a Quote
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <TbX /> : <TbMenu2 />}
            </button>
          </div>
        </div>
        {open && <button type="button" className="nav-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      </header>
    </>
  );
}
