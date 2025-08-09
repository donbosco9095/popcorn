import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function LoginPage() {
  const { signIn, signUp, state } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (state.user) {
      navigate(from, { replace: true });
    }
  }, [state.user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authMode === 'signup' && password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      // Error is already handled in the context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      <div className="max-w-md w-full glassmorphism rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 p-10 text-center">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-6">
            <div className="text-4xl">🍿</div>
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Popcorn Cue</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-800 text-lg font-medium">
            {authMode === 'signup' 
              ? 'Join thousands of movie lovers'
              : 'Sign in to your account'
            }
          </p>
        </div>

        {/* Form */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 focus:border-transparent focus:outline-none glassmorphism text-white placeholder-gray-400 transition-all font-medium"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-14 py-4 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 focus:border-transparent focus:outline-none glassmorphism text-white placeholder-gray-400 transition-all font-medium"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Sign Up only) */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-extrabold text-yellow-400 mb-3 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-14 py-4 border border-white/20 rounded-2xl focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50 focus:border-transparent focus:outline-none glassmorphism text-white placeholder-gray-400 transition-all font-medium"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-gray-900 py-4 rounded-2xl font-extrabold hover:from-yellow-300 hover:to-yellow-200 focus:ring-4 focus:ring-yellow-400 focus:ring-opacity-50 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 active:scale-95 transform shadow-lg hover:shadow-xl text-lg"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-900 border-t-transparent"></div>
              ) : (
                <>
                  {authMode === 'signup' ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                  <span>
                    {authMode === 'signup' ? 'Create Account' : 'Sign In'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-6 leading-relaxed">
              {authMode === 'signup' 
                ? 'Sign up to add movies to your watchlist, rate them, and get personalized recommendations!'
                : 'Sign in to access your watchlist, ratings, and personalized movie recommendations!'
              }
            </p>
            <button
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors text-lg"
            >
              {authMode === 'signup' 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>

          {/* Guest Access */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <Link
              to="/"
              className="w-full block text-center py-4 text-gray-300 hover:text-white transition-colors font-medium text-lg rounded-2xl hover:bg-white/5"
            >
              Continue as Guest (Browse Only)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}