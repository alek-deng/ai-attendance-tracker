// Webcam Capture Component for Facial Recognition
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WebcamCapture = ({ onCapture, courseId, isRecognizing = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      console.log('[WebcamCapture] Starting camera for course:', courseId);
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [courseId]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setHasCamera(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasCamera(false);
      setError('Unable to access camera. Please check permissions.');
      toast({
        title: 'Camera Error',
        description: 'Please allow camera access to use facial recognition.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCapture = async () => {
    try {
      console.log('[WebcamCapture] Capture button clicked');
      const blob = await captureImage();
      if (!blob) {
        console.error('[WebcamCapture] Failed to capture image');
        toast({
          title: 'Capture Failed',
          description: 'Unable to capture image. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      console.log('[WebcamCapture] Image captured, blob size:', blob.size);
      if (onCapture) {
        console.log('[WebcamCapture] Calling onCapture callback');
        await onCapture(blob);
      } else {
        console.warn('[WebcamCapture] No onCapture callback provided');
      }
    } catch (error) {
      console.error('[WebcamCapture] Capture error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to capture image',
        variant: 'destructive',
      });
    }
  };

  if (!hasCamera) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            Camera Not Available
          </CardTitle>
          <CardDescription>
            Unable to access your camera. Please check permissions and try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startCamera} variant="outline">
            Retry Camera Access
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-600" />
          Face Recognition Capture
        </CardTitle>
        <CardDescription>
          Position your face in the center of the frame and click "Capture & Recognize"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }} // Mirror effect
          />
          {isRecognizing && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-white font-semibold">Recognizing face...</p>
              </div>
            </div>
          )}
          
          {/* Face detection guide overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-blue-500 rounded-full w-64 h-64 opacity-50" style={{ transform: 'scaleX(-1)' }}></div>
          </div>
        </div>

        {/* Hidden canvas for image capture */}
        <canvas ref={canvasRef} className="hidden" />

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={handleCapture}
            disabled={!isStreaming || isRecognizing}
            size="lg"
            className="min-w-[200px]"
          >
            {isRecognizing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Capture & Recognize
              </>
            )}
          </Button>
          
          {isStreaming && (
            <Button onClick={stopCamera} variant="outline" size="lg">
              Stop Camera
            </Button>
          )}
        </div>

        <div className="text-center text-sm text-slate-600 space-y-2">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Good lighting recommended
          </p>
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Remove glasses/mask if possible
          </p>
          <p className="flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            Look directly at the camera
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebcamCapture;

