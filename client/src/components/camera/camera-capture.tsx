import React, { useState, useRef, useEffect, forwardRef, ForwardedRef } from "react";

const CameraCapture = forwardRef(
    ({ onCapture }: { onCapture: (imageData: string) => void }, ref: ForwardedRef<HTMLVideoElement>) => {
      const videoRef = useRef<HTMLVideoElement>(null);
      const [isCameraReady, setIsCameraReady] = useState(false);
      const [photoTaken, setPhotoTaken] = useState(false);


  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        setIsCameraReady(true);
        if (videoRef.current) {
          let video = videoRef.current;
          video.srcObject = stream;
          video.play();
        }
      })
      .catch((err) => console.error(err));
  };

  const stopCamera = () => {
    if (isCameraReady) {
      const mediaStream = videoRef.current?.srcObject as MediaStream;

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      setPhotoTaken(false)
      setIsCameraReady(false);
    }
  };

  useEffect(() => {
    if (isCameraReady) startCamera();
    return () => {
      stopCamera();
    };
  }, [isCameraReady]);

  // Forward the ref to the video element
  useEffect(() => {
    if (ref) {
      // @ts-ignore
      ref.current = videoRef.current;
    }
  }, [ref]);

  const resetCamera = () => {
    if (videoRef.current) {
      videoRef.current.play()
      setPhotoTaken(false);
    }
  }

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);


        const imageData = canvas.toDataURL("image/jpeg");
        // console.log("Captured image data:", imageData);
        onCapture(imageData);
        setPhotoTaken(true);

        videoRef.current.pause();
      }
    }
  };

  return (
    <div style={{display:'flex', justifyContent:'start', alignItems:'center',gap:'29px'}}>
      <span onClick={startCamera} className="material-symbols-outlined">
        photo_camera
      </span>
      {isCameraReady && (
        <div>
          <video style={{ maxWidth: '100px', borderRadius:'50%' }} ref={videoRef} />
          {!photoTaken && <button onClick={takePicture}>Take Picture</button>}
          {photoTaken && (
            <div>
                <button onClick={resetCamera}>Retake</button>
                <button onClick={stopCamera}>Ok</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default CameraCapture;
