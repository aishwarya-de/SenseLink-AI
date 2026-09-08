```jsx
import { useEffect, useRef, useState } from "react";

function App() {
  const [mode, setMode] = useState("sign-to-text");

  // Camera states
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  // Start camera
  const startCamera = async () => {
    try {
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraOn(true);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Unable to access camera. Please allow camera permission in your browser."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOn(false);
  };

  // Stop camera when page closes
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">✋ SenseLink AI</h1>

            <p className="text-sm text-slate-400">
              Real-Time Sign & Gesture Recognition
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400">
            AI Assistant
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Mode switch */}
        <div className="mb-8 flex justify-center">
          <div className="flex rounded-xl bg-slate-900 p-1">
            <button
              onClick={() => setMode("sign-to-text")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                mode === "sign-to-text"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign → Text
            </button>

            <button
              onClick={() => setMode("text-to-sign")}
              className={`rounded-lg px-5 py-2 text-sm font-medium transition ${
                mode === "text-to-sign"
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Text → Sign
            </button>
          </div>
        </div>

        {/* Pages */}
        {mode === "sign-to-text" ? (
          <SignToText
            cameraOn={cameraOn}
            videoRef={videoRef}
            startCamera={startCamera}
            stopCamera={stopCamera}
            cameraError={cameraError}
          />
        ) : (
          <TextToSign />
        )}
      </main>
    </div>
  );
}

/* =========================================================
   SIGN → TEXT
========================================================= */

function SignToText({
  cameraOn,
  videoRef,
  startCamera,
  stopCamera,
  cameraError,
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Camera */}
      <section className="lg:col-span-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {/* Camera Header */}
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
            <div>
              <h2 className="font-semibold">Live Camera</h2>

              <p className="text-sm text-slate-400">
                Show your hand signs to the camera
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs ${
                cameraOn
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {cameraOn ? "Camera active" : "Camera inactive"}
            </span>
          </div>

          {/* Camera Preview */}
          <div className="relative flex aspect-video items-center justify-center bg-slate-950">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center">
                <div className="mb-3 text-5xl">📷</div>

                <p className="text-slate-400">
                  Camera preview
                </p>

                <button
                  onClick={startCamera}
                  className="mt-4 rounded-lg bg-white px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Start Camera
                </button>
              </div>
            )}

            {/* Stop Camera */}
            {cameraOn && (
              <button
                onClick={stopCamera}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-500"
              >
                Stop Camera
              </button>
            )}
          </div>

          {/* Camera Error */}
          {cameraError && (
            <div className="border-t border-red-900 bg-red-500/10 px-5 py-3 text-sm text-red-400">
              {cameraError}
            </div>
          )}
        </div>
      </section>

      {/* Recognition */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="font-semibold">Recognition</h2>

        <div className="mt-6">
          <p className="text-sm text-slate-400">
            Detected Gesture
          </p>

          <p className="mt-2 text-3xl font-bold">
            —
          </p>
        </div>

        {/* Confidence */}
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">
              Confidence
            </span>

            <span>—</span>
          </div>

          <div className="h-2 rounded-full bg-slate-800">
            <div className="h-2 w-0 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Candidates */}
        <div className="mt-8 rounded-xl bg-slate-800/60 p-4">
          <p className="text-sm text-slate-400">
            Top candidates
          </p>

          <p className="mt-2 text-slate-500">
            Predictions will appear here.
          </p>
        </div>
      </section>

      {/* Sentence Builder */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-3">
        <h2 className="font-semibold">
          Sentence Builder
        </h2>

        <div className="mt-4 min-h-24 rounded-xl bg-slate-950 p-5 text-lg text-slate-400">
          Your recognized signs will appear here...
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Remove Last
          </button>

          <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800">
            Clear
          </button>

          <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
            🔊 Speak
          </button>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   TEXT → SIGN
========================================================= */

function TextToSign() {
  return (
    <div className="mx-auto max-w-3xl">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">
          Text → Sign
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Enter a word from the supported vocabulary to see its sign.
        </p>

        <input
          type="text"
          placeholder="Type a word, e.g. Hello"
          className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-slate-400"
        />

        <button className="mt-4 rounded-lg bg-white px-5 py-2 font-semibold text-slate-950 hover:bg-slate-200">
          Find Sign
        </button>

        <div className="mt-6 flex aspect-video items-center justify-center rounded-xl bg-slate-950">
          <p className="text-slate-500">
            Sign reference will appear here.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
```
