
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X, Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { NAVIGATION_LINKS } from '../constants';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
              <img 
                src="https://akhundian.org/wp-content/uploads/2022/02/Akhundian-Foundation-Logo.png" 
                alt="Akhundian Foundation" 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  // Fallback if the specific URL fails
                  (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=Akhundian+Foundation&background=059669&color=fff&size=128&rounded=true&bold=true";
                }}
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl leading-none tracking-tight text-brand-900">AKHUNDIAN</span>
                <span className="text-xs tracking-widest text-gray-500 font-medium">FOUNDATION</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 items-center">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'text-brand-600 border-b-2 border-brand-600 pb-1'
                      : 'text-gray-600 hover:text-brand-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/donate"
                className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all transform hover:scale-105 shadow-lg shadow-brand-200 text-sm"
              >
                Donate Now
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-600 hover:text-brand-600 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-1">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link
                  to="/donate"
                  onClick={closeMenu}
                  className="block w-full text-center bg-brand-600 text-white px-5 py-3 rounded-lg font-bold"
                >
                  Donate Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-white text-lg font-bold">Akhundian Foundation</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering communities across Pakistan through education, healthcare, and sustainable development since 2010.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-brand-500 transition"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-500 transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-500 transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-500 transition"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-brand-500 transition">About Us</Link></li>
              <li><Link to="/projects" className="hover:text-brand-500 transition">Our Projects</Link></li>
              <li><Link to="/financials" className="hover:text-brand-500 transition">Financial Reports</Link></li>
              <li><Link to="/privacy" className="hover:text-brand-500 transition">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Get Involved</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/volunteer" className="hover:text-brand-500 transition">Volunteer</Link></li>
              <li><Link to="/donate" className="hover:text-brand-500 transition">Donate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Contact Info</h4>
             <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <span>Office 101, Community Centre, Skardu, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <span>contact@akhundian.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-600 flex-shrink-0" />
                <span>+92 300 1234567</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Akhundian Foundation. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
