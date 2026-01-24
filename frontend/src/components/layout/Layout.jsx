import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black font-sans flex flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 pt-0">
                <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
                    <div className="flex-1">
                        {children}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
