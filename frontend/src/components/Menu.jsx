import * as React from 'react';

export default function Menu({ updateColor, updateWidth, updateOpacity, updateReset }) {
  return (
    <div className="menu-div">
      <label htmlFor="brush">Brush Color</label>
      <input type="color" onChange={(e) => updateColor(e.target.value)} />

      <label htmlFor="BrushSize">Brush Size</label>
      <input type="range" min={1} max={10} onChange={(e) => updateWidth(e.target.value)} />

      <label htmlFor="opacity">Opacity</label>
      <input type="range" min={0} max={1} step={0.1} onChange={(e) => updateOpacity(e.target.value)} />

      {/* Reset Button */}
      <button onClick={() => updateReset(true)}>Reset</button>
    </div>
  );
}
