import { useState } from 'react';

export default function ImagePicker({ value, onChange, max = 6, label = 'Product photos' }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const addFiles = async event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    setError('');
    if (files.length + value.length > max) return setError('Choose up to ' + max + ' images.');
    if (files.some(file => !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 500 * 1024)) return setError('Use PNG, JPEG or WebP files under 500 KB each.');
    setBusy(true);
    try {
      const added = await Promise.all(files.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read this image.'));
        reader.readAsDataURL(file);
      })));
      onChange([...value, ...added]);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const addUrl = () => {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
      if (value.length >= max) return setError('Remove an image before adding another.');
      onChange([...value, url.trim()]);
      setUrl(''); setError('');
    } catch { setError('Enter a valid http or https image URL.'); }
  };
  return <fieldset className="image-picker">
    <legend>{label}</legend>
    <div className="image-previews">{value.map((src, index) => <div key={index}><img src={src} alt={label + ' ' + (index + 1)} /><button type="button" className="image-remove" aria-label={'Remove image ' + (index + 1)} onClick={() => onChange(value.filter((_, i) => index !== i))}>×</button></div>)}</div>
    <label className="upload-label">Upload images<input type="file" accept="image/png,image/jpeg,image/webp" multiple={max > 1} disabled={busy || value.length >= max} onChange={addFiles} /></label>
    <div className="inline-fields"><input aria-label={label + ' URL'} type="url" placeholder="Or paste an image URL" value={url} onChange={event => setUrl(event.target.value)} /><button type="button" className="button secondary" onClick={addUrl} disabled={!url.trim() || value.length >= max}>Add URL</button></div>
    <small>PNG, JPEG or WebP · 500 KB per image · Up to {max}</small>
    {busy && <p role="status">Reading images...</p>}{error && <p className="notice error" role="alert">{error}</p>}
  </fieldset>;
}
