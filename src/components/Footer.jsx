import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-space-black border-t border-deep-purple">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-deep-purple" />
              <span className="text-2xl font-bold text-holographic-white">Scantyx</span>
            </Link>
            <p className="tagline">No Scams, Just Scans</p>
            <p className="text-holographic-white/70">
              Blockchain-powered event security with dynamic QR codes. Making events safer and more accessible.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-holographic-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Demo
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-holographic-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-holographic-white">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-holographic-white/70 hover:text-tech-blue transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-deep-purple/30 mt-8 pt-8 text-center text-holographic-white/50">
          <p>&copy; {new Date().getFullYear()} Scantyx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;