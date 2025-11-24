"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

export const VoiceInput = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      setSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      // Enable continuous listening and interim results for better UX
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      let finalTranscript = "";

      recognitionInstance.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            onTranscript(transcript.trim());
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        // Handle specific errors
        if (event.error === "no-speech") {
          console.log("No speech detected, keep listening...");
          // Don't stop on no-speech, let it continue
        } else if (event.error === "not-allowed") {
          alert("Microphone permission denied. Please allow microphone access in your browser settings.");
          setIsListening(false);
        } else {
          console.log("Error occurred, restarting...");
          setIsListening(false);
        }
      };

      recognitionInstance.onend = () => {
        // If we're supposed to be listening, restart
        if (isListening) {
          try {
            recognitionInstance.start();
          } catch (e) {
            console.log("Recognition ended");
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionInstance.onstart = () => {
        console.log("Voice recognition started");
        setIsListening(true);
      };

      setRecognition(recognitionInstance);
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert("Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        // If already started, stop and restart
        recognition.stop();
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch (e) {
            console.error("Failed to restart:", e);
          }
        }, 100);
      }
    }
  };

  if (!supported) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={`${className} ${isListening ? "text-red-500 animate-pulse" : "text-gray-500"}`}
      title={isListening ? "Click to stop listening" : "Click to start voice input"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};
