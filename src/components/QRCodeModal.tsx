import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ isOpen, onClose }: Props) {
  const [url, setUrl] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  });
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const targetUrl = url.trim() || (typeof window !== "undefined" ? window.location.origin : "");
    QRCode.toDataURL(targetUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: "#123B2D",
        light: "#FFFFFF",
      },
    })
      .then((data) => setQrDataUrl(data))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [isOpen, url]);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleDownload() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "mehfil-e-sufi-install-qr.png";
    a.click();
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card qr-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📲 Install &amp; Share App</h3>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <p className="qr-subhead">
          Scan this QR code with any phone, tablet, iPad or PC to open and install the app.
        </p>

        <div className="qr-preview-box">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Mehfil-e-Sufi Install QR Code" className="qr-image" />
          ) : (
            <div className="qr-loading">Generating QR Code…</div>
          )}
        </div>

        <div className="qr-link-box">
          <label>
            App Link
            <div className="copy-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              <button type="button" className="gold" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </label>
        </div>

        <div className="row" style={{ justifyContent: "center", gap: "10px" }}>
          <button type="button" className="gold" onClick={handleDownload}>
            ⬇️ Download QR Image
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            Done
          </button>
        </div>

        <div className="install-guide">
          <h4>How to Install on Your Device:</h4>
          <ul>
            <li>
              <strong>📱 Android Phones / Tablets:</strong> Scan with Camera or Chrome → Tap{" "}
              <em>"Install app"</em> or browser menu (⋮) → <em>"Add to Home screen"</em>.
            </li>
            <li>
              <strong>🍏 iPhone &amp; iPad:</strong> Scan with Camera → Open in Safari → Tap Share icon (
              <strong>⎋ / [↑]</strong>) → Tap <em>"Add to Home Screen"</em>.
            </li>
            <li>
              <strong>💻 Windows PC &amp; Mac:</strong> Open the link in Chrome/Edge → Click the Install icon (
              <strong>⊕</strong>) in the address bar.
            </li>
          </ul>
        </div>

        <div className="offline-badge">
          🛡️ <strong>100% Offline Ready:</strong> Once installed or opened, all saved lyrics work completely offline without internet!
        </div>
      </div>
    </div>
  );
}
