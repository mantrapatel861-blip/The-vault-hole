/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Shield, 
  Smartphone, 
  Fingerprint, 
  ArrowRight, 
  Bell, 
  ShieldCheck, 
  Key, 
  IdCard, 
  FolderOpen, 
  PenTool, 
  Plus, 
  LayoutGrid, 
  Cloud, 
  Star, 
  Settings,
  ChevronRight,
  User,
  Gem,
  Lock,
  History,
  Zap,
  Languages,
  Moon,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Home,
  Users,
  Baby,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

type Screen = 'login' | 'home' | 'vault' | 'subscription' | 'settings' | 'vault-detail';

interface VaultContentItem {
  id: string;
  type: 'password' | 'idcard' | 'note';
  title: string;
  username?: string;
  password?: string;
  content?: string;
  cardNumber?: string;
  expiry?: string;
  createdAt: string;
}

interface VaultItem {
  id: string;
  name: string;
  desc: string;
  count: string;
  icon: any;
  color: string;
  bg: string;
  items: VaultContentItem[];
}

interface Transaction {
  id: string;
  date: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed';
  plan: string;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// --- Components ---

const Toast = ({ notifications, removeNotification }: { notifications: Notification[], removeNotification: (id: string) => void }) => (
  <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-[320px] px-4">
    <AnimatePresence>
      {notifications.map((n) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
          className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md ${
            n.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' :
            n.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
            'bg-violet-600/90 border-violet-400 text-white'
          }`}
        >
          {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'error' ? <XCircle size={20} /> : <Bell size={20} />}
          <p className="text-sm font-bold flex-1">{n.message}</p>
          <button onClick={() => removeNotification(n.id)} className="opacity-60 hover:opacity-100 transition-opacity">
            <XCircle size={16} />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-violet-100 dark:border-slate-800 relative z-10"
          >
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'vault', label: 'Vault', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 px-6 pb-8 pt-4 z-50">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-violet-600 dark:text-violet-400 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
            >
              <div className={`p-2 rounded-2xl transition-colors ${isActive ? 'bg-violet-100 dark:bg-violet-900/30' : ''}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// --- Screens ---

const LoginScreen = ({ onLogin, isDarkMode, onToggleDarkMode, onBiometricLogin }: { onLogin: () => void, isDarkMode: boolean, onToggleDarkMode: () => void, onBiometricLogin: () => void }) => {
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');
  const [isScanning, setIsScanning] = useState(false);

  const handleBiometricClick = () => {
    setIsScanning(true);
    // Simulate biometric scan delay
    setTimeout(() => {
      setIsScanning(false);
      onBiometricLogin();
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-[#1e144d] via-[#3d1e8a] to-[#2563eb]'}`}>
      {/* Aurora Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[120%] h-[50%] blur-[100px] rounded-full animate-pulse ${isDarkMode ? 'bg-violet-900/20' : 'bg-violet-600/20'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[120%] h-[50%] blur-[100px] rounded-full animate-pulse delay-700 ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-600/20'}`} />
      </div>

      {/* Theme Toggle on Login */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={onToggleDarkMode}
          className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-90 transition-all"
        >
          {isDarkMode ? <Zap size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Header Section */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-16 pb-12 px-6 text-center z-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative group"
        >
          <div className="w-24 h-24 bg-white/15 backdrop-blur-xl border border-white/30 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[shine_3s_infinite]" />
            <Shield className="text-white w-12 h-12 drop-shadow-lg" />
          </div>
          <div className="w-16 h-2 bg-black/20 blur-md rounded-full mx-auto -mt-2 animate-pulse" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-2 tracking-tight text-white"
        >
          SecureVault
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-indigo-100/80 text-sm font-medium max-w-xs mx-auto leading-relaxed"
        >
          Your digital documents, encrypted & protected
        </motion.p>
      </div>

      {/* Form Section */}
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="flex-grow bg-white dark:bg-slate-900 rounded-t-[3rem] shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)] relative z-20 overflow-y-auto no-scrollbar"
      >
        <div className="p-8 pt-10 pb-12 flex flex-col h-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Sign In</h2>
          
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 flex relative">
            <button 
              onClick={() => setLoginMethod('otp')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all z-10 ${loginMethod === 'otp' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500'}`}
            >
              OTP Login
            </button>
            <button 
              onClick={() => setLoginMethod('password')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all z-10 ${loginMethod === 'password' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500'}`}
            >
              Password
            </button>
          </div>

          {/* Input */}
          <div className="space-y-6 mb-8">
            <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2 ml-1">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Smartphone className="text-gray-400 dark:text-slate-500 w-5 h-5 group-focus-within:text-violet-600 transition-colors" />
                </div>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000"
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-transparent rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-violet-600 focus:bg-white dark:focus:bg-slate-700 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={onLogin}
            className="w-full bg-violet-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-600/20 active:scale-[0.97] transition-all mb-8 flex items-center justify-center gap-2"
          >
            Send OTP
            <ArrowRight size={20} />
          </button>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-4 text-gray-400 dark:text-slate-500 font-medium tracking-wider">Alternative Secure Login</span>
            </div>
          </div>

          <button 
            onClick={handleBiometricClick}
            disabled={isScanning}
            className={`w-full flex items-center justify-center gap-3 border-2 border-gray-100 dark:border-slate-800 hover:border-violet-600/30 text-gray-700 dark:text-slate-300 font-semibold py-4 rounded-2xl transition-all active:scale-[0.98] mb-8 relative overflow-hidden ${isScanning ? 'opacity-70' : ''}`}
          >
            <div className="relative">
              <Fingerprint className={`${isScanning ? 'text-violet-400' : 'text-violet-600'} w-7 h-7 transition-colors`} />
              {isScanning && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="absolute left-0 w-full h-0.5 bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" 
                />
              )}
            </div>
            <span>{isScanning ? 'Scanning...' : 'Login with Biometrics'}</span>
          </button>

          <div className="mt-auto space-y-6 text-center">
            <button className="inline-flex items-center gap-2 text-gray-400 dark:text-slate-500 hover:text-violet-600 text-sm font-semibold transition-colors">
              <Shield size={18} />
              Admin Dashboard
            </button>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              New to SecureVault? 
              <button className="text-violet-600 font-bold hover:underline ml-1">Create Account</button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const HomeScreen = ({ onCategorySelect, onNotificationClick, onQuickUpload }: { onCategorySelect: (id: string) => void, onNotificationClick: () => void, onQuickUpload: () => void }) => {
  const categories = [
    { id: 'passwords', name: 'Passwords', count: '24 Items', icon: Key, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
    { id: 'idcards', name: 'ID Cards', count: '5 Items', icon: IdCard, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'vault', name: 'Vault', count: '112 Files', icon: FolderOpen, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'notes', name: 'Notes', count: '8 Items', icon: PenTool, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 pb-32 no-scrollbar">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 bg-violet-600 rounded-2xl shadow-lg flex items-center justify-center transform rotate-6 border-4 border-white dark:border-slate-800">
              <Shield className="text-white w-8 h-8 fill-white" />
            </div>
            <div className="absolute -top-1 -right-1 animate-bounce">
              <div className="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm">
                <span className="text-[10px]">👋</span>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">SecureVault</h1>
            <p className="text-[10px] uppercase tracking-widest text-violet-600 dark:text-violet-400 font-bold">Hello, Alex!</p>
          </div>
        </div>
        <button 
          onClick={onNotificationClick}
          className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 active:scale-95 transition-all"
        >
          <Bell size={24} />
        </button>
      </header>

      <main className="px-6">
        {/* Status Card */}
        <section className="mt-8 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-2xl shadow-violet-600/30 dark:shadow-violet-900/20">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-lg rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">System Live</span>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <ShieldCheck size={20} />
              </div>
            </div>
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">Your Vault is Secure</h2>
            <p className="text-white/80 text-sm mb-8 font-medium">Auto-syncing active across 4 devices</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-white/60 mb-1 uppercase font-bold tracking-wider">Encrypted</p>
                <p className="text-2xl font-black">1,482</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <p className="text-[10px] text-white/60 mb-1 uppercase font-bold tracking-wider">Health</p>
                <p className="text-2xl font-black">99.8%</p>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-4 bottom-4 opacity-10 transform rotate-12">
            <Shield size={120} />
          </div>
        </section>

        {/* Categories */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Categories</h3>
            <button className="text-slate-900 dark:text-white font-bold text-sm bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full active:scale-95 transition-transform">See All</button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div 
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  onClick={() => onCategorySelect(cat.id)}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[2rem] flex flex-col items-center justify-center text-center gap-5 shadow-xl shadow-slate-200/50 dark:shadow-none active:scale-95 transition-all cursor-pointer"
                >
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg border border-slate-50 dark:border-slate-700 ${cat.bg}`}>
                    <Icon className={`w-12 h-12 ${cat.color} font-light`} />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white font-extrabold text-lg">{cat.name}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-tighter">{cat.count}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <button 
          onClick={onQuickUpload}
          className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white ring-8 ring-white dark:ring-slate-900 shadow-2xl transition-all hover:scale-110 active:scale-90 group"
        >
          <Plus size={40} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="mt-4 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
          Quick Upload
        </div>
      </div>
    </div>
  );
};

const VaultScreen = ({ vaults, onAddVault, onVaultClick }: { vaults: VaultItem[], onAddVault: () => void, onVaultClick: (vault: VaultItem) => void }) => {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 pb-32 no-scrollbar">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-6 py-6 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">My Vaults</h1>
        <button 
          onClick={onAddVault}
          className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="px-6 py-8">
        <div className="space-y-6">
          {vaults.map((vault) => {
            const Icon = vault.icon;
            return (
              <motion.div
                key={vault.id}
                whileHover={{ x: 5 }}
                onClick={() => onVaultClick(vault)}
                className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl shadow-slate-200/30 dark:shadow-none active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${vault.bg}`}>
                  <Icon className={`w-8 h-8 ${vault.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{vault.name}</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">{vault.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-violet-600 dark:text-violet-400 font-black text-sm">{vault.count}</p>
                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 ml-auto mt-1 group-hover:text-violet-600 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm">
            <Users className="text-slate-400 dark:text-slate-500 w-8 h-8" />
          </div>
          <h4 className="text-slate-900 dark:text-white font-bold mb-2">Need a Shared Space?</h4>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-[200px]">Create a new vault to share with family or team members.</p>
          <button 
            onClick={onAddVault}
            className="px-6 py-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-full border border-slate-200 dark:border-slate-600 shadow-sm active:scale-95 transition-all"
          >
            Create New Vault
          </button>
        </div>
      </main>
    </div>
  );
};

const VaultDetailScreen = ({ vault, onBack, onAddItem }: { vault: VaultItem, onBack: () => void, onAddItem: () => void }) => {
  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 pb-32 no-scrollbar">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border-b border-violet-100 dark:border-slate-800 flex items-center gap-4">
        <button onClick={onBack} className="text-violet-600 dark:text-violet-400 w-10 h-10 flex items-center justify-center rounded-full hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">{vault.name}</h2>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{vault.items.length} Items</p>
        </div>
        <button 
          onClick={onAddItem}
          className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      <main className="px-6 py-8">
        {vault.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 ${vault.bg}`}>
              <vault.icon className={`w-12 h-12 ${vault.color}`} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Vault is Empty</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[240px]">Start adding your sensitive documents and passwords to this vault.</p>
            <button 
              onClick={onAddItem}
              className="mt-8 px-8 py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add First Item
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vault.items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  {item.type === 'password' ? <Key size={24} /> : item.type === 'idcard' ? <IdCard size={24} /> : <FileText size={24} />}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.type === 'password' ? item.username : item.type === 'idcard' ? item.cardNumber : 'Note Content'}
                  </p>
                </div>
                <button className="text-slate-400 hover:text-violet-600 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const SubscriptionScreen = ({ transactions, addNotification }: { transactions: Transaction[], addNotification: (msg: string, type: 'success' | 'error' | 'info') => void }) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePayment = async (planName: string, amount: number) => {
    try {
      setLoading(planName);
      
      // 1. Create order on server
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await response.json();

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "SecureVault",
        description: `Subscription for ${planName}`,
        order_id: order.id,
        handler: function (response: any) {
          addNotification(`Payment Successful! ID: ${response.razorpay_payment_id}`, 'success');
          // In a real app, you would verify the payment on the server here
        },
        prefill: {
          name: "User Name",
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#7c3aed"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        addNotification(`Payment Failed: ${response.error.description}`, 'error');
      });
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      addNotification(error instanceof Error ? error.message : "Payment failed to initialize", 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 pb-32 no-scrollbar">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-4 border-b border-violet-100 dark:border-slate-800 flex items-center">
        <h1 className="flex-1 text-center text-lg font-bold tracking-tight text-slate-900 dark:text-white">Subscription & Storage</h1>
      </header>

      <main className="overflow-y-auto">
        {/* Progress Section */}
        <section className="flex flex-col items-center justify-center py-10 px-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle className="text-violet-50 dark:text-slate-800 stroke-current" cx="50" cy="50" fill="transparent" r="40" strokeWidth="8" />
              <circle 
                className="text-violet-600 dark:text-violet-400 stroke-current" 
                cx="50" cy="50" 
                fill="transparent" 
                r="40" 
                strokeWidth="8" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 * (1 - 0.65)} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-violet-600 dark:text-violet-400">65%</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-1">Full</span>
            </div>
            <div className="absolute -bottom-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg border border-violet-100 dark:border-slate-700">
              <p className="text-sm font-bold text-slate-900 dark:text-white">32.5 GB <span className="text-slate-400 dark:text-slate-500 font-normal">/ 50 GB</span></p>
            </div>
          </div>
          <div className="mt-8 text-center px-10">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Your secure vault is reaching its capacity. Upgrade for a seamless experience.</p>
          </div>
        </section>

        {/* Transaction History */}
        <section className="px-6 py-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
            <button className="text-violet-600 dark:text-violet-400 text-xs font-bold">View All</button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <History size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.plan}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 dark:text-white">{tx.amount}</p>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vault Usage Breakdown */}
        <section className="px-6 py-6 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Vault Breakdown</h2>
          <div className="space-y-5">
            {[
              { name: 'Personal Vault', size: '18.2 GB', color: 'bg-violet-600', percent: 56 },
              { name: 'Family Vault', size: '10.5 GB', color: 'bg-blue-500', percent: 32 },
              { name: 'Child Vault', size: '3.8 GB', color: 'bg-emerald-500', percent: 12 },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{item.size}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className={`h-full ${item.color}`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upgrade Options */}
        <section className="px-6 py-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Upgrade Options</h2>
          <div className="space-y-4">
            {/* Standard Plan */}
            <div className="relative flex flex-col gap-4 rounded-2xl border-2 border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 p-6 overflow-hidden">
              <div className="absolute top-0 right-0">
                <div className="bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg">Best Value</div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Standard Vault</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-violet-600 dark:text-violet-400">₹799</span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">/ year</span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" /> 25 GB Secure Storage
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" /> Fast Upload Speeds
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-400 dark:text-slate-600">
                  <XCircle size={18} className="text-slate-300 dark:text-slate-700" /> Family Sharing
                </li>
              </ul>
              <button 
                onClick={() => handlePayment('Standard Vault', 799)}
                disabled={loading === 'Standard Vault'}
                className="w-full bg-violet-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/20 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                {loading === 'Standard Vault' ? 'Processing...' : 'Upgrade Now'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Premium Vault</h3>
                <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg">High Capacity</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">₹1000</span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">/ year</span>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" /> 100 GB Secure Storage
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" /> Priority Fiber Uploads
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" /> 24/7 Priority Support
                </li>
              </ul>
              <button 
                onClick={() => handlePayment('Premium Vault', 1000)}
                disabled={loading === 'Premium Vault'}
                className="w-full bg-slate-900 dark:bg-slate-700 text-white font-bold py-4 rounded-xl active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
              >
                {loading === 'Premium Vault' ? 'Processing...' : 'Select Premium'}
              </button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-8 bg-violet-50/30 dark:bg-violet-900/5">
          <h2 className="text-xl font-bold mb-6 text-center text-slate-900 dark:text-white">Why Upgrade?</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Instant Upload', desc: 'Unrestricted speeds for 4K assets and large PDFs.', icon: Zap },
              { title: 'Deep Shield', desc: 'Enhanced quantum-safe encryption for all files.', icon: ShieldCheck },
              { title: 'Auto-Sync', desc: 'Keep your documents synced across 10+ devices.', icon: Cloud },
              { title: 'Version History', desc: 'Restore any previous version from the last 90 days.', icon: History },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-violet-100 dark:border-slate-700">
                  <div className="bg-violet-100 dark:bg-violet-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                    <Icon size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">{f.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

const SettingsScreen = ({ 
  isDarkMode, 
  onToggleDarkMode, 
  onLogout, 
  isBiometricEnabled, 
  onToggleBiometric,
  userProfile,
  onEditProfile,
  onManageSubscription,
  onSetup2FA,
  onChangePassword,
  language,
  onSetLanguage,
  is2FAEnabled
}: { 
  isDarkMode: boolean, 
  onToggleDarkMode: () => void, 
  onLogout: () => void, 
  isBiometricEnabled: boolean, 
  onToggleBiometric: () => void,
  userProfile: UserProfile,
  onEditProfile: () => void,
  onManageSubscription: () => void,
  onSetup2FA: () => void,
  onChangePassword: () => void,
  language: 'EN' | 'HI',
  onSetLanguage: (l: 'EN' | 'HI') => void,
  is2FAEnabled: boolean
}) => {
  const [toggles, setToggles] = useState({
    alerts: true,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SettingItem = ({ icon: Icon, title, desc, hasArrow = true, isToggle = false, onToggle, isActive, onClick }: any) => (
    <div 
      onClick={!isToggle ? onClick : undefined}
      className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-violet-50 dark:border-slate-700 cursor-pointer hover:bg-violet-50/50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <div className="text-violet-600 dark:text-violet-400 flex items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 shrink-0 w-10 h-10">
        <Icon size={20} />
      </div>
      <div className="flex flex-col flex-1">
        <p className="text-base font-semibold text-slate-900 dark:text-white">{title}</p>
        <p className="text-slate-500 dark:text-slate-400 text-xs">{desc}</p>
      </div>
      {isToggle ? (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`w-12 h-7 rounded-full transition-colors relative ${isActive ? 'bg-violet-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      ) : hasArrow && (
        <ChevronRight size={20} className="text-slate-400" />
      )}
    </div>
  );

  const translations = {
    EN: {
      settings: 'Settings',
      account: 'Account & Subscription',
      privacy: 'Privacy & Security',
      security: 'Security',
      preferences: 'Preferences',
      save: 'Save Changes',
      logout: 'Logout from Vault'
    },
    HI: {
      settings: 'सेटिंग्स',
      account: 'खाता और सदस्यता',
      privacy: 'गोपनीयता और सुरक्षा',
      security: 'सुरक्षा',
      preferences: 'पसंद',
      save: 'परिवर्तन सहेजें',
      logout: 'वॉल्ट से लॉगआउट करें'
    }
  };

  const t = translations[language];

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 pb-32 no-scrollbar">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 border-b border-violet-100 dark:border-slate-800 flex items-center justify-between">
        <div className="w-10" />
        <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight flex-1 text-center">{t.settings}</h2>
        <div className="w-10" />
      </header>

      <main className="overflow-y-auto">
        {/* Profile Card */}
        <section className="mt-4 px-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-violet-50 dark:border-slate-700">
            <div className="relative">
              <img 
                src={userProfile.avatar} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-100 dark:ring-violet-900/30"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{userProfile.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Pro Member • Security Lvl 3</p>
            </div>
            <button 
              onClick={onEditProfile}
              className="p-2 text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-colors"
            >
              <PenTool size={20} />
            </button>
          </div>
        </section>

        {/* Sections */}
        <div className="px-6 mt-8 space-y-8">
          {/* Account */}
          <div>
            <h3 className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.account}</h3>
            <div className="space-y-2">
              <SettingItem icon={User} title="Profile Information" desc="Name, email, and phone" onClick={onEditProfile} />
              <SettingItem icon={Gem} title="Subscription" desc="Manage SecureVault Pro" onClick={onManageSubscription} />
            </div>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.privacy}</h3>
            <div className="space-y-2">
              <SettingItem icon={Fingerprint} title="Biometric Login" desc="Use FaceID or Fingerprint" isToggle isActive={isBiometricEnabled} onToggle={onToggleBiometric} />
              <SettingItem icon={ShieldCheck} title="Two-Factor Auth" desc={is2FAEnabled ? "Enabled via Google Authenticator" : "Highly recommended"} onClick={onSetup2FA} />
            </div>
          </div>

          {/* Security */}
          <div>
            <h3 className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.security}</h3>
            <div className="space-y-2">
              <SettingItem icon={Lock} title="Password Management" desc="Change or reset master password" onClick={onChangePassword} />
              <SettingItem icon={Bell} title="Login Alerts" desc="Get notified of new logins" isToggle isActive={toggles.alerts} onToggle={() => toggle('alerts')} />
              <SettingItem icon={Shield} title="Security Audit" desc="Check for leaked or weak passwords" />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h3 className="text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest mb-4">{t.preferences}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl border border-violet-50 dark:border-slate-700">
                <div className="text-violet-600 dark:text-violet-400 flex items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 shrink-0 w-10 h-10">
                  <Languages size={20} />
                </div>
                <div className="flex flex-col flex-1">
                  <p className="text-base font-semibold text-slate-900 dark:text-white">Language</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{language === 'EN' ? 'English' : 'हिंदी'}</p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                  <button 
                    onClick={() => onSetLanguage('EN')}
                    className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition-all ${language === 'EN' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => onSetLanguage('HI')}
                    className={`px-3 py-1 text-xs font-bold rounded-md shadow-sm transition-all ${language === 'HI' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}
                  >
                    HI
                  </button>
                </div>
              </div>
              <SettingItem icon={Moon} title="Dark Theme" desc="Gentle on your eyes" isToggle isActive={isDarkMode} onToggle={onToggleDarkMode} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-6 py-10 flex flex-col gap-4">
          <button className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-[0.98] transition-all">
            {t.save}
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </main>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickUploadOpen, setIsQuickUploadOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isProfileEditOpen, setIsProfileEditOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [language, setLanguage] = useState<'EN' | 'HI'>('EN');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Rivierre',
    email: 'alex@securevault.com',
    phone: '+91 98765 43210',
    avatar: 'https://picsum.photos/seed/alex/200/200'
  });

  const [transactions] = useState<Transaction[]>([
    { id: '1', date: 'Mar 12, 2026', amount: '₹500', status: 'completed', plan: 'SecureVault Pro Monthly' },
    { id: '2', date: 'Feb 12, 2026', amount: '₹500', status: 'completed', plan: 'SecureVault Pro Monthly' },
    { id: '3', date: 'Jan 12, 2026', amount: '₹500', status: 'completed', plan: 'SecureVault Pro Monthly' },
  ]);

  const [editProfileData, setEditProfileData] = useState<UserProfile>(userProfile);
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [twoFACode, setTwoFACode] = useState('');

  const [newVaultName, setNewVaultName] = useState('');
  const [selectedVault, setSelectedVault] = useState<VaultItem | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // New Item Form State
  const [newItemType, setNewItemType] = useState<'password' | 'idcard' | 'note'>('password');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemValue1, setNewItemValue1] = useState(''); // username or card number
  const [newItemValue2, setNewItemValue2] = useState(''); // password or expiry or content

  const [vaults, setVaults] = useState<VaultItem[]>([
    { id: 'personal', name: 'Personal Vault', desc: 'Private passwords & IDs', count: '42 Items', icon: Lock, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', items: [] },
    { id: 'family', name: 'Family Vault', desc: 'Shared documents & access', count: '12 Items', icon: Users, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', items: [] },
    { id: 'child', name: 'Child Vault', desc: 'Restricted safe storage', count: '5 Items', icon: Baby, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', items: [] },
  ]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Handle initial login
  const handleLogin = () => {
    setIsLoggedIn(true);
    setScreen('home');
    addNotification('Welcome back, Alex!', 'success');
  };

  const handleBiometricLogin = () => {
    if (isBiometricEnabled) {
      setIsLoggedIn(true);
      setScreen('home');
      addNotification('Biometric authentication successful!', 'success');
    } else {
      addNotification('Biometric login is disabled in settings', 'error');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setScreen('login');
    addNotification('Logged out successfully', 'info');
  };

  const handleAddVault = () => {
    if (!newVaultName.trim()) {
      addNotification('Please enter a vault name', 'error');
      return;
    }
    const newVault: VaultItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newVaultName,
      desc: 'Newly created shared vault',
      count: '0 Items',
      icon: LayoutGrid,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      items: []
    };
    setVaults([...vaults, newVault]);
    setNewVaultName('');
    setIsModalOpen(false);
    addNotification(`Vault "${newVaultName}" created!`, 'success');
  };

  const handleAddItem = () => {
    if (!newItemTitle.trim()) {
      addNotification('Please enter a title', 'error');
      return;
    }
    if (!selectedVault) return;

    const newItem: VaultContentItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: newItemType,
      title: newItemTitle,
      username: newItemType === 'password' ? newItemValue1 : undefined,
      password: newItemType === 'password' ? newItemValue2 : undefined,
      cardNumber: newItemType === 'idcard' ? newItemValue1 : undefined,
      expiry: newItemType === 'idcard' ? newItemValue2 : undefined,
      content: newItemType === 'note' ? newItemValue2 : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedVaults = vaults.map(v => {
      if (v.id === selectedVault.id) {
        const updatedItems = [...v.items, newItem];
        return { ...v, items: updatedItems, count: `${updatedItems.length} Items` };
      }
      return v;
    });

    setVaults(updatedVaults);
    // Update selected vault to reflect changes
    setSelectedVault(updatedVaults.find(v => v.id === selectedVault.id) || null);
    
    // Reset form
    setNewItemTitle('');
    setNewItemValue1('');
    setNewItemValue2('');
    setIsAddItemOpen(false);
    addNotification(`${newItemType.charAt(0).toUpperCase() + newItemType.slice(1)} added to ${selectedVault.name}`, 'success');
  };

  const handleVaultClick = (vault: VaultItem) => {
    setSelectedVault(vault);
    setScreen('vault-detail');
  };

  return (
    <div className={`max-w-md mx-auto bg-white dark:bg-slate-900 h-screen overflow-hidden shadow-2xl relative ${isDarkMode ? 'dark' : ''}`}>
      <Toast notifications={notifications} removeNotification={removeNotification} />
      
      <AnimatePresence mode="wait">
        {screen === 'login' && !isLoggedIn && (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginScreen 
              onLogin={handleLogin} 
              isDarkMode={isDarkMode} 
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
              onBiometricLogin={handleBiometricLogin}
            />
          </motion.div>
        )}

        {isLoggedIn && (
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="h-full overflow-x-hidden"
          >
            {screen === 'home' && (
              <HomeScreen 
                onCategorySelect={(id) => setScreen('vault')} 
                onNotificationClick={() => addNotification('No new notifications', 'info')}
                onQuickUpload={() => setIsQuickUploadOpen(true)}
              />
            )}
            {screen === 'vault' && <VaultScreen vaults={vaults} onAddVault={() => setIsModalOpen(true)} onVaultClick={handleVaultClick} />}
            {screen === 'vault-detail' && selectedVault && (
              <VaultDetailScreen 
                vault={selectedVault} 
                onBack={() => setScreen('vault')} 
                onAddItem={() => setIsAddItemOpen(true)}
              />
            )}
            {screen === 'subscription' && <SubscriptionScreen transactions={transactions} addNotification={addNotification} />}
            {screen === 'settings' && (
              <SettingsScreen 
                isDarkMode={isDarkMode} 
                onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
                onLogout={handleLogout} 
                isBiometricEnabled={isBiometricEnabled}
                onToggleBiometric={() => {
                  setIsBiometricEnabled(!isBiometricEnabled);
                  addNotification(`Biometric login ${!isBiometricEnabled ? 'enabled' : 'disabled'}`, 'info');
                }}
                userProfile={userProfile}
                onEditProfile={() => {
                  setEditProfileData(userProfile);
                  setIsProfileEditOpen(true);
                }}
                onManageSubscription={() => setScreen('subscription')}
                onSetup2FA={() => setIs2FASetupOpen(true)}
                onChangePassword={() => setIsPasswordChangeOpen(true)}
                language={language}
                onSetLanguage={(l) => {
                  setLanguage(l);
                  addNotification(`Language changed to ${l === 'EN' ? 'English' : 'Hindi'}`, 'success');
                }}
                is2FAEnabled={is2FAEnabled}
              />
            )}
            
            {screen !== 'vault-detail' && <BottomNav currentScreen={screen} setScreen={setScreen} />}
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Vault">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Vault Name</label>
            <input 
              type="text" 
              value={newVaultName}
              onChange={(e) => setNewVaultName(e.target.value)}
              placeholder="e.g. Work Projects"
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
            />
          </div>
          <button 
            onClick={handleAddVault}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            Create Vault
          </button>
        </div>
      </Modal>

      <Modal isOpen={isProfileEditOpen} onClose={() => setIsProfileEditOpen(false)} title="Edit Profile">
        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src={editProfileData.avatar} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover ring-4 ring-violet-100 dark:ring-violet-900/30"
                referrerPolicy="no-referrer"
              />
              <button className="absolute bottom-0 right-0 bg-violet-600 text-white p-2 rounded-full shadow-lg">
                <PenTool size={16} />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Full Name</label>
              <input 
                type="text" 
                value={editProfileData.name}
                onChange={(e) => setEditProfileData({...editProfileData, name: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Email Address</label>
              <input 
                type="email" 
                value={editProfileData.email}
                onChange={(e) => setEditProfileData({...editProfileData, email: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={editProfileData.phone}
                onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              setUserProfile(editProfileData);
              setIsProfileEditOpen(false);
              addNotification('Profile updated successfully!', 'success');
            }}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            Update Profile
          </button>
        </div>
      </Modal>

      <Modal isOpen={isPasswordChangeOpen} onClose={() => setIsPasswordChangeOpen(false)} title="Change Master Password">
        <div className="space-y-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-800 flex gap-3">
            <Shield className="text-amber-600 shrink-0" size={20} />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              Changing your master password will re-encrypt all your vault items. This may take a moment.
            </p>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Current Password</label>
              <input 
                type="password" 
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">New Password</label>
              <input 
                type="password" 
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Confirm New Password</label>
              <input 
                type="password" 
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              if (passwordData.new !== passwordData.confirm) {
                addNotification('New passwords do not match', 'error');
                return;
              }
              setIsPasswordChangeOpen(false);
              setPasswordData({ current: '', new: '', confirm: '' });
              addNotification('Master password changed successfully!', 'success');
            }}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            Change Password
          </button>
        </div>
      </Modal>

      <Modal isOpen={is2FASetupOpen} onClose={() => setIs2FASetupOpen(false)} title="Two-Factor Authentication">
        <div className="space-y-6">
          {!is2FAEnabled ? (
            <>
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto">
                  <Smartphone className="text-violet-600 dark:text-violet-400" size={32} />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">Google Authenticator</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 px-4">
                    Scan the QR code in your Google Authenticator app to link your account.
                  </p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-3xl border-4 border-violet-50 dark:border-slate-800 flex justify-center">
                <div className="w-48 h-48 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Simulated QR Code */}
                  <div className="grid grid-cols-8 gap-1 p-4 opacity-80">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className={`w-full aspect-square ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-transparent'}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-2 rounded-lg shadow-lg">
                      <Lock className="text-violet-600" size={24} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all text-center text-2xl tracking-[0.5em] font-black"
                />
              </div>
              <button 
                onClick={() => {
                  if (twoFACode.length === 6) {
                    setIs2FAEnabled(true);
                    setTwoFACode('');
                    setIs2FASetupOpen(false);
                    addNotification('2FA enabled successfully!', 'success');
                  } else {
                    addNotification('Please enter the 6-digit code', 'error');
                  }
                }}
                className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
              >
                Verify & Enable
              </button>
            </>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="text-emerald-600" size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-xl">2FA is Active</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Your account is protected with Google Authenticator.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIs2FAEnabled(false);
                  setIs2FASetupOpen(false);
                  addNotification('2FA has been disabled', 'info');
                }}
                className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl active:scale-95 transition-all"
              >
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title={`Add to ${selectedVault?.name}`}>
        <div className="space-y-6">
          {/* Type Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            {(['password', 'idcard', 'note'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setNewItemType(t)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${newItemType === t ? 'bg-white dark:bg-slate-700 shadow-sm text-violet-600 dark:text-violet-400' : 'text-slate-400'}`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Title</label>
              <input 
                type="text" 
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="e.g. Netflix Account"
                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
              />
            </div>

            {newItemType === 'password' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Username / Email</label>
                  <input 
                    type="text" 
                    value={newItemValue1}
                    onChange={(e) => setNewItemValue1(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Password</label>
                  <input 
                    type="password" 
                    value={newItemValue2}
                    onChange={(e) => setNewItemValue2(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
              </>
            )}

            {newItemType === 'idcard' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Card Number</label>
                  <input 
                    type="text" 
                    value={newItemValue1}
                    onChange={(e) => setNewItemValue1(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Expiry Date</label>
                  <input 
                    type="text" 
                    value={newItemValue2}
                    onChange={(e) => setNewItemValue2(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all"
                  />
                </div>
              </>
            )}

            {newItemType === 'note' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Note Content</label>
                <textarea 
                  value={newItemValue2}
                  onChange={(e) => setNewItemValue2(e.target.value)}
                  placeholder="Type your secure note here..."
                  rows={4}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-violet-600 transition-all resize-none"
                />
              </div>
            )}
          </div>

          <button 
            onClick={handleAddItem}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            Add to Vault
          </button>
        </div>
      </Modal>

      <Modal isOpen={isQuickUploadOpen} onClose={() => setIsQuickUploadOpen(false)} title="Quick Upload">
        <div className="space-y-6">
          <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Cloud className="text-violet-600 dark:text-violet-400 w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Tap to Upload</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">PDF, PNG, JPG up to 50MB</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsQuickUploadOpen(false);
              addNotification('File uploaded successfully!', 'success');
            }}
            className="w-full py-4 bg-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-600/20 active:scale-95 transition-all"
          >
            Select Files
          </button>
        </div>
      </Modal>
    </div>
  );
}
