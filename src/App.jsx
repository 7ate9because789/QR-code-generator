import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function App() {
  const [text, setText] = useState('https://example.com');
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, text || ' ', { width: 256 }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [text]);

  return (
    <div style={styles.container}>
      <h1>QR Code Generator</h1>

      <div style={styles.card}>
        <label htmlFor="qr-input" style={styles.label}>Enter Text or URL:</label>
        <input
          id="qr-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something..."
          style={styles.input}
        />

        <div style={styles.qrContainer}>
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: 'system-ui, sans-serif',
    maxWidth: '500px',
    margin: '40px auto',
    padding: '0 20px',
    textAlign: 'center',
  },
  card: {
    background: '#f9f9f9',
    padding: '24px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontWeight: 'bold',
    textAlign: 'left',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  qrContainer: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
  },
};

export default App;