import { useRef, useState, useCallback } from 'react';
import { useSessionStore } from '../store/sessionStore';

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  error: string | null;
  requestCamera: () => Promise<void>;
  stopCamera: () => void;
  isActive: boolean;
  deviceLabel: string;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [deviceLabel, setDeviceLabel] = useState('');
  const { setStatus } = useSessionStore();

  const requestCamera = useCallback(async () => {
    setError(null);
    setStatus('permission_requested');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);

      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        setDeviceLabel(track.label || 'Unknown camera');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      setStatus('calibrating');
    } catch (err: any) {
      const msg = err?.message || 'Unknown error';
      if (msg.includes('NotAllowed') || msg.includes('Permission')) {
        setError('permission_denied');
        setStatus('permission_denied');
      } else if (msg.includes('NotReadable') || msg.includes('device')) {
        setError('camera_unavailable');
        setStatus('camera_unavailable');
      } else {
        setError('camera_unavailable');
        setStatus('camera_unavailable');
      }
    }
  }, [setStatus]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStream(null);
    setIsActive(false);
    setStatus('stopped');
  }, [setStatus]);

  return { videoRef, stream, error, requestCamera, stopCamera, isActive, deviceLabel };
}
