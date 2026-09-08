import { useEffect, useRef, useState } from "react";

function CameraView({ onCameraChange }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState("");

  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      setCameraOn(true);
      onCameraChange(true);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to access camera. Please allow camera permission in your browser."
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    videoRef.current.srcObject = null;
    setCameraOn(false);
    onCameraChange(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="rounded-2xl bg-slate-800 p-5">
      <h2 className="mb-4 text-xl font-semibold text-white">
        Camera
      </h2>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {!cameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="mb-3 text-5xl">📷</div>
            <p>Camera is off</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {!cameraOn ? (
        <button
          onClick={startCamera}
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500"
        >
          📷 Start Camera
        </button>
      ) : (
        <button
          onClick={stopCamera}
          className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-500"
        >
          ⏹ Stop Camera
        </button>
      )}
    </div>
  );
}

export default CameraView;