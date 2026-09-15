export default function AddressFields({ value, onChange, saved = false }) {
  const field = (name, label, options = {}) => <label key={name} className={name === 'address' ? 'span-full' : ''}>{label}<input required value={value[name] || ''} onChange={event => onChange({ ...value, [name]: event.target.value })} {...options} /></label>;
  return <div className="address-fields">
    {saved && field('label', 'Address label', { maxLength: 30, placeholder: 'Home, Work...' })}
    {field('name', 'Recipient name', { autoComplete: 'name', maxLength: 100 })}
    {field('phone', 'Mobile number', { type: 'tel', pattern: '[6-9][0-9]{9}', title: '10-digit Indian mobile number', autoComplete: 'tel', maxLength: 10 })}
    {field('address', 'House, building and street', { autoComplete: 'street-address', maxLength: 300 })}
    {field('city', 'City', { autoComplete: 'address-level2', maxLength: 100 })}
    {field('pincode', 'Pincode', { inputMode: 'numeric', pattern: '[1-9][0-9]{5}', title: '6-digit pincode', autoComplete: 'postal-code', maxLength: 6 })}
    {saved && <label className="checkbox-label span-full"><input type="checkbox" checked={Boolean(value.isDefault)} onChange={event => onChange({ ...value, isDefault: event.target.checked })} />Use as default address</label>}
  </div>;
}
