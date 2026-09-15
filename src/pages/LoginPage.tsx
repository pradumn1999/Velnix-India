/** @jsxRuntime classic */
import React, { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { VelnixLogo } from '../components/common/VelnixLogo';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isMongoActive, mongoDatabase, mongoStatusMessage } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      setIsLoading(false);
      if (result.success) {
        showToast(result.message || 'Welcome back to Velnix!', 'success');
        navigate('/');
      } else {
        showToast(result.message || 'Invalid email or password', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Authentication service error', 'error');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-6">
        {/* Brand Header */}
        <div className="text-center flex flex-col items-center gap-3">
          <Link to="/">
            <VelnixLogo variant="badge" size="sm" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Sign In to Velnix
          </h1>
          <p className="text-xs text-neutral-500">
            Secure authentication
          </p>
        </div>

        {/* MongoDB Status Banner */}
        {/* <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
          isMongoActive 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <Database className={`w-4 h-4 shrink-0 mt-0.5 ${isMongoActive ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {isMongoActive ? `MongoDB Connected (${mongoDatabase})` : 'MongoDB Auth Mode'}
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${isMongoActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
              {isMongoActive 
                ? 'Credentials verified directly against your MongoDB cluster.' 
                : `${mongoStatusMessage}. Add MONGODB_URI in Settings to connect your Atlas database.`}
            </p>
          </div>
        </div> */}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-700">Password</label>
              <button
                type="button"
                onClick={() =>
                  showToast('Password reset link sent to demo account email.', 'info')
                }
                className="text-neutral-500 hover:text-neutral-900 text-[11px] font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
              />
              <span className="text-neutral-600 text-xs">Keep me signed in</span>
            </label>
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-neutral-900 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
