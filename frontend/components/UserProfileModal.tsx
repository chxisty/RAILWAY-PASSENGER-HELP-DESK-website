'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  LogOut,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync state if user changes
  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone || '');
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      setProfileMessage({ type: 'success', text: 'Profile details updated successfully.' });
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setPasswordSaving(true);
    try {
      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordMessage({ type: 'success', text: 'Password changed successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Incorrect current password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white dark:bg-[#211A2D] rounded-3xl border border-[#E7D5C1] dark:border-[#493B55] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between bg-[#FAF5ED] dark:bg-[#191426]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#E9793D]/20 border border-[#E9793D]/40 flex items-center justify-center text-[#E9793D] dark:text-[#F18445] font-bold text-base">
                {user.full_name?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#251B32] dark:text-[#FFF8F0]">
                  {user.full_name}
                </h3>
                <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-mono">
                  {user.email}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#292137] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E7D5C1] dark:border-[#493B55] px-6 bg-white dark:bg-[#211A2D]">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'border-[#E9793D] text-[#E9793D] dark:text-[#F18445]'
                  : 'border-transparent text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Passenger Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-3 px-4 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
                activeTab === 'password'
                  ? 'border-[#E9793D] text-[#E9793D] dark:text-[#F18445]'
                  : 'border-transparent text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Security & Password</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-4">
            
            {/* Tab 1: Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      profileMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#13875C] dark:text-[#20C997] border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {profileMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{profileMessage.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#E9793D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    Email Address <span className="text-[#685C6B] dark:text-[#C5B9CD] font-normal">(Primary Identifier)</span>
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-100 dark:bg-[#100D19] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#E9793D]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#E9793D] dark:bg-[#F18445] hover:bg-[#D46A34] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Password */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      passwordMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-[#13875C] dark:text-[#20C997] border border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    {passwordMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#E9793D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#E9793D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:ring-2 focus:ring-[#E9793D]"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#E9793D] dark:bg-[#F18445] hover:bg-[#D46A34] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {passwordSaving ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Footer with Logout */}
          <div className="p-4 border-t border-[#E7D5C1] dark:border-[#493B55] bg-[#FAF5ED] dark:bg-[#191426] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
            </div>

            <button
              onClick={async () => {
                onClose();
                await logout();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800/60 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default UserProfileModal;

