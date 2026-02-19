"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, X, Check } from "lucide-react";

export function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // We need to set the srcObject after the component renders and ref is attached
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const takePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      
      // Mirror the image if it's user-facing (standard webcam behavior)
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
      setCapturedImage(imageUrl);
      
      // Generate a blob for upload if needed, but dataURL is fine for preview
      if (onCapture) {
        onCapture(imageUrl);
      }
      
      stopCamera();
    }
  }, [onCapture]);

  const retake = () => {
    setCapturedImage(null);
    if (onCapture) onCapture(null);
    startCamera();
  };

  const clear = () => {
    stopCamera();
    setCapturedImage(null);
    if (onCapture) onCapture(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {!isCameraOpen && !capturedImage && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={startCamera}
          className="w-full h-32 flex flex-col gap-2 border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Camera className="h-8 w-8 text-muted-foreground" />
          <span className="text-muted-foreground">Click to Take Photo</span>
        </Button>
      )}

      {isCameraOpen && (
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100" // Mirror CSS
          />
          <div className="absolute bottom-4 flex justify-center gap-4 w-full px-4">
             <Button 
              type="button"
              variant="destructive"
              size="icon"
              onClick={stopCamera}
              className="rounded-full shadow-lg"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              onClick={takePhoto}
              className="rounded-full h-14 w-14 bg-white hover:bg-gray-200 p-1 flex items-center justify-center shadow-lg transform transition-transform active:scale-95"
              title="Capture"
            >
              <div className="h-11 w-11 border-4 border-black rounded-full" />
            </Button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-black aspect-video">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm" 
              onClick={retake}
              className="opacity-90 hover:opacity-100 shadow-sm"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Retake
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              size="sm" 
              onClick={clear}
              className="opacity-90 hover:opacity-100 shadow-sm"
            >
              <X className="h-3 w-3 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
