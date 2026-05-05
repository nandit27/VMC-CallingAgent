import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="mt-auto bg-surface text-white pt-16 pb-8 border-t border-white/10" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                    {/* Column 1: About */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-blue-400 mb-4">VMC Agent</h3>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
                            Empowering Vadodara Municipal Corporation with AI-driven communication solutions for better governance and citizen services.
                            We are committed to transparency, efficiency, and rapid response to all civic issues.
                        </p>
                        <div className="flex gap-4 mt-6">
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all">
                                <Twitter size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all">
                                <Facebook size={16} />
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all">
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Contact */}
                    <div className="md:text-right">
                        <h4 className="text-lg font-semibold mb-6 text-gray-200">Contact Us</h4>
                        <div className="flex flex-col md:items-end space-y-4 text-sm text-gray-400">
                            <div className="flex items-start gap-3 md:flex-row-reverse">
                                <MapPin size={18} className="text-blue-400 shrink-0 mt-1" />
                                <span className="md:text-right">Khanderao Market Building,<br />Rajmahal Road, Vadodara-390001</span>
                            </div>
                            <div className="flex items-center gap-3 md:flex-row-reverse">
                                <Phone size={18} className="text-blue-400 shrink-0" />
                                <span>1800-233-0265 <span className="text-xs text-gray-500">(Toll Free)</span></span>
                            </div>
                            <div className="flex items-center gap-3 md:flex-row-reverse">
                                <Mail size={18} className="text-blue-400 shrink-0" />
                                <span>info@vmc.gov.in</span>
                            </div>
                            <div className="flex items-center gap-3 md:flex-row-reverse">
                                <Globe size={18} className="text-blue-400 shrink-0" />
                                <span>www.vmc.gov.in</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Vadodara Municipal Corporation. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0 font-medium">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
                        <a href="#" className="hover:text-white transition-colors">Sitemap</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
