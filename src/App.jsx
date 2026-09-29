import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Generate QR Code payload
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

  // Define dynamic diagonal stripes for the background
  const getDynamicStripes = () => {
    const val = text.toLowerCase();
    
    // Default/Standard Colors
    let colorA = '#ff0000'; // Brand Red
    let colorB = '#ffffff'; // Brand White (or secondary color)

    // YouTube: Red and White
    if (val.includes('youtube.com') || val.includes('youtu.be')) {
      colorA = '#ff0000';
      colorB = '#ffffff';
    }
    // Spotify: Green and Black
    else if (val.includes('spotify.com')) {
      colorA = '#1db954';
      colorB = '#000000';
    }
    // Twitter/X: Blue and White (or Black)
    else if (val.includes('twitter.com') || val.includes('x.com')) {
      colorA = '#1da1f2';
      colorB = '#ffffff';
    }
    // GitHub: Black and Grey
    else if (val.includes('github.com')) {
      colorA = '#0d1117';
      colorB = '#6e5494';
    }

    // Return the stripe pattern style
    return {
      backgroundImage: `repeating-linear-gradient(
        -45deg,
        ${colorA},
        ${colorA} 40px,
        ${colorB} 40px,
        ${colorB} 80px
      )`
    };
  };

  const dynamicStripeStyle = getDynamicStripes();

  return (
    <div style={{ ...styles.pageWrapper, ...dynamicStripeStyle }}>
      <motion.div
        style={styles.container}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h1 style={styles.heading}>QR Code Generator</h1>

        <motion.div
          style={styles.card}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
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

          <AnimatePresence mode="wait">
            {(qrType === 'url' || qrType === 'text') && (
              <motion.div
                key="url-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <label style={styles.label}>
                  {qrType === 'url' ? 'Enter Website URL:' : 'Enter Text:'}
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={qrType === 'url' ? 'https://youtube.com' : 'Type message here...'}
                  style={styles.input}
                />
              </motion.div>
            )}

            {qrType === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <label style={styles.label}>Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  style={styles.input}
                />
              </motion.div>
            )}

            {qrType === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <label style={styles.label}>Phone Number:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1234567890"
                  style={styles.input}
                />
              </motion.div>
            )}

            {qrType === 'wifi' && (
              <motion.div
                key="wifi"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                style={styles.wifiGroup}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            style={styles.qrContainer}
            animate={{ scale: [0.95, 1] }}
            transition={{ duration: 0.3 }}
          >
            <canvas ref={canvasRef} />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100vw',
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
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
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