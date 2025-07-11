
"use client";

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

interface SplitTextProps {
  text: string;
  className?: string;
}

function SplitText({ text, className }: SplitTextProps) {
  const letters = text.split('');

  return (
    <div className={className}>
      <AnimatePresence>
        {letters.map((letter, i) => (
          <motion.span
            key={`${letter}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              delay: i * 0.05,
              duration: 0.5,
              ease: 'circOut',
            }}
            className="relative inline-block whitespace-pre"
          >
            {letter}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}

interface WelcomePopupProps {
  userName: string;
  onClose: () => void;
}

export function WelcomePopup({ userName, onClose }: WelcomePopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Automatically close after 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <Card
          className="w-full max-w-md mx-4 p-4 shadow-2xl bg-background/80 border-primary"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the card
        >
          <CardContent className="p-6 text-center flex flex-col items-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
            >
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            </motion.div>
            <SplitText
              text={`Welcome, ${userName}!`}
              className="font-headline text-3xl sm:text-4xl font-bold text-foreground"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="mt-4 text-muted-foreground"
            >
              You're now logged in.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
