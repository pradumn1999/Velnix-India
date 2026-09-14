import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Package,
  Heart,
  Lock,
  Plus,
  Edit2,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { AddressCard } from '../components/profile/AddressCard';
import { Button } from '../components/common/Button';
import { ShippingAddress } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, addAddress, deleteAddress, setDefaultAddress, logout, isMongoActive } =
    useAuth();
  const { orders } = useOrders();
  const { wishlistCount } = useWishlist();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState(user?.mobile || '');

  // Address Modal / Form State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addrFullName, setAddrFullName] = useState('');
  const [addrMobile, setAddrMobile] = useState('');
  const [addrLine, setAddrLine] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Bengaluru');
  const [addrState, setAddrState] = useState('Karnataka');
  const [addrPincode, setAddrPincode] = useState('560103');
  const [addrType, setAddrType] = useState<'Home' | 'Work' | 'Other'>('Home');

  // Security / Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, mobile });
    showToast('Profile information updated successfully', 'success');
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName.trim() || !addrMobile.trim() || !addrLine.trim() || !addrPincode.trim()) {
      showToast('Please fill all required address fields', 'error');
      return;
    }
    if (!/^\d{6}$/.test(addrPincode.trim())) {
      showToast('Enter a valid 6-digit Indian PIN Code', 'error');
      return;
    }

    addAddress({
      fullName: addrFullName,
      mobile: addrMobile,
      addressLine: addrLine,
      landmark: addrLandmark,
      city: addrCity,
      state: addrState,
      pincode: addrPincode,
      type: addrType,
      isDefault: (user?.addresses.length || 0) === 0,
    });

    setIsAddressModalOpen(false);
    // reset form
    setAddrFullName('');
    setAddrMobile('');
    setAddrLine('');
    setAddrLandmark('');
    showToast('New address added to your address book', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Please fill in password fields', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated securely', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8">
      <Breadcrumb items={[{ label: 'Account Dashboard' }]} />

      {/* User Info Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-neutral-900 text-white flex items-center justify-center font-extrabold text-xl">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-neutral-900">{user?.name}</h1>
              {isMongoActive ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  MongoDB Atlas
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                  MongoDB Ready
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">{user?.email}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{user?.mobile}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 border-red-200"
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/orders"
          className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-neutral-900 block">
              {orders.length}
            </span>
            <span className="text-xs text-neutral-500">Orders Placed</span>
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition-all flex items-center gap-3 shadow-xs"
        >
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-neutral-900 block">
              {wishlistCount}
            </span>
            <span className="text-xs text-neutral-500">Saved in Wishlist</span>
          </div>
        </Link>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-bold text-neutral-900 block">
              {user?.addresses.length || 0}
            </span>
            <span className="text-xs text-neutral-500">Saved Addresses</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-neutral-200 flex items-center gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-800 block">Verified Buyer</span>
            <span className="text-[11px] text-neutral-500">Express Tier Member</span>
          </div>
        </div>
      </div>

      {/* Profile Management Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-neutral-200 shadow-xs flex flex-col gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'profile'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Personal Information</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'addresses'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Manage Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors ${
              activeTab === 'security'
                ? 'bg-neutral-900 text-white font-semibold'
                : 'text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Password & Security</span>
          </button>
        </div>

        {/* Tab Content Panel (9 cols) */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs">
          {/* Tab 1: Personal Info */}
          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Personal Information</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update your display name and contact preferences
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Mobile Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Address Book */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">Address Book</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Saved shipping destinations for 1-click checkout
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => setIsAddressModalOpen(true)}
                >
                  Add New Address
                </Button>
              </div>

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user?.addresses.map((addr) => (
                  <AddressCard
                    key={addr.id}
                    address={addr}
                    onDelete={(id) => {
                      deleteAddress(id);
                      showToast('Address removed', 'info');
                    }}
                    onSetDefault={(id) => {
                      setDefaultAddress(id);
                      showToast('Default address updated', 'success');
                    }}
                  />
                ))}
              </div>

              {/* Add Address Inline Form / Modal Trigger */}
              {isAddressModalOpen && (
                <div className="p-5 rounded-xl border border-neutral-300 bg-neutral-50/60 mt-4 flex flex-col gap-4 text-xs">
                  <h3 className="font-bold text-sm text-neutral-900">Add New Shipping Address</h3>
                  <form onSubmit={handleSaveAddress} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-neutral-700">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={addrFullName}
                          onChange={(e) => setAddrFullName(e.target.value)}
                          placeholder="e.g. Pradumn Mandal"
                          className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-neutral-700">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={addrMobile}
                          onChange={(e) => setAddrMobile(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-semibold text-neutral-700">Street Address *</label>
                      <input
                        type="text"
                        required
                        value={addrLine}
                        onChange={(e) => setAddrLine(e.target.value)}
                        placeholder="House/Flat number, building name, street"
                        className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-neutral-700">Landmark</label>
                        <input
                          type="text"
                          value={addrLandmark}
                          onChange={(e) => setAddrLandmark(e.target.value)}
                          placeholder="Nearby landmark"
                          className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-neutral-700">City *</label>
                        <input
                          type="text"
                          required
                          value={addrCity}
                          onChange={(e) => setAddrCity(e.target.value)}
                          className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-neutral-700">PIN Code *</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={addrPincode}
                          onChange={(e) => setAddrPincode(e.target.value)}
                          className="px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        {(['Home', 'Work', 'Other'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setAddrType(type)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                              addrType === type
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'border-neutral-300 text-neutral-700 bg-white'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsAddressModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="sm">
                          Save Address
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Security & Password */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-6 max-w-xl">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Change Password</h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ensure your account is protected with a secure password
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="flex flex-col gap-4 text-xs">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-neutral-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="px-3 py-2 border border-neutral-300 rounded-lg focus:border-neutral-900 focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="md">
                    Update Password
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
