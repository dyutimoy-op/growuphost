import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, ExternalLink, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const PromoPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { data: activePopup } = useQuery({
    queryKey: ['active-promo-popup'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promo_popups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });

  useEffect(() => {
    const isDismissed = localStorage.getItem('promo-popup-dismissed');
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (activePopup && !dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [activePopup, dismissed]);

  const handleClose = (dontShowAgain = false) => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('promo-popup-dismissed', 'true');
      setDismissed(true);
    }
  };

  if (!activePopup || dismissed || !isOpen) return null;


  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
        >
          <button 
            onClick={() => handleClose()}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white/70 hover:text-white hover:bg-black/40 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {activePopup.image_url && (
            <div className="relative h-64 w-full">
              <img 
                src={activePopup.image_url} 
                alt={activePopup.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-8 space-y-6 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tight">{activePopup.title}</h3>
              {activePopup.description && (
                <p className="text-slate-400 font-medium leading-relaxed">
                  {activePopup.description}
                </p>
              )}
            </div>

            {activePopup.coupon_code && (
              <div className="flex items-center justify-center gap-2 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl group">
                <Tag className="w-5 h-5 text-indigo-400" />
                <span className="text-lg font-black text-indigo-400 tracking-wider">
                  {activePopup.coupon_code}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                asChild
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-7 text-lg font-black"
                onClick={() => handleClose(true)}
              >
                <a href={activePopup.cta_url || '#'}>
                  {activePopup.cta_text || 'Claim Offer'}
                  <ExternalLink className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <button 
                onClick={() => handleClose(true)}
                className="text-sm font-bold text-slate-500 hover:text-slate-400 transition-colors"
              >
                Don't show this again
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
