import React, { useRef, useState } from 'react';

function Canvas() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  const startDrawing = () => {
    setDrawing(true);
  };

  const finishDrawing = () => {
    setDrawing(false);
  };

  const draw = (event) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI);
    ctx.fill();
  };

  const predictDrawing = () => {
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const formData = new FormData();
      formData.append('image', blob);
      setIsLoading(true); // Set isLoading to true before making the fetch request
      fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log(data);
        setPrediction(data.caption);
      })
      .catch(error => {
        console.error('Error:', error);
      })
      .finally(() => {
        setIsLoading(false); // Set isLoading to false after the fetch request is completed
      });
    });
  };

  const resetDrawing = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPrediction('');
  };

  return (
    <div className="App">
      <h1>Drawing to Text Converter</h1>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{ border: '1px solid black' }}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
      ></canvas>
      <br />
      <button onClick={() => predictDrawing()} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Predict'}
      </button>
      <button onClick={() => resetDrawing()}>Reset</button> {/* Add reset button */}
      <div>Prediction: {prediction}</div>
    </div>
  );
}

export default Canvas;
