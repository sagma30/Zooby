import React, { useState, useRef, useEffect, useCallback } from 'react';

interface CameraPhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (imageDataUrl: string) => void;
  currentPhotoUrl?: string;
  userName?: string;
}

export const CameraPhotoCaptureModal: React.FC<CameraPhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  currentPhotoUrl,
  userName = 'User'
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'idle' | 'starting' | 'streaming' | 'captured' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'warm' | 'cool' | 'vibrant'>('normal');

  // File upload fallback ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
  }, [stream]);

  // Start camera stream
  const startCamera = useCallback(async (facing: 'user' | 'environment' = 'user') => {
    stopStream();
    setCameraState('starting');
    setErrorMessage('');
    setCapturedImage(null);

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('error');
      setErrorMessage('Your browser does not support camera access. You can upload a photo from your device instead.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facing,
          width: { ideal: 720 },
          height: { ideal: 720 },
          aspectRatio: 1
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setCameraState('streaming');
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or select a photo from your device.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device was found on your system. You can upload an image file from your device.');
      } else {
        setErrorMessage(err.message || 'Unable to access the camera. Please check your camera settings.');
      }
    }
  }, [stopStream]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraState('idle');
      setCountdown(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Ensure video element plays when stream updates
  useEffect(() => {
    if (videoRef.current && stream && cameraState === 'streaming') {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.log('Video play error:', err));
    }
  }, [stream, cameraState]);

  // Audio shutter sound synthesizer
  const playShutterSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio context might be restricted, silent fallback is fine
    }
  };

  // Perform snapshot capture
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    
    // Target a crisp square avatar (600x600)
    const targetSize = 600;
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Trigger visual flash
    setIsFlashActive(true);
    playShutterSound();
    setTimeout(() => setIsFlashActive(false), 200);

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    // Calculate center-cropped square
    const minDim = Math.min(videoWidth, videoHeight);
    const startX = (videoWidth - minDim) / 2;
    const startY = (videoHeight - minDim) / 2;

    ctx.save();

    // Mirroring if enabled
    if (isMirrored && facingMode === 'user') {
      ctx.translate(targetSize, 0);
      ctx.scale(-1, 1);
    }

    // Apply color grading filters if selected
    if (activeFilter === 'warm') {
      ctx.filter = 'sepia(0.2) saturate(1.2) contrast(1.05)';
    } else if (activeFilter === 'cool') {
      ctx.filter = 'hue-rotate(15deg) saturate(1.1) brightness(1.02)';
    } else if (activeFilter === 'vibrant') {
      ctx.filter = 'saturate(1.3) contrast(1.1)';
    }

    // Draw the centered square frame
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
    setCameraState('captured');
    stopStream();
  };

  // Trigger capture with optional countdown
  const handleInitiateCapture = (useTimer = false) => {
    if (useTimer) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            captureSnapshot();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      captureSnapshot();
    }
  };

  // Switch facing mode (front / back)
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Confirm and apply photo
  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onPhotoCaptured(capturedImage);
      onClose();
    }
  };

  // Fallback file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setCapturedImage(result);
          setCameraState('captured');
          stopStream();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="camera-photo-capture-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          stopStream();
          onClose();
        }
      }}
    >
      <div
        id="camera-photo-capture-modal"
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#dac2ae]/60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#efeeea] flex items-center justify-between bg-[#fffaf4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ffdcbc] text-[#895100] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[20px]">photo_camera</span>
            </div>
            <div>
              <h2 className="font-quicksand font-bold text-lg text-[#1b1c1a] leading-tight">
                Capture Profile Photo
              </h2>
              <p className="text-xs text-[#877462]">
                Take a new headshot for {userName}'s Zooby account
              </p>
            </div>
          </div>

          <button
            id="close-camera-modal-btn"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="w-8 h-8 rounded-full hover:bg-[#ebd9c8] flex items-center justify-center text-[#877462] hover:text-[#1b1c1a] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Viewfinder Canvas / Area */}
        <div className="p-6 flex flex-col items-center bg-[#1e1710] relative min-h-[380px] justify-center select-none overflow-hidden">
          {/* Flash Effect overlay */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-out fade-out" />
          )}

          {/* Countdown Indicator */}
          {countdown !== null && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs">
              <div className="w-24 h-24 rounded-full bg-[#ff9f1c] text-white font-extrabold text-5xl flex items-center justify-center shadow-2xl animate-ping duration-1000">
                {countdown}
              </div>
            </div>
          )}

          {/* STATE 1: Starting / Loading Camera */}
          {cameraState === 'starting' && (
            <div className="flex flex-col items-center justify-center text-white py-12 space-y-3">
              <span className="material-symbols-outlined text-4xl text-[#ff9f1c] animate-spin">
                progress_activity
              </span>
              <p className="text-sm font-semibold text-white/90">Opening your camera...</p>
              <p className="text-xs text-white/60">Please allow camera permissions if prompted</p>
            </div>
          )}

          {/* STATE 2: Active Camera Streaming */}
          {cameraState === 'streaming' && (
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#ff9f1c] shadow-2xl bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  isMirrored && facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
                style={{
                  filter:
                    activeFilter === 'warm'
                      ? 'sepia(0.2) saturate(1.2)'
                      : activeFilter === 'cool'
                      ? 'hue-rotate(15deg) saturate(1.1)'
                      : activeFilter === 'vibrant'
                      ? 'saturate(1.3)'
                      : 'none'
                }}
              />

              {/* Target Face Oval Guideline Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-56 rounded-[50%] border-2 border-white/40 border-dashed animate-pulse" />
              </div>

              {/* Live Badge */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-red-600/80 text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Live Feed</span>
              </div>
            </div>
          )}

          {/* STATE 3: Photo Captured Preview */}
          {cameraState === 'captured' && capturedImage && (
            <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#41674b] shadow-2xl bg-black flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Captured profile headshot preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#41674b] text-white text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-md">
                <span className="material-symbols-outlined text-[12px]">check_circle</span>
                <span>Photo Ready</span>
              </div>
            </div>
          )}

          {/* STATE 4: Camera Access Error or Restricted */}
          {cameraState === 'error' && (
            <div className="max-w-xs text-center p-6 bg-white/10 rounded-2xl border border-white/20 text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">videocam_off</span>
              </div>
              <h3 className="font-quicksand font-bold text-base text-white">Camera Unavailable</h3>
              <p className="text-xs text-white/70 leading-relaxed">{errorMessage}</p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="px-4 py-2 rounded-xl bg-[#ff9f1c] hover:bg-[#ffb049] text-[#1b150e] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span>Try Camera Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Upload Image File</span>
                </button>
              </div>
            </div>
          )}

          {/* Hidden Canvas for High Res Snapshot Processing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Hidden File Input for fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Viewfinder Controls & Filters Toolbar */}
        {cameraState === 'streaming' && (
          <div className="px-6 py-3 bg-[#2d2319] text-white flex items-center justify-between border-t border-white/10 text-xs">
            {/* Mirror Toggle */}
            <button
              type="button"
              onClick={() => setIsMirrored(!isMirrored)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                isMirrored ? 'bg-[#ff9f1c] text-[#1b150e]' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              title="Mirror image horizontally"
            >
              <span className="material-symbols-outlined text-sm">flip</span>
              <span>Mirror {isMirrored ? 'ON' : 'OFF'}</span>
            </button>

            {/* Color grading filter pills */}
            <div className="flex items-center gap-1">
              {(['normal', 'warm', 'cool', 'vibrant'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-0.5 rounded-full capitalize text-[11px] font-semibold transition-colors cursor-pointer ${
                    activeFilter === filter
                      ? 'bg-white text-[#1b150e] font-bold'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Switch Camera (if front/back available) */}
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Switch Camera (Front/Rear)"
            >
              <span className="material-symbols-outlined text-base">flip_camera_ios</span>
            </button>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="p-6 bg-white border-t border-[#efeeea] flex flex-col sm:flex-row items-center justify-between gap-3">
          {cameraState === 'streaming' && (
            <>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  <span>Upload File</span>
                </button>

                <button
                  id="camera-timer-capture-btn"
                  type="button"
                  onClick={() => handleInitiateCapture(true)}
                  disabled={countdown !== null}
                  className="px-3.5 py-2.5 rounded-xl border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="3-second countdown shutter"
                >
                  <span className="material-symbols-outlined text-sm">timer_3</span>
                  <span>3s Timer</span>
                </button>
              </div>

              <button
                id="camera-shutter-btn"
                type="button"
                onClick={() => handleInitiateCapture(false)}
                disabled={countdown !== null}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <span className="material-symbols-outlined text-xl filled-icon">photo_camera</span>
                <span>Take Photo</span>
              </button>
            </>
          )}

          {cameraState === 'captured' && (
            <>
              <button
                id="retake-photo-btn"
                type="button"
                onClick={handleRetake}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Retake Photo</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    stopStream();
                    onClose();
                  }}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-[#dac2ae] text-[#877462] hover:bg-[#f5f3ef] font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  id="save-captured-photo-btn"
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#895100] hover:bg-[#683c00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  <span>Save Photo</span>
                </button>
              </div>
            </>
          )}

          {cameraState === 'error' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl border border-[#dac2ae] text-[#544434] hover:bg-[#f5f3ef] font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
