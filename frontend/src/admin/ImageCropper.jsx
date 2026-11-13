import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';

// The only two public gallery formats. Keep in sync with backend/gallery-media.js.
export const FORMATS = {
  portrait: { label: 'Portret 4:5', aspect: 4 / 5, minW: 900, minH: 1125 },
  landscape: { label: 'Horizontale 4:3', aspect: 4 / 3, minW: 1200, minH: 900 }
};

export const LOW_RES_MSG = 'Fotoja ka rezolucion shumë të ulët. Ju lutem ngarkoni një foto me cilësi më të lartë.';
export const LOW_RES_MSG_EN = 'The image resolution is too low. Please upload a higher-quality image.';

/** True when the source can produce this format's minimum crop without upscaling. */
export function formatAllowed(width, height, key) {
  const { aspect, minW, minH } = FORMATS[key];
  const w = Math.min(width, height * aspect); // largest crop of this aspect inside the photo
  return w >= minW && w / aspect >= minH;
}

/**
 * Fixed-frame cropper. The Admin picks Portrait 4:5 or Landscape 4:3 (the
 * natural orientation is preselected), repositions the photo inside the frame,
 * and confirms. There is no zoom control: the frame always shows the photo
 * at its natural scale. The crop is returned as fractions of the photo; the
 * server does the final crop and resize.
 */
export default function ImageCropper({ file, onCancel, onDone }) {
  const [src, setSrc] = useState('');
  const [natural, setNatural] = useState(null);
  const [format, setFormat] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [area, setArea] = useState(null);
  const [error, setError] = useState('');
  const [errorEn, setErrorEn] = useState('');
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setNatural({ w, h });
      const portraitOk = formatAllowed(w, h, 'portrait');
      const landscapeOk = formatAllowed(w, h, 'landscape');
      if (!portraitOk && !landscapeOk) {
        setError(LOW_RES_MSG);
        setErrorEn(LOW_RES_MSG_EN);
        setFormat(null);
        return;
      }
      const preferred = w > h ? 'landscape' : 'portrait';
      setFormat(formatAllowed(w, h, preferred) ? preferred : preferred === 'portrait' ? 'landscape' : 'portrait');
    };
    img.onerror = () => setError('Fotoja nuk u lexua. Provoni një foto tjetër.');
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function chooseFormat(key) {
    if (!natural || !formatAllowed(natural.w, natural.h, key)) return;
    setFormat(key);
    setCrop({ x: 0, y: 0 });
    setArea(null);
    setError('');
    setErrorEn('');
  }

  function confirm() {
    if (!area || !format || !natural) return;
    // react-easy-crop reports percentages of the photo; convert to fractions for the server.
    const fractions = { x: area.x / 100, y: area.y / 100, w: area.width / 100, h: area.height / 100 };
    const pxW = fractions.w * natural.w;
    const pxH = fractions.h * natural.h;
    const { minW, minH } = FORMATS[format];
    if (pxW < minW || pxH < minH) {
      setError(LOW_RES_MSG);
      setErrorEn(LOW_RES_MSG_EN);
      return;
    }
    setWorking(true);
    onDone({ format, crop: fractions });
  }

  return (
    <div className="cropper-backdrop" role="dialog" aria-modal="true" aria-label="Prerja e fotos">
      <div className="cropper-dialog">
        <h2>Zgjidhni formatin dhe pjesën</h2>
        <div className="cropper-formats" role="group" aria-label="Formati i fotos">
          {Object.entries(FORMATS).map(([key, f]) => {
            const allowed = natural ? formatAllowed(natural.w, natural.h, key) : false;
            return (
              <button
                key={key}
                type="button"
                className={format === key ? 'btn btn-primary' : 'btn btn-outline'}
                aria-pressed={format === key}
                disabled={!allowed || working}
                onClick={() => chooseFormat(key)}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <p className="admin-hint">Tërhiqeni foton brenda kornizës. Pjesa e dukshme do të shfaqet në faqe.</p>
        <div className="cropper-area">
          {src && format && (
            <Cropper
              image={src}
              crop={crop}
              zoom={1}
              minZoom={1}
              maxZoom={1}
              aspect={FORMATS[format].aspect}
              onCropChange={setCrop}
              onCropComplete={(_, pixels) => setArea(pixels)}
            />
          )}
        </div>
        {error && (
          <p className="admin-error">
            {error}
            {errorEn && <><br />{errorEn}</>}
          </p>
        )}
        <div className="admin-form-actions">
          <button type="button" className="btn btn-primary" disabled={working || !area || !format} onClick={confirm}>
            {working ? 'Duke u ngarkuar…' : 'Përdore këtë pjesë'}
          </button>
          <button type="button" className="btn btn-outline" disabled={working} onClick={onCancel}>
            Anulo
          </button>
        </div>
      </div>
    </div>
  );
}
