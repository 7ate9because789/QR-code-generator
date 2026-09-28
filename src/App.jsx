import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function App() {
  const [qrType, setQrType] = useState('url');

  // Input states
  const [text, setText] = useState('https://youtube.com');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  const canvasRef = useRef(null);

  // Determine QR Code raw value
  const getQrValue = () => {
    switch (qrType) {
      case 'email':
        return email ? `mailto:${email}` : ' ';
      case 'phone':
        return phone ? `tel:${phone}` : ' ';
      case 'wifi':
        return wifiSsid ? `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;` : ' ';
      case 'url':
      case 'text':
      default:
        return text || ' ';
    }
  };

  const qrValue = getQrValue();

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrValue, { width: 256 }, (error) => {
        if (error) console.error(error);
      });
    }
  }, [qrValue]);

  // Determine dynamic background theme based on typed input
  const getDynamicBackground = () => {
    const val = text.toLowerCase();

    if (val.includes('youtube.com') || val.includes('youtu.be')) {
      return {
        background: 'linear-gradient(-45deg, #ff0000, #cc0000, #ffffff, #ff4d4d)',
        animation: 'waveGradient 6s ease infinite',
      };
    }
    if (val.includes('spotify.com')) {
      return {
        background: 'linear-gradient(-45deg, #1db954, #191414, #1ed760, #121212)',
        animation: 'waveGradient 6s ease infinite',
      };
    }
    if (val.includes('twitter.com') || val.includes('x.com')) {
      return {
        background: 'linear-gradient(-45deg, #1da1f2, #000000, #0f1419, #71c9f8)',
        animation: 'waveGradient 6s ease infinite',
      };
    }
    if (val.includes('github.com')) {
      return {
        background: 'linear-gradient(-45deg, #2b3137, #24292e, #6e5494, #000000)',
        animation: 'waveGradient 6s ease infinite',
      };
    }

    // Default neutral gradient background
    return {
      background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d247)',
      animation: 'waveGradient 10s ease infinite',
    };
  };

  const dynamicBgStyle = getDynamicBackground();

  return (
    <div style={{ ...styles.pageWrapper, ...dynamicBgStyle }}>
      {/* CSS Keyframes injected directly for smooth wave movement */}
      <style>{`
        @keyframes waveGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={styles.container}>
        <h1 style={styles.heading}>QR Code Generator</h1>

        <div style={styles.card}>
          <label style={styles.label}>Select QR Code Type:</label>
          <select
            value={qrType}
            onChange={(e) => setQrType(e.target.value)}
            style={styles.input}
          >
            <option value="url">URL / Web Link</option>
            <option value="text">Plain Text</option>
            <option value="email">Email</option>
            <option value="phone">Phone Number</option>
            <option value="wifi">Wi-Fi Network</option>
          </select>

          {(qrType === 'url' || qrType === 'text') && (
            <div>
              <label style={styles.label}>{qrType === 'url' ? 'Enter Website URL:' : 'Enter Text:'}</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={qrType === 'url' ? 'https://youtube.com' : 'Type message here...'}
                style={styles.input}
              />
            </div>
          )}

          {qrType === 'email' && (
            <div>
              <label style={styles.label}>Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                style={styles.input}
              />
            </div>
          )}

          {qrType === 'phone' && (
            <div>
              <label style={styles.label}>Phone Number:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                style={styles.input}
              />
            </div>
          )}

          {qrType === 'wifi' && (
            <div style={styles.wifiGroup}>
              <label style={styles.label}>Network Name (SSID):</label>
              <input
                type="text"
                value={wifiSsid}
                onChange={(e) => setWifiSsid(e.target.value)}
                placeholder="Home_WiFi"
                style={styles.input}
              />

              <label style={styles.label}>Password:</label>
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Network Password"
                style={styles.input}
              />

              <label style={styles.label}>Security Type:</label>
              <select
                value={wifiEncryption}
                onChange={(e) => setWifiEncryption(e.target.value)}
                style={styles.input}
              >
                <option value="WPA">WPA / WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Open (No Password)</option>
              </select>
            </div>
          )}

          <div style={styles.qrContainer}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundSize: '400% 400%',
    transition: 'background 0.8s ease-in-out',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    padding: '20px 0',
    boxSizing: 'border-box',
  },
  container: {
    fontFamily: 'system-ui, sans-serif',
    width: '100%',
    maxWidth: '480px',
    padding: '0 20px',
    textAlign: 'center',
  },
  heading: {
    color: '#ffffff',
    textShadow: '0 2px 8px rgba(0,0,0,0.4)',
    marginBottom: '20px',
  },
  card: {
    background: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontWeight: 'bold',
    textAlign: 'left',
    display: 'block',
    marginBottom: '6px',
    marginTop: '10px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    boxSizing: 'border-box',
  },
  wifiGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  qrContainer: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    background: '#ffffff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
  },
};

export default App;