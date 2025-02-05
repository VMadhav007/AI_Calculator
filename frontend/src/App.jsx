import { useEffect, useState, useRef } from "react";
import "./App.css";
import Menu from "./components/Menu";

function App() {
  const [brushColor, setBrushColor] = useState("black");
  const [width, setWidth] = useState(5);
  const [opacity, setOpacity] = useState(0.5);
  const [reset, setReset] = useState(false);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDraw, setIsDraw] = useState(false);
  const [aiDescription, setAiDescription] = useState(""); // State to store the result

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = width;
    ctxRef.current = ctx;
  }, [brushColor, width, opacity]);

  useEffect(() => {
    if (reset) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setReset(false);
    }
  }, [reset]);

  const startDraw = (e) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDraw(true);
  };

  const endDraw = () => {
    ctxRef.current.closePath();
    setIsDraw(false);
  };

  const draw = (e) => {
    if (!isDraw) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const sendCanvasToBackend = async () => {
    const canvas = canvasRef.current;
    const imageBase64 = canvas.toDataURL("image/png");

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      const data = await response.json();
      setAiDescription(data.description); // Store the result in state
    } catch (error) {
      console.error("Error sending image:", error);
      setAiDescription("Failed to process image. Please try again."); // Handle errors
    }
  };

  return (
    <>
      <Menu
        updateColor={setBrushColor}
        updateWidth={setWidth}
        updateOpacity={setOpacity}
        updateReset={setReset}
      />
      <div className="canvas-div">
        <canvas
          id="myCanvas"
          height="500px"
          width="1200px"
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseUp={endDraw}
          onMouseMove={draw}
        />
      </div>
      <button onClick={sendCanvasToBackend}>Run</button>

      {/* Display the result in a div below the canvas */}
      <div className="result-div">
        <h3>AI Result:</h3>
        {aiDescription ? (
          <pre>{JSON.stringify(aiDescription, null, 2)}</pre> // Pretty-print the result
        ) : (
          <p>No result yet. Click "Run" to process the canvas.</p>
        )}
      </div>
    </>
  );
}

export default App;