import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { Map as MapIcon, LogIn, LogOut, Plus, Search, Layers, Compass, Laptop, Coffee, BookOpen, Star, Utensils } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Map from './components/Map';
import LocationForm from './components/LocationForm';

const CATEGORIES = [
  { id: 'All', icon: Compass },
  { id: 'Work', icon: Laptop },
  { id: 'Coffee', icon: Coffee },
  { id: 'Study', icon: BookOpen },
  { id: 'Hidden Gem', icon: Star },
  { id: 'Food', icon: Utensils },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous',
              email: currentUser.email,
              photoURL: currentUser.photoURL,
              role: 'user',
              createdAt: Timestamp.now()
            });
          }
        } catch (error) {
          console.error("Error checking/creating user doc:", error);
        }
      }
      setUser(currentUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleMapClick = (lat: number, lng: number) => {
    if (!user) {
      alert("Please login to add locations!");
      return;
    }
    setSelectedCoords({ lat, lng });
    setShowForm(true);
  };

  if (!authReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-8 border-black border-t-brand-green rounded-full animate-spin" />
          <p className="text-black font-black uppercase tracking-[0.2em] text-sm">Initializing Deskly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden text-black">
      {/* Navbar */}
      <header className="h-20 bg-white border-b-4 border-black px-8 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_#00ff00]">
            <MapIcon className="text-brand-green w-7 h-7" />
          </div>
          <div>
            <h1 className="font-black text-2xl tracking-tighter uppercase leading-none">Deskly</h1>
            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] mt-1">Workspaces.xyz Edition</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
            <input 
              type="text" 
              placeholder="SEARCH SPOTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border-2 border-black rounded-xl font-black uppercase tracking-widest text-xs focus:bg-brand-green/10 outline-none w-64 transition-all"
            />
          </div>

          {user ? (
            <div className="flex items-center gap-4">
              <img 
                src={user.photoURL || ''} 
                alt="Profile" 
                className="w-12 h-12 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={handleLogout}
                className="p-3 border-2 border-black rounded-xl hover:bg-brand-green transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="px-6 py-3 bg-black text-brand-green font-black uppercase tracking-widest rounded-xl hover:bg-brand-green hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-80 bg-white border-r-4 border-black flex-col p-8 gap-10 overflow-y-auto">
          <div className="space-y-6">
            <h2 className="text-xs font-black text-black uppercase tracking-[0.3em] border-b-2 border-black pb-2">Categories</h2>
            <nav className="space-y-3">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-2 ${
                    activeCategory === cat.id 
                      ? 'bg-brand-green border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1 -translate-x-1' 
                      : 'bg-white border-transparent hover:border-black hover:bg-slate-50'
                  }`}
                >
                  <cat.icon className="w-5 h-5" />
                  {cat.id}
                </button>
              ))}
            </nav>
          </div>

          <div className="bg-black rounded-2xl p-6 text-white relative overflow-hidden group shadow-[8px_8px_0px_0px_#00ff00]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-brand-green/40 transition-all" />
            <h3 className="font-black text-xl uppercase tracking-tighter mb-3 relative z-10">Add Your Desk</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-6 leading-relaxed relative z-10 uppercase tracking-widest">
              Share your favorite workspace or hidden study spot with the community.
            </p>
            <div className="flex items-center gap-3 text-xs font-black text-brand-green relative z-10 group-hover:translate-x-2 transition-transform">
              <Plus className="w-4 h-4" />
              PIN TO MAP
            </div>
          </div>

          <div className="mt-auto pt-8 border-t-2 border-black flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Status</span>
              <span className="text-brand-green">● Online</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Contributors</span>
              <span className="text-black">1.4K+</span>
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <div className="flex-1 p-6 lg:p-10 bg-white relative">
          <Map 
            onMapClick={handleMapClick} 
            selectedLocation={selectedCoords}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
          />

          {/* Mobile Search/Filter */}
          <div className="absolute top-10 left-10 right-10 lg:hidden z-[1000] space-y-2">
            <input 
              type="text" 
              placeholder="SEARCH..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white border-4 border-black rounded-2xl font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] outline-none"
            />
          </div>
        </div>

        {/* Overlay Form */}
        <AnimatePresence>
          {showForm && selectedCoords && (
            <div className="absolute inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
              <LocationForm 
                lat={selectedCoords.lat}
                lng={selectedCoords.lng}
                onClose={() => {
                  setShowForm(false);
                  setSelectedCoords(null);
                }}
                onSuccess={() => {
                  setShowForm(false);
                  setSelectedCoords(null);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
