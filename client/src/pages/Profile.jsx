import { useState } from 'react';
import Header from '../components/Header';
import AddressFields from '../components/AddressFields';
import { useAuth } from '../context/AuthContext';
import { updateProfile, saveAddress, deleteAddress } from '../api';

const blankAddress = { label: 'Home', name: '', phone: '', address: '', city: '', pincode: '', isDefault: false };
export default function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [address, setAddress] = useState({ ...blankAddress, name: user.name, phone: user.phone || '' });
  const [editing, setEditing] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const perform = async (type, action, success) => {
    setBusy(type); setError(''); setMessage('');
    try { setUser(await action()); setMessage(success); return true; }
    catch (err) { setError(err.message); return false; }
    finally { setBusy(''); }
  };
  const submitProfile = event => { event.preventDefault(); perform('profile', () => updateProfile(profile), 'Profile saved.'); };
  const submitAddress = async event => {
    event.preventDefault();
    if (await perform('address', () => saveAddress(address, editing), 'Address saved.')) { setEditing(''); setAddress({ ...blankAddress, name: user.name, phone: user.phone || '' }); }
  };
  return <><Header /><main className="container commerce-main"><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & addresses</h1><p className="muted">Your saved details, cart and orders stay with your account across devices.</p>
    {error && <p className="notice error" role="alert">{error}</p>}{message && <p className="notice success" role="status">{message}</p>}
    <div className="profile-layout">
      <form className="panel stack-form" onSubmit={submitProfile}><h2>Personal details</h2>
        <label>Full name<input required maxLength={100} value={profile.name} onChange={event => setProfile({ ...profile, name: event.target.value })} autoComplete="name" /></label>
        <label>Email address<input required type="email" value={profile.email} onChange={event => setProfile({ ...profile, email: event.target.value })} autoComplete="email" /></label>
        <label>Mobile number<input type="tel" maxLength={10} pattern="[6-9][0-9]{9}" value={profile.phone} onChange={event => setProfile({ ...profile, phone: event.target.value })} autoComplete="tel" /></label>
        <button className="button" disabled={Boolean(busy)}>{busy === 'profile' ? 'Saving...' : 'Save profile'}</button>
      </form>
      <section className="panel"><h2>Saved addresses</h2><div className="address-list">{user.addresses?.map(entry => <article className="address-card" key={entry._id}><div className="section-heading"><strong>{entry.label}</strong>{entry.isDefault && <span className="verified-badge">Default</span>}</div><p>{entry.name} · {entry.phone}<br />{entry.address}<br />{entry.city} – {entry.pincode}</p><div className="button-row"><button className="button secondary" disabled={Boolean(busy)} onClick={() => { setEditing(entry._id); setAddress(entry); }}>Edit</button><button className="button danger" disabled={Boolean(busy)} onClick={() => perform('delete', () => deleteAddress(entry._id), 'Address removed.')}>Remove</button>{!entry.isDefault && <button className="text-button" disabled={Boolean(busy)} onClick={() => perform('default', () => saveAddress({ ...entry, isDefault: true }, entry._id), 'Default address updated.')}>Make default</button>}</div></article>)}</div>{!user.addresses?.length && <p className="muted">Save an address for faster checkout.</p>}
        <form className="stack-form address-editor" onSubmit={submitAddress}><h3>{editing ? 'Edit address' : 'Add an address'}</h3><AddressFields saved value={address} onChange={setAddress} /><div className="button-row"><button className="button" disabled={Boolean(busy)}>{busy === 'address' ? 'Saving...' : editing ? 'Update address' : 'Save address'}</button>{editing && <button type="button" className="button secondary" onClick={() => { setEditing(''); setAddress({ ...blankAddress, name: user.name, phone: user.phone || '' }); }}>Cancel editing</button>}</div></form>
      </section>
    </div>
  </main></>;
}
