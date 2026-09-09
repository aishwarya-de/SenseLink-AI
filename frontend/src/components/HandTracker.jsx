import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

function HandTracker({ videoRef, cameraOn, onDetection, onError }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!cameraOn) {
      onDetection(0);
      return undefined;
    }

    let animationFrameId;
    let cancelled = false;
    const cleanupCanvas = canvasRef.current;

    const drawResults = (results) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
        return;
      }

      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = "#34d399";
      context.fillStyle = "#ffffff";
      context.lineWidth = 3;

      results.landmarks.forEach((landmarks) => {
        for (const connection of HandLandmarker.HAND_CONNECTIONS) {
          const start = landmarks[connection.start];
          const end = landmarks[connection.end];
          context.beginPath();
          context.moveTo(start.x * canvas.width, start.y * canvas.height);
          context.lineTo(end.x * canvas.width, end.y * canvas.height);
          context.stroke();
        }

        landmarks.forEach((landmark) => {
          context.beginPath();
          context.arc(
            landmark.x * canvas.width,
            landmark.y * canvas.height,
            5,
            0,
            2 * Math.PI
          );
          context.fill();
        });
      });

      onDetection(results.landmarks.length);
    };

    const trackHands = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
        });

        if (cancelled) {
          handLandmarker.close();
          return;
        }

        const detectFrame = () => {
          if (cancelled) {
            handLandmarker.close();
            return;
          }

          const video = videoRef.current;
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            drawResults(handLandmarker.detectForVideo(video, performance.now()));
          }

          animationFrameId = requestAnimationFrame(detectFrame);
        };

        detectFrame();
      } catch (error) {
        if (!cancelled) {
          console.error("Hand landmark tracker error:", error);
          onError(
            "Hand landmark detection could not start. Check your connection and refresh the page."
          );
        }
      }
    };

    trackHands();

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrameId);
      const context = cleanupCanvas?.getContext("2d");
      if (context && cleanupCanvas) {
        context.clearRect(0, 0, cleanupCanvas.width, cleanupCanvas.height);
      }
    };
  }, [cameraOn, onDetection, onError, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

export default HandTracker;
