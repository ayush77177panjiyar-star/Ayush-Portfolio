/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Github, 
  ExternalLink, 
  Mail, 
  Phone, 
  Download, 
  Code2, 
  Briefcase, 
  MapPin, 
  ChevronRight,
  FileText,
  User,
  Cpu,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Shield,
  X,
  Smartphone,
  ChevronLeft,
  Edit2,
  Save,
  Plus
} from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  logUserLogin, 
  getLogins,
  getProjects,
  updateProject,
  addProject
} from './lib/firebase';
import { 
  signInWithPopup, 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';

const PERSONAL_EMAIL = 'ayush77177panjiyar@gmail.com';

// Types
interface Project {
  id: string; // Changed to string for Firestore ID
  title: string;
  description: string;
  shortDescription?: string;
  tags: string[];
  github: string;
  demo: string;
  updatedAt?: any;
}

interface Skill {
  name: string;
  category: string;
}

interface LoginRecord {
  id: string;
  userId: string;
  email?: string;
  phoneNumber?: string;
  method: string;
  timestamp: any;
  userAgent?: string;
}

const SKILLS: Skill[] = [
  { name: "C", category: "Language" },
  { name: "C++", category: "Language" },
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "Tailwind CSS", category: "Styling" },
  { name: "Vite", category: "Tooling" }
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Home");
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [dbProjects, setDbProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editShortDesc, setEditShortDesc] = useState("");
  const [editLongDesc, setEditLongDesc] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editDemo, setEditDemo] = useState("");

  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isPhoneSigningIn, setIsPhoneSigningIn] = useState(false);

  // Initialize Theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Auth Listener and Initial Data Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email === PERSONAL_EMAIL) {
        fetchLogins();
      } else {
        setIsAdminView(false);
      }
    });

    fetchProjects();
    return () => unsubscribe();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const data = await getProjects();
    if (data) {
      setDbProjects(data as Project[]);
    } else {
      // Seed if empty
      await seedDatabase();
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    const initialProjects = [
      {
        title: "E-Commerce Dashboard",
        shortDescription: "Personalized admin panel for sales and inventory tracking.",
        description: "Developed a comprehensive admin panel for inventory tracking and sales analytics during internship at Saiket Systems. Includes real-time analytics, inventory management, and customer behavior tracking. Performance matched for 2026 standards with sub-100ms interaction latency.",
        tags: ["React", "Tailwind", "Firebase"],
        github: "#",
        demo: "#"
      },
      {
        title: "Task Orchestrator",
        shortDescription: "Sleek project management for minimalist developers.",
        description: "A sleek project management tool with drag-and-drop features and priority leveling for developer workflows. Focus-driven task management app that prioritizes deep work.",
        tags: ["HTML", "CSS", "JS"],
        github: "#",
        demo: "#"
      },
      {
        title: "Weather Intelligence",
        shortDescription: "Real-time weather tracking with deep insights.",
        description: "Real-time weather tracking app using OpenWeather API with detailed forecasting and dynamic backgrounds. Features predictive modeling for local climate shifts.",
        tags: ["API Integration", "CSS3", "JavaScript"],
        github: "#",
        demo: "#"
      },
      {
        title: "Saiket Systems Website",
        shortDescription: "Official corporate site with ultra-fast load times.",
        description: "Collaborated on the official company landing page, focusing on performance optimization and SEO structural elements. Leveraged modern SSR techniques for instant hydration.",
        tags: ["Frontend", "Performance", "HTML"],
        github: "#",
        demo: "#"
      },
      {
        title: "Nexus Chat App",
        shortDescription: "Low-latency messaging with minimalist UI.",
        description: "A minimalist messaging interface built with a focus on UI responsiveness and subtle micro-interactions. Real-time state management using modern protocols.",
        tags: ["CSS Grid", "Animations", "JS"],
        github: "#",
        demo: "#"
      },
      {
        title: "Asset Manager Pro",
        shortDescription: "Enterprise-grade inventory management.",
        description: "Internal inventory management system designed to streamline warehouse operations and equipment logging. Features QR code scanning and automated auditing.",
        tags: ["Systems", "Architecture", "JavaScript"],
        github: "#",
        demo: "#"
      }
    ];

    for (const p of initialProjects) {
      await addProject(p);
    }
    const freshData = await getProjects();
    if (freshData) setDbProjects(freshData as Project[]);
  };

  const startEditing = (project: Project) => {
    setSelectedProject(project);
    setEditTitle(project.title);
    setEditShortDesc(project.shortDescription || "");
    setEditLongDesc(project.description);
    setEditTags(project.tags.join(", "));
    setEditGithub(project.github);
    setEditDemo(project.demo);
    setIsEditing(true);
  };

  const saveProject = async () => {
    if (!selectedProject) return;
    const updatedData = {
      title: editTitle,
      shortDescription: editShortDesc,
      description: editLongDesc,
      tags: editTags.split(",").map(t => t.trim()),
      github: editGithub,
      demo: editDemo
    };

    if (selectedProject.id) {
      await updateProject(selectedProject.id, updatedData);
    } else {
      const newId = await addProject(updatedData);
      selectedProject.id = newId!;
    }
    
    setIsEditing(false);
    fetchProjects();
    // Update local selected project too
    setSelectedProject({ ...selectedProject, ...updatedData });
  };

  const fetchLogins = async () => {
    const data = await getLogins();
    if (data) setLogins(data as LoginRecord[]);
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await logUserLogin(result.user, 'google');
      setShowAuthModal(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) return (window as any).recaptchaVerifier;
    const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
    (window as any).recaptchaVerifier = verifier;
    return verifier;
  };

  const handlePhoneSignIn = async () => {
    try {
      setIsPhoneSigningIn(true);
      const verifier = setupRecaptcha();
      // Ensure number is in E.164 format
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const result = await signInWithPhoneNumber(auth, formattedNumber, verifier);
      setConfirmationResult(result);
    } catch (error) {
      console.error("Phone sign-in failed", error);
      alert("Failed to send OTP. Please check the number.");
    } finally {
      setIsPhoneSigningIn(false);
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult) return;
    try {
      const result = await confirmationResult.confirm(verificationCode);
      await logUserLogin(result.user, 'phone');
      setShowAuthModal(false);
      setConfirmationResult(null);
      setPhoneNumber("");
      setVerificationCode("");
    } catch (error) {
      console.error("OTP Verification failed", error);
      alert("Invalid OTP");
    }
  };

  const handleSignOut = () => {
    signOut(auth);
    setIsAdminView(false);
  };

  const filteredProjects = useMemo(() => {
    return dbProjects.filter(project => 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, dbProjects]);

  const filteredSkills = useMemo(() => {
    return SKILLS.filter(skill => 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Admin Page Render
  if (isAdminView && user?.email === PERSONAL_EMAIL) {
    return (
      <div className="min-h-screen pt-32 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={() => setIsAdminView(false)}
            className="p-2 rounded-full glass glass-hover flex items-center gap-2 pr-4"
          >
            <ChevronLeft size={20} /> Back to Site
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20">
              Personal Account
            </div>
          </div>
        </div>

        <div className="glass rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Shield size={20} className="text-emerald-400" />
              Recent Login Activity
            </h2>
            <button 
              onClick={fetchLogins}
              className="text-xs font-medium text-blue-400 hover:underline"
            >
              Refresh Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-black/20 text-xs text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-4 font-semibold">User ID</th>
                  <th className="px-8 py-4 font-semibold">Contact Info</th>
                  <th className="px-8 py-4 font-semibold">Method</th>
                  <th className="px-8 py-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logins.map((login) => (
                  <tr key={login.id} className="text-sm text-gray-300 hover:bg-white/5 transition-colors">
                    <td className="px-8 py-6 font-mono text-xs opacity-50">{login.userId}</td>
                    <td className="px-8 py-6">
                      {login.email || login.phoneNumber || <span className="italic opacity-30 whitespace-nowrap">N/A</span>}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        login.method === 'google' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {login.method}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500">
                      {login.timestamp?.toDate().toLocaleString() || 'Syncing...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-blue-500/30">
      {/* Recaptcha container */}
      <div id="recaptcha-container"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-3 md:px-6 py-4">
        <div className="max-w-7xl mx-auto glass rounded-full px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 font-semibold text-lg tracking-tight shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">
              AK
            </div>
            <span className="hidden sm:inline">Ayush Kumar</span>
          </motion.div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-400">
            {["Home", "Projects", "Contact"].map((link) => (
              <button 
                key={link}
                onClick={() => {
                  setActiveTab(link);
                  document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`transition-colors hover:text-white ${activeTab === link ? 'text-white' : ''}`}
              >
                {link}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full glass glass-hover text-gray-400 hover:text-white"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative group hidden xs:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                id="search-input"
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm w-24 md:w-48 outline-hidden focus:border-blue-500/50 focus:bg-white/10 transition-all font-light"
              />
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                {user.email === PERSONAL_EMAIL && (
                  <button 
                    onClick={() => setIsAdminView(true)}
                    className="p-2 rounded-full glass glass-hover text-emerald-400"
                    title="Admin Panel"
                  >
                    <Shield size={18} />
                  </button>
                )}
                <button 
                  onClick={handleSignOut}
                  className="p-2 rounded-full glass glass-hover text-red-400"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors"
              >
                <LogIn size={16} /> <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* AUTH MODAL */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass bg-linear-to-br from-white/10 to-white/5 p-8 rounded-[32px] shadow-2xl"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full glass glass-hover text-gray-500"
              >
                <X size={18} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-white">
                  <Shield size={32} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-gray-400 text-sm mt-2">Sign in to access exclusive insights.</p>
              </div>

              <div className="space-y-4">
                {confirmationResult ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-1">Verify OTP</p>
                      <p className="text-sm text-gray-300">Sent to {phoneNumber}</p>
                    </div>
                    <input 
                      type="text" 
                      placeholder="6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full glass rounded-xl py-4 px-6 text-center text-xl tracking-widest font-bold focus:border-blue-500 outline-hidden"
                    />
                    <button 
                      onClick={verifyOTP}
                      className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors"
                    >
                      Verify & Continue
                    </button>
                    <button 
                      onClick={() => setConfirmationResult(null)}
                      className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Change Phone Number
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleGoogleSignIn}
                      className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative flex items-center justify-center my-8">
                      <div className="absolute w-full h-[1px] bg-white/10"></div>
                      <span className="relative z-10 px-4 bg-[#0b0b0f] text-[10px] text-gray-500 uppercase tracking-widest">or</span>
                    </div>

                    <div className="space-y-4">
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input 
                          type="tel" 
                          placeholder="Phone number (+91...)"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full glass rounded-xl py-4 pl-12 pr-6 text-sm focus:border-blue-500 outline-hidden"
                        />
                      </div>
                      <button 
                        onClick={handlePhoneSignIn}
                        disabled={isPhoneSigningIn}
                        className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {isPhoneSigningIn ? "Sending..." : "Send Verification Code"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-12 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                Protected by Enterprise Security
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HERO / BENTO GRID */}
      <main id="home" className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 h-full">
          {/* PROFILE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 md:row-span-1 glass glass-hover p-8 rounded-[24px] flex flex-col justify-end gap-4"
          >
            <div className="flex items-center gap-3 text-blue-400">
              <User size={20} />
              <span className="text-sm font-medium tracking-widest uppercase">Introduction</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                Ayush <span className="text-gradient">Kumar</span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed">
                B.Tech CSE Student at Geeta University. Specialized in high-performance web development with a focus on minimalist aesthetics.
              </p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><MapPin size={14} /> Gadda, Chhatarpur, MP</span>
              </div>
            </div>
          </motion.div>

          {/* SKILLS CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1 md:row-span-1 glass glass-hover p-8 rounded-[24px]"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-purple-400">
                <Cpu size={20} />
                <span className="text-sm font-medium tracking-widest uppercase">Tech Stack</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredSkills.map((skill) => (
                <span key={skill.name} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                  {skill.name}
                </span>
              ))}
              {filteredSkills.length === 0 && <p className="text-xs text-gray-500">No skills found.</p>}
            </div>
          </motion.div>

          {/* EXPERIENCE PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-1 md:row-span-1 glass glass-hover p-8 rounded-[24px] group"
          >
            <div className="flex items-center gap-3 text-emerald-400 mb-6">
              <Briefcase size={20} />
              <span className="text-sm font-medium tracking-widest uppercase">Internship</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Web Development Intern at <strong>Saiket Systems</strong>
            </p>
            <div className="text-2xl font-semibold mb-2">6+ Projects</div>
            <p className="text-xs text-gray-500">Completed full-stack and performance optimization tasks.</p>
            <div className="mt-6">
              <button 
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-xs flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
              >
                View Work <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>

          {/* RESUME CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-4 md:row-span-1 glass bg-linear-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 p-8 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                <FileText size={32} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Curriculum Vitae</h3>
                <p className="text-gray-400 text-sm">Detailed overview of my academic and professional journey.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <a 
                href="#" 
                className="flex-1 md:flex-none text-center px-6 py-3 rounded-xl bg-white dark:bg-white text-black font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download Resume
              </a>
              <a 
                href="#" 
                className="flex-1 md:flex-none text-center px-6 py-3 rounded-xl glass glass-hover font-semibold text-sm flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} /> Preview
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      {/* PROJECTS GRID */}
      <section id="projects" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Featured Projects</h2>
            <p className="text-gray-500 text-sm">A collection of technical solutions and creative builds.</p>
          </div>
          <div className="flex items-center gap-6">
            {user?.email === PERSONAL_EMAIL && (
              <button 
                onClick={() => {
                  const newProj: Project = {
                    id: "",
                    title: "New Project",
                    description: "Details about your new initiative...",
                    shortDescription: "A brief summary...",
                    tags: ["React"],
                    github: "#",
                    demo: "#"
                  };
                  setSelectedProject(newProj);
                  setEditTitle(newProj.title);
                  setEditShortDesc(newProj.shortDescription || "");
                  setEditLongDesc(newProj.description);
                  setEditTags(newProj.tags.join(", "));
                  setEditGithub(newProj.github);
                  setEditDemo(newProj.demo);
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass glass-hover text-emerald-400 text-xs font-bold uppercase tracking-widest"
              >
                <Plus size={14} /> Add Project
              </button>
            )}
            <div className="text-sm text-gray-500 font-mono hidden sm:block">
              {filteredProjects.length} / {dbProjects.length} results
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div 
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProject(project)}
                className="glass glass-hover p-6 rounded-[24px] flex flex-col justify-between group h-full cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-blue-500/10 group-hover:border-blue-500/20 transition-colors">
                      <Code2 size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                    {project.shortDescription || project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-medium tracking-wider uppercase px-2 py-1 rounded-md bg-white/5 text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 py-2.5 rounded-xl glass-hover bg-white/5 text-center text-xs font-semibold flex items-center justify-center gap-2">
                    View Details
                  </div>
                  <div className="p-2.5 rounded-xl glass-hover bg-white/5">
                    <ChevronRight size={16} />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredProjects.length === 0 && (
          <div className="py-20 text-center glass rounded-[24px]">
            <p className="text-gray-500">No matches for "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-4 text-blue-400 text-sm hover:underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-20 px-6 max-w-7xl mx-auto scroll-mt-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-[32px] overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 md:p-16 flex flex-col justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-4">Let's build<br />something great.</h2>
                <p className="text-gray-400 max-w-xs">Open for internship opportunities and freelance projects.</p>
              </div>
              <div className="mt-12 flex flex-col gap-6">
                <a href="mailto:ayush77177panjiyar@gmail.com" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Email Me</div>
                    <div className="font-medium text-gray-300">ayush77177panjiyar@gmail.com</div>
                  </div>
                </a>
                <a href="tel:7903382446" className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-full glass flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Call Me</div>
                    <div className="font-medium text-gray-300">7903382446</div>
                  </div>
                </a>
              </div>
            </div>
            <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 p-12 md:p-16 flex items-center justify-center border-l border-white/5">
              <div className="relative">
                <div className="w-48 h-48 rounded-full bg-blue-500 blur-3xl opacity-20 animate-pulse absolute -top-10 -left-10"></div>
                <div className="w-48 h-48 rounded-full bg-purple-500 blur-3xl opacity-20 animate-pulse absolute -bottom-10 -right-10"></div>
                <div className="text-center relative z-10">
                  <div className="text-5xl font-bold mb-4">Available</div>
                  <p className="text-gray-400 text-sm">For immediate collaboration</p>
                  <button 
                    onClick={() => window.location.href = 'mailto:ayush77177panjiyar@gmail.com'}
                    className="mt-8 px-8 py-4 rounded-2xl bg-white dark:bg-white text-black font-bold uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                  >
                    Get in touch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* PROJECT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedProject(null); setIsEditing(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              className="relative w-full max-w-5xl h-full max-h-[85vh] glass bg-linear-to-br from-white/10 to-white/5 rounded-[40px] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setSelectedProject(null); setIsEditing(false); }}
                    className="p-3 rounded-2xl glass glass-hover text-gray-400"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold tracking-tight">Project Details</h2>
                </div>
                <div className="flex items-center gap-3">
                  {user?.email === PERSONAL_EMAIL && (
                    <button 
                      onClick={() => isEditing ? saveProject() : startEditing(selectedProject)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                        isEditing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'glass glass-hover text-blue-400'
                      }`}
                    >
                      {isEditing ? <><Save size={16} /> Save Changes</> : <><Edit2 size={16} /> Edit Info</>}
                    </button>
                  )}
                  <button 
                    onClick={() => { setSelectedProject(null); setIsEditing(false); }}
                    className="p-3 rounded-2xl glass glass-hover text-gray-500"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                {isEditing ? (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Project Title</label>
                      <input 
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-3xl font-bold bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Short Summary</label>
                      <input 
                        value={editShortDesc}
                        onChange={(e) => setEditShortDesc(e.target.value)}
                        className="w-full text-lg bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-hidden"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Full Description</label>
                      <textarea 
                        rows={8}
                        value={editLongDesc}
                        onChange={(e) => setEditLongDesc(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-hidden leading-relaxed"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tags (comma separated)</label>
                        <input 
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-hidden"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">External Links</label>
                        <div className="flex flex-col gap-2">
                          <input 
                            placeholder="GitHub URL"
                            value={editGithub}
                            onChange={(e) => setEditGithub(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs focus:border-blue-500 outline-hidden"
                          />
                          <input 
                            placeholder="Demo URL"
                            value={editDemo}
                            onChange={(e) => setEditDemo(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs focus:border-blue-500 outline-hidden"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-6">
                          {selectedProject.tags.map(tag => (
                            <span key={tag} className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">{selectedProject.title}</h1>
                        <p className="text-xl text-gray-400 leading-relaxed font-light mb-8 italic">
                          {selectedProject.shortDescription}
                        </p>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 text-lg leading-loose whitespace-pre-wrap">
                            {selectedProject.description}
                          </p>
                        </div>
                      </div>
                      <div className="w-full md:w-80 shrink-0">
                        <div className="sticky top-0 space-y-6">
                          <div className="p-8 glass rounded-[32px] bg-white/5">
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">Project Assets</h4>
                            <div className="space-y-3">
                              <a 
                                href={selectedProject.demo} 
                                target="_blank"
                                rel="no-referrer"
                                className="w-full py-4 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-all"
                              >
                                <ExternalLink size={18} /> Live Demo
                              </a>
                              <a 
                                href={selectedProject.github} 
                                target="_blank"
                                rel="no-referrer"
                                className="w-full py-4 rounded-2xl glass glass-hover font-bold flex items-center justify-center gap-3 transition-all"
                              >
                                <Github size={18} /> Source Code
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-6 glass rounded-[24px] bg-blue-500/5 border-blue-500/10">
                            <p className="text-xs text-gray-400 leading-relaxed">
                              Last updated on: <br />
                              <span className="text-blue-400 font-mono">
                                {selectedProject.updatedAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-medium text-gray-400">© 2026 Ayush Kumar. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-gray-700">Designed for Impact</div>
        </div>
      </footer>
    </div>
  );
}
