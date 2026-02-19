"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertCircle } from "lucide-react";

export const VoiceInput = ({ onTranscript, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [supported, setSupported] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Use a ref for onTranscript to avoid re-initializing recognition when the callback changes
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSupported(false);
        setErrorMessage("Browser not supported");
        return;
      }

      setSupported(true);
      const recognitionInstance = new SpeechRecognition();

      // Enable continuous listening and interim results for better UX
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "en-US";
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcript = event.results[i][0].transcript;
            if (onTranscriptRef.current) {
              onTranscriptRef.current(transcript.trim());
            }
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        // Handle specific errors
        if (event.error === "no-speech") {
          console.log("No speech detected, keep listening...");
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
        // Note: We check the ref/state here, but for simplicity we'll rely on the toggle
        // to manage the 'intent' to listen. 
        // If it stops unexpectedly, we might want to restart, but infinite loops are risky.
        // For now, let's just stop the UI state if it ends.
        setIsListening(false);
      };

      recognitionInstance.onstart = () => {
        console.log("Voice recognition started");
        setIsListening(true);
      };

      setRecognition(recognitionInstance);
    }
  }, []); // Empty dependency array - initialize once

  const toggleListening = () => {
    if (!supported || !recognition) {
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

  // Render even if not supported, but show visual indication
  if (!supported) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`${className} text-gray-300 cursor-not-allowed opacity-50`}
        title="Voice input not supported in this browser"
        disabled
      >
        <MicOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleListening}
      className={`${className} ${isListening ? "text-red-500 animate-pulse" : "text-gray-500 hover:text-blue-600"}`}
      title={isListening ? "Click to stop listening" : "Click to start voice input"}
    >
      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
};
