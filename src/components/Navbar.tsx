import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogIn, LogOut, User, Menu, X, TrendingUp } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Navbar() {
  const { state, signOut } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="glassmorphism border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 font-extrabold text-2xl text-yellow-400 hover:text-yellow-300 transition-colors tracking-tight"
          >
            <div className="text-3xl">🍿</div>
            <span className="hidden sm:block">Popcorn Cue</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/trending"
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-full font-bold transition-all ${
                location.pathname === '/trending'
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Trending</span>
            </Link>
            
            {state.user && (
              <Link
                to="/watchlist"
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full font-bold transition-all ${
                  location.pathname === '/watchlist'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span>Watchlist</span>
                {state.watchlist.length > 0 && (
                  <span className="bg-yellow-400 text-gray-900 text-xs rounded-full px-2.5 py-1 min-w-[24px] text-center font-extrabold">
                    {state.watchlist.length}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center space-x-4">
            {state.user ? (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3 text-gray-300 px-4 py-2 rounded-full bg-white/5">
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium truncate max-w-32">{state.user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-full glassmorphism text-gray-300 hover:text-white hover:bg-white/20 transition-all font-bold active:scale-95 transform"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold active:scale-95 transform shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all active:scale-95 transform"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 py-6 glassmorphism">
            <div className="space-y-4">
              <Link
                to="/trending"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                  location.pathname === '/trending'
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                <span>Trending</span>
              </Link>
              
              {state.user && (
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                    location.pathname === '/watchlist'
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Watchlist</span>
                  {state.watchlist.length > 0 && (
                    <span className="bg-yellow-400 text-gray-900 text-xs rounded-full px-2.5 py-1 min-w-[24px] text-center font-extrabold ml-auto">
                      {state.watchlist.length}
                    </span>
                  )}
                </Link>
              )}
              
              {state.user ? (
                <div className="pt-4 border-t border-white/20 space-y-4">
                  <div className="flex items-center space-x-3 px-4 py-3 text-gray-300 bg-white/5 rounded-2xl">
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium truncate">{state.user.email}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-gray-300 hover:text-white hover:bg-white/10 transition-all font-bold"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 hover:from-yellow-300 hover:to-yellow-200 transition-all font-bold shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}