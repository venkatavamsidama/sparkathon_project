import React, { useState, useRef, useEffect } from 'react';

const VideoCapture = () => {
    const videoRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [predictedSign, setPredictedSign] = useState(null);

    useEffect(() => {
        let frameCaptureInterval;

        const captureFrameAndPredict = () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataURL = canvas.toDataURL('image/jpeg');

            fetch('http://localhost:5000/predict_video', {
                method: 'POST',
                body: JSON.stringify({ image: dataURL }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Predicted signs:', data.predictions);
                    if (data.predictions.length > 0) {
                        setPredictedSign(data.predictions[0]);
                    }
                })
                .catch(error => {
                    console.error('Error predicting signs:', error);
                });
        };

        if (isCapturing) {
            frameCaptureInterval = setInterval(captureFrameAndPredict, 500);
        } else {
            clearInterval(frameCaptureInterval);
        }

        return () => clearInterval(frameCaptureInterval);
    }, [isCapturing]);

    const startVideoCapture = () => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                videoRef.current.srcObject = stream;
                setIsCapturing(true);
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
            });
    };

    const stopVideoCapture = () => {
        const stream = videoRef.current.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCapturing(false);
        }
    };

    return (
        <div>
            <video ref={videoRef} autoPlay />
            <button onClick={startVideoCapture}>Start Capture</button>
            <button onClick={stopVideoCapture}>Stop Capture</button>
            {predictedSign && <p>Predicted Sign: {predictedSign}</p>}
        </div>
    );
};

export default VideoCapture;
