import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

// Google G pixel art matrix (24 cols x 21 rows)
// R: Google Red, Y: Google Yellow, G: Google Green, B: Google Blue, ' ': Background pixel
const GOOGLE_G_MATRIX = [
  "        RRRRRRRR        ", // 0
  "      RRRRRRRRRRRR      ", // 1
  "    RRRRR      RRRRR    ", // 2
  "   RRRR          RRRR   ", // 3
  "  RRRR            RRRR  ", // 4
  " RRRR              RRRR ", // 5
  " YYYY                   ", // 6
  "YYYY                    ", // 7
  "YYYY                    ", // 8
  "YYYY                    ", // 9
  "YYYY        BBBBBBBBBBB ", // 10
  "YYYY        BBBBBBBBBBB ", // 11
  "YYYY        BBBBBBBBBBB ", // 12
  "YYYY        BBBBBBBBBBB ", // 13
  " YYYY              BBBB ", // 14
  " GGGG              BBBB ", // 15
  "  GGGG            BBBB  ", // 16
  "   GGGG          BBBB   ", // 17
  "    GGGGG      BBBBB    ", // 18
  "     GGGGGGGGGGGGGG     ", // 19
  "       GGGGGGGGGG       ", // 20
];

const COLOR_MAP = {
  R: '#EA4335', // Google Red
  Y: '#FBBC05', // Google Yellow
  G: '#34A853', // Google Green
  B: '#4285F4', // Google Blue
};

// Selectable QR Types with clean SVG icons matching Image 2's pill aesthetics
const QR_TYPES = [
  {
    id: 'url',
    label: 'URL / Web Link',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    id: 'text',
    label: 'Plain Text',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    id: 'phone',
    label: 'Phone Number',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    id: 'wifi',
    label: 'Wi-Fi Network',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3" />
      </svg>
    ),
  },
];

// Rosette Geometric Symbol from Image 2
const RosetteIcon = () => (
  <svg width="34" height="34" viewBox="0 0 32 32" fill="none" stroke="#1f2937" strokeWidth="1.35">
    <circle cx="16" cy="16" r="4.5" />
    <ellipse cx="16" cy="16" rx="10.5" ry="5.5" transform="rotate(0 16 16)" />
    <ellipse cx="16" cy="16" rx="10.5" ry="5.5" transform="rotate(45 16 16)" />
    <ellipse cx="16" cy="16" rx="10.5" ry="5.5" transform="rotate(90 16 16)" />
    <ellipse cx="16" cy="16" rx="10.5" ry="5.5" transform="rotate(135 16 16)" />
  </svg>
);

function App() {
  const [qrType, setQrType] = useState('url');
  const [text, setText] = useState('https://google.com');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');

  const [isRevealed, setIsRevealed] = useState(false);
  const isRevealedRef = useRef(false);

  const qrCanvasRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animFrameIdRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    isRevealedRef.current = isRevealed;
  }, [isRevealed]);

  // Reset particles immediately to default state
  const resetToDefault = useCallback(() => {
    setIsRevealed(false);
    isRevealedRef.current = false;
    if (particlesRef.current) {
      particlesRef.current.forEach((p) => {
        p.x = p.originX;
        p.y = p.originY;
        p.targetX = p.originX;
        p.targetY = p.originY;
        p.vx = 0;
        p.vy = 0;
        p.rotation = 0;
        p.rotSpeed = 0;
        p.flip = 0;
        p.flipSpeed = 0;
        p.opacity = 1;
      });
    }
  }, []);

  // Determine QR payload
  const getQrValue = useCallback(() => {
    switch (qrType) {
      case 'email':
        return email ? `mailto:${email}` : 'https://google.com';
      case 'phone':
        return phone ? `tel:${phone}` : 'https://google.com';
      case 'wifi':
        return wifiSsid ? `WIFI:T:${wifiEncryption};S:${wifiSsid};P:${wifiPassword};;` : 'https://google.com';
      case 'url':
      case 'text':
      default:
        return text || 'https://google.com';
    }
  }, [qrType, text, email, phone, wifiSsid, wifiPassword, wifiEncryption]);

  const qrValue = getQrValue();

  // Render QR Code onto hidden/visible canvas
  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        qrValue,
        {
          width: 260,
          margin: 1,
          color: {
            dark: '#111827',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [qrValue, isRevealed]);

  // Handle URL/Text change with automatic switch back to default logo state
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handleWifiSsidChange = (e) => {
    setWifiSsid(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handleWifiPasswordChange = (e) => {
    setWifiPassword(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handleWifiEncryptionChange = (e) => {
    setWifiEncryption(e.target.value);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  const handleTypeSelect = (selectedType) => {
    setQrType(selectedType);
    if (isRevealedRef.current) {
      resetToDefault();
    }
  };

  // Download QR Code PNG
  const handleDownload = (e) => {
    e.stopPropagation();
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode-${qrType}.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  // Canvas Particle Grid Setup & Animation Loop
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 360;
    const height = 360;
    canvas.width = width;
    canvas.height = height;

    const gridSize = 12; // 30 columns x 30 rows
    const cols = Math.floor(width / gridSize);
    const rows = Math.floor(height / gridSize);

    const logoMatrixCols = GOOGLE_G_MATRIX[0].length; // 24
    const logoMatrixRows = GOOGLE_G_MATRIX.length;    // 21

    // Center enlarged Google logo within the 30x30 grid
    const offsetCol = Math.floor((cols - logoMatrixCols) / 2);
    const offsetRow = Math.floor((rows - logoMatrixRows) / 2);

    const particles = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * gridSize + gridSize / 2;
        const y = r * gridSize + gridSize / 2;

        const logoR = r - offsetRow;
        const logoC = c - offsetCol;
        let char = ' ';
        if (logoR >= 0 && logoR < logoMatrixRows && logoC >= 0 && logoC < logoMatrixCols) {
          char = GOOGLE_G_MATRIX[logoR][logoC] || ' ';
        }

        const isLogo = char !== ' ';
        const color = isLogo ? COLOR_MAP[char] : '#f1f5f9';

        particles.push({
          originX: x,
          originY: y,
          x: x,
          y: y,
          vx: 0,
          vy: 0,
          rotation: 0,
          rotSpeed: 0,
          flip: 0,
          flipSpeed: 0,
          targetX: x,
          targetY: y,
          targetFlip: 0,
          color: color,
          isLogo: isLogo,
          opacity: 1,
        });
      }
    }

    particlesRef.current = particles;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const revealed = isRevealedRef.current;

      particlesRef.current.forEach((p) => {
        if (!revealed) {
          // Hover interaction: proximity repulsion and subtle 3D turnover tilt
          const dx = mouseX - p.originX;
          const dy = mouseY - p.originY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 72;

          if (dist < maxDist) {
            const force = (1 - dist / maxDist) * 20;
            const angle = Math.atan2(dy, dx);
            p.targetX = p.originX - Math.cos(angle) * force;
            p.targetY = p.originY - Math.sin(angle) * force;
            p.targetFlip = (1 - dist / maxDist) * 0.45;
          } else {
            p.targetX = p.originX;
            p.targetY = p.originY;
            p.targetFlip = 0;
          }

          p.x += (p.targetX - p.x) * 0.16;
          p.y += (p.targetY - p.y) * 0.16;
          p.flip += (p.targetFlip - p.flip) * 0.16;
        } else {
          // Circular outward explosion + 3D turnover spin
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 1.02;
          p.vy *= 1.02;
          p.rotation += p.rotSpeed;
          p.flip += p.flipSpeed;
          p.opacity = Math.max(0, p.opacity - 0.022);
        }

        if (p.opacity > 0.01) {
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);

          // 3D perspective flip (turnover)
          const flipScale = Math.cos(p.flip);
          ctx.scale(flipScale, 1);

          ctx.fillStyle = p.color;
          const size = gridSize - 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(-size / 2, -size / 2, size, size, p.isLogo ? 2 : 1);
          } else {
            ctx.rect(-size / 2, -size / 2, size, size);
          }
          ctx.fill();

          // Crisp subtle borders on background grid tiles
          if (!p.isLogo) {
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.75)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          ctx.restore();
        }
      });

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Trigger circular turnover explosion when clicking panel
  const handlePanelClick = () => {
    if (isRevealed) return;
    setIsRevealed(true);

    const canvas = particleCanvasRef.current;
    const width = canvas ? canvas.width : 360;
    const height = canvas ? canvas.height : 360;
    const centerX = width / 2;
    const centerY = height / 2;

    particlesRef.current.forEach((p) => {
      const dx = p.x - centerX;
      const dy = p.y - centerY;
      const angle = Math.atan2(dy, dx);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const speed = 2.8 + Math.random() * 3.8 + (dist / width) * 2.5;

      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.rotSpeed = (Math.random() - 0.5) * 0.22;
      p.flipSpeed = 0.09 + Math.random() * 0.09;
    });
  };

  return (
    <div style={styles.pageWrapper}>
      <div className="split-panel-container" style={styles.splitContainer}>
        {/* LEFT PANEL: 360x360 Canvas Pixel Grid / QR Reveal */}
        <div
          className="split-panel-left"
          style={styles.leftPanel}
          onClick={handlePanelClick}
          title={isRevealed ? '' : 'Click to explode pixels and reveal QR code'}
        >
          {/* 360x360 Particle Canvas */}
          <canvas
            ref={particleCanvasRef}
            style={{
              ...styles.particleCanvas,
              pointerEvents: isRevealed ? 'none' : 'auto',
            }}
          />

          {/* QR Code Reveal underneath using Framer Motion */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.75, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.75, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                style={styles.qrWrapper}
              >
                <div style={styles.canvasFrame}>
                  <canvas ref={qrCanvasRef} style={styles.qrCanvas} />
                </div>

                <button
                  className="download-pill-btn"
                  style={styles.downloadPillBtn}
                  onClick={handleDownload}
                >
                  Download PNG
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT PANEL: Clean Circular / Pill-Shaped Selectables & Inputs */}
        <div className="split-panel-right" style={styles.rightPanel}>
          {/* Header with Rosette Geometric Icon */}
          <div style={styles.headerGroup}>
            <div style={styles.iconWrapper}>
              <RosetteIcon />
            </div>
            <h2 style={styles.heading}>QR Code Generator</h2>
          </div>

          {/* Selectable Pill Buttons */}
          <div style={styles.selectablesContainer}>
            {QR_TYPES.map((item) => {
              const isSelected = qrType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`selectable-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => handleTypeSelect(item.id)}
                  style={{
                    ...styles.selectablePill,
                    backgroundColor: isSelected ? '#111827' : '#f3f4f6',
                    color: isSelected ? '#ffffff' : '#374151',
                    border: isSelected ? '1.5px solid #111827' : '1.5px solid transparent',
                  }}
                >
                  <span style={styles.selectableIcon}>{item.icon}</span>
                  <span style={styles.selectableLabel}>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider matching Image 2 */}
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>ENTER DETAILS</span>
            <span style={styles.dividerLine} />
          </div>

          {/* Circular / Pill Inputs */}
          <AnimatePresence mode="wait">
            {(qrType === 'url' || qrType === 'text') && (
              <motion.div
                key="url-text"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                style={styles.inputGroup}
              >
                <input
                  className="pill-input"
                  type="text"
                  value={text}
                  onChange={handleTextChange}
                  placeholder={qrType === 'url' ? 'e.g., https://google.com' : 'e.g., Type message here...'}
                  style={styles.pillInput}
                />
              </motion.div>
            )}

            {qrType === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                style={styles.inputGroup}
              >
                <input
                  className="pill-input"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="e.g., name@company.com"
                  style={styles.pillInput}
                />
              </motion.div>
            )}

            {qrType === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                style={styles.inputGroup}
              >
                <input
                  className="pill-input"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="e.g., +1 (555) 000-0000"
                  style={styles.pillInput}
                />
              </motion.div>
            )}

            {qrType === 'wifi' && (
              <motion.div
                key="wifi"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                style={styles.wifiContainer}
              >
                <input
                  className="pill-input"
                  type="text"
                  value={wifiSsid}
                  onChange={handleWifiSsidChange}
                  placeholder="e.g., Network Name (SSID)"
                  style={styles.pillInput}
                />

                <input
                  className="pill-input"
                  type="password"
                  value={wifiPassword}
                  onChange={handleWifiPasswordChange}
                  placeholder="Network Password"
                  style={styles.pillInput}
                />

                <select
                  className="pill-input"
                  value={wifiEncryption}
                  onChange={handleWifiEncryptionChange}
                  style={styles.pillSelect}
                >
                  <option value="WPA">WPA / WPA2 / WPA3</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">Open (No Password)</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button matching Image 2 "Continue" pill button */}
          <button
            className="action-pill-btn"
            style={styles.actionPillBtn}
            onClick={handlePanelClick}
          >
            {isRevealed ? 'QR Code Active' : 'Reveal QR Code'}
          </button>

          <p style={styles.footerNote}>
            Click the pixel art or button to reveal • Types auto-reset
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px 20px',
    boxSizing: 'border-box',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  splitContainer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '860px',
    backgroundColor: '#ffffff',
    borderRadius: '28px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb',
    boxShadow: '0 12px 36px rgba(0, 0, 0, 0.05)',
  },
  leftPanel: {
    width: '400px',
    height: '520px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    cursor: 'pointer',
    overflow: 'hidden',
    userSelect: 'none',
  },
  particleCanvas: {
    width: '360px',
    height: '360px',
    display: 'block',
    zIndex: 2,
    borderRadius: '16px',
  },
  qrWrapper: {
    position: 'absolute',
    zIndex: 5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    backgroundColor: '#ffffff',
    padding: '16px',
    borderRadius: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
  },
  canvasFrame: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#ffffff',
    borderRadius: '12px',
  },
  qrCanvas: {
    display: 'block',
    borderRadius: '8px',
  },
  downloadPillBtn: {
    width: '100%',
    padding: '11px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#111827',
    color: '#ffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  rightPanel: {
    flex: 1,
    padding: '36px 40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  headerGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '22px',
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: '12px',
  },
  heading: {
    margin: 0,
    fontSize: '22px',
    fontWeight: '600',
    color: '#111827',
    letterSpacing: '-0.02em',
  },
  selectablesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '9px',
  },
  selectablePill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '11px 20px',
    borderRadius: '9999px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  },
  selectableIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectableLabel: {
    letterSpacing: '-0.01em',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '18px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    padding: '0 12px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '0.06em',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  wifiContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  },
  pillInput: {
    width: '100%',
    padding: '12px 22px',
    fontSize: '14px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#111827',
    boxSizing: 'border-box',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  pillSelect: {
    width: '100%',
    padding: '12px 22px',
    fontSize: '14px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#111827',
    boxSizing: 'border-box',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  actionPillBtn: {
    width: '100%',
    padding: '13px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '9999px',
    border: 'none',
    backgroundColor: '#6b7280',
    color: '#ffffff',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  footerNote: {
    marginTop: '16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    margin: '16px 0 0 0',
  },
};

export default App;