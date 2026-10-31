import React from 'react';
import { BarChart2, ShieldAlert, Heart } from 'lucide-react';
import { MANDATORY_INDEPENDENCE_NOTICE } from '../config/rpmConfig';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#090916] border-t border-[#1e1e38] text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#1c1c33]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-3">
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#ff4d4d] to-[#ff7e5f] flex items-center justify-center text-white">
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-white text-base tracking-wider">
                CHANNELSCOPE ANALYTICS
              </span>
            </div>
            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Transparent, independent YouTube channel statistics, upload velocity analysis, and country-based RPM revenue estimation.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white">
              Platform & Tools
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  YouTube Analytics Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Revenue Estimator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('blog')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Analytics & Growth Blog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  About ChannelScope
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Informational Column */}
          <div className="md:col-span-4 space-y-2">
            <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-white">
              Legal & Disclosures
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('disclaimer')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Disclaimer & Limitations
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Privacy Policy & Data Security
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#00ffcc] transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Independence Notice as specified in PDF page 40-41 */}
        <div className="mt-8 p-4 rounded-xl bg-[#14142a] border border-[#232342] text-xs text-gray-400 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#ff7e5f] flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Platform Notice:</strong> "{MANDATORY_INDEPENDENCE_NOTICE}"
          </p>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>© {new Date().getFullYear()} ChannelScope Analytics. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with rigorous engineering & transparent data integrity.
          </p>
        </div>
      </div>
    </footer>
  );
};
