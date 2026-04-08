import React, { useState } from 'react';
import { X, MapPin, Tag, Plus, Loader2, Laptop, Coffee, BookOpen, Star, Utensils } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

interface LocationFormProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  { id: 'Work', icon: Laptop },
  { id: 'Coffee', icon: Coffee },
  { id: 'Study', icon: BookOpen },
  { id: 'Hidden Gem', icon: Star },
  { id: 'Food', icon: Utensils },
];

export default function LocationForm({ lat, lng, onClose, onSuccess }: LocationFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Work');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'locations'), {
        id: crypto.randomUUID(),
        title,
        description,
        category,
        lat,
        lng,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous',
        tags,
        createdAt: Timestamp.now()
      });
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'locations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-2xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden w-full max-w-md"
    >
      <div className="bg-black p-5 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-black">
            <MapPin className="w-5 h-5" />
          </div>
          <h2 className="font-black text-xl uppercase tracking-tighter">Add New Spot</h2>
        </div>
        <button onClick={onClose} className="hover:bg-brand-green hover:text-black p-1 rounded transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black text-black uppercase tracking-widest">Title</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Minimalist Desk Setup"
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl focus:bg-brand-green/10 outline-none transition-all font-bold placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-black uppercase tracking-widest">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  category === cat.id 
                    ? 'bg-brand-green border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5' 
                    : 'bg-white border-slate-200 text-slate-400 hover:border-black hover:text-black'
                }`}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-tighter">{cat.id}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-black uppercase tracking-widest">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What makes this place special?"
            rows={3}
            className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl focus:bg-brand-green/10 outline-none transition-all font-bold placeholder:text-slate-400 resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-black uppercase tracking-widest">Tags (Press Enter)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-black text-brand-green text-[10px] font-black uppercase tracking-widest rounded flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="WiFi, Quiet, Coffee..."
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black rounded-xl focus:bg-brand-green/10 outline-none transition-all font-bold placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center gap-4">
          <button
            disabled={loading}
            type="submit"
            className="w-full px-6 py-4 bg-black text-brand-green font-black uppercase tracking-widest rounded-xl hover:bg-brand-green hover:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6" />
                Add to Map
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
