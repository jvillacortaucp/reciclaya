/// <reference lib="webworker" />

import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from '@mediapipe/tasks-vision';
import { GestureWorkerPayload, GestureType } from '../models/multimodal.models';

let gestureRecognizer: GestureRecognizer | null = null;
let isInitializing = false;

async function initMediaPipe() {
  if (gestureRecognizer || isInitializing) return;
  isInitializing = true;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      "/assets/wasm"
    );
    
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/assets/models/gesture_recognizer.task",
        delegate: "CPU"
      },
      runningMode: "VIDEO",
      numHands: 1
    });
    
    console.log("MediaPipe Gesture Recognizer initialized in Worker");
  } catch (err) {
    console.error("Failed to initialize MediaPipe in Worker:", err);
  } finally {
    isInitializing = false;
  }
}

function mapGestureCategory(categoryName: string): GestureType {
  switch (categoryName) {
    case 'Thumb_Up': return 'thumbs_up';
    case 'Open_Palm': return 'open_hand';
    case 'Closed_Fist': return 'closed_fist';
    default: return 'none';
  }
}

addEventListener('message', async (event: MessageEvent) => {
  if (event.data.type === 'INIT') {
    await initMediaPipe();
    postMessage({ type: 'READY' });
    return;
  }

  if (!gestureRecognizer) return;

  const { frame, timestamp } = event.data;
  
  if (frame) {
    try {
      const results: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(frame, timestamp);
      
      let detectedType: GestureType = 'none';
      let confidence = 0;

      if (results.gestures.length > 0 && results.gestures[0].length > 0) {
        const topGesture = results.gestures[0][0];
        if (topGesture.categoryName !== 'None') {
          detectedType = mapGestureCategory(topGesture.categoryName);
          confidence = topGesture.score;
        }
      }

      const payload: GestureWorkerPayload = {
        type: detectedType,
        confidence
      };
      
      postMessage(payload);
      
      // Liberar memoria (Zero-Copy cleanup)
      frame.close(); 
    } catch (err) {
      console.error("Error processing frame in Worker:", err);
      frame?.close();
    }
  }
});
