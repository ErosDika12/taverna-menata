import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

// Every menu and gallery photo is stored in this shape (4:5, like an Instagram post).
export const PHOTO_ASPECT = 4 / 5;
const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = Math.round(OUTPUT_WIDTH / PHOTO_ASPECT);

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Fotoja nuk u lexua. Provoni një foto tjetër.'));
    img.src = src;
  });
}

async function cropToFile(src, area, originalName) {
  const img = await loadImage(src);
  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  canvas.getContext('2d').drawImage(img, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) throw new Error('Fotoja nuk u pre. Provoni përsëri.');
  const name = originalName.replace(/\.[^.]+$/, '') + '.jpg';
  return new File([blob], name, { type: 'image/jpeg' });
}

/** Modal that lets the admin drag/zoom a photo inside a fixed 4:5 frame, then returns the cropped JPEG file. */
export default function ImageCropper({ file, onCancel, onDone }) {
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function confirm() {
    if (!area) return;
    setWorking(true);
    setError('');
    try {
      onDone(await cropToFile(src, area, file.name));
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  return (
    <div className="cropper-backdrop" role="dialog" aria-modal="true" aria-label="Prerja e fotos">
      <div className="cropper-dialog">
        <h2>Zgjidhni pjesën e fotos</h2>
        <p className="admin-hint">Tërhiqeni foton dhe zmadhojeni. Ajo që mbetet brenda kornizës do të shfaqet në faqe.</p>
        <div className="cropper-area">
          {src && (
            <Cropper
              image={src}
              crop={crop}
              zoom={zoom}
              aspect={PHOTO_ASPECT}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>
        <label className="cropper-zoom">
          Zmadhimi
          <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        {error && <p className="admin-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="button" className="btn btn-primary" disabled={working || !area} onClick={confirm}>
            {working ? 'Duke u përgatitur…' : 'Përdore këtë pjesë'}
          </button>
          <button type="button" className="btn btn-outline" disabled={working} onClick={onCancel}>
            Anulo
          </button>
        </div>
      </div>
    </div>
  );
}
