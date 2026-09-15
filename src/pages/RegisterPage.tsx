import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Database, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { VelnixLogo } from '../components/common/VelnixLogo';

// Keep JSX intrinsic elements available when the project uses the automatic
// JSX runtime without exposing the React JSX namespace globally.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isMongoActive, mongoDatabase, mongoStatusMessage } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !mobile.trim() || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (!agreeTerms) {
      showToast('Please agree to the Terms of Service & Privacy Policy', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(name, email, mobile, password);
      setIsLoading(false);
      if (result.success) {
        showToast(result.message || 'Account created successfully in MongoDB! Welcome to Velnix.', 'success');
        navigate('/');
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast(err?.message || 'Failed to connect to authentication server', 'error');
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
            Create Your Account
          </h1>
          <p className="text-xs text-neutral-500">
            User details are stored
          </p>
        </div>

        {/* MongoDB Status Banner */}
        <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
          isMongoActive 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}>
          <Database className={`w-4 h-4 shrink-0 mt-0.5 ${isMongoActive ? 'text-emerald-600' : 'text-amber-600'}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {isMongoActive ? `MongoDB Connected (${mongoDatabase})` : 'MongoDB Storage Ready'}
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${isMongoActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">
              {isMongoActive 
                ? 'Your profile, hashed password, and addresses will be saved directly into MongoDB.' 
                : `${mongoStatusMessage}. Add MONGODB_URI in Settings to connect your MongoDB Atlas cluster.`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Full Name *</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Mobile Phone Number *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Create Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
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

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-neutral-700">Confirm Password *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-9 pr-3 py-2.5 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
            />
            <span className="text-neutral-600 text-[11px] leading-tight">
              I agree to the Velnix Terms of Service, dropshipping policies, and acknowledge my account credentials are encrypted.
            </span>
          </label>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Register
          </Button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-neutral-900 hover:underline">
            Sign In 
          </Link>
        </div>
      </div>
    </div>
  );
};
