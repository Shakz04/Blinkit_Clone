import { useEffect, useState, useCallback } from 'react';
import { getOrders } from '../api';
import { useCart } from '../context/CartContext';

export default function useOrders() {
  const { sessionId, loading: cartLoading } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    try { setOrders(await getOrders(sessionId)); setError(''); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, [sessionId]);
  useEffect(() => {
    if (cartLoading) return;
    let active = true;
    const load = () => getOrders(sessionId).then(data => { if (active) { setOrders(data); setError(''); } })
      .catch(err => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    load();
    const timer = setInterval(load, 15000);
    return () => { active = false; clearInterval(timer); };
  }, [sessionId, cartLoading]);
  return { orders, loading: loading || cartLoading, error, refresh };
}
