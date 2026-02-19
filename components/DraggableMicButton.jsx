"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const DraggableMicButton = ({ isListening, toggleListening }) => {
    // We can use state to track position if we want persistence, 
    // but for now simple drag is enough.

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed z-50 bottom-8 right-8 cursor-grab active:cursor-grabbing"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Button
                size="icon"
                variant={isListening ? "destructive" : "default"}
                className={`h-14 w-14 rounded-full shadow-lg ${isListening ? "animate-pulse" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                onClick={toggleListening}
            >
                {isListening ? (
                    <MicOff className="h-6 w-6 text-white" />
                ) : (
                    <Mic className="h-6 w-6 text-white" />
                )}
            </Button>
        </motion.div>
    );
};
