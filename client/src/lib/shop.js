export const currency = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value || 0);
export const sellerName = seller => seller?.sellerProfile?.name || seller?.name || 'FreshDash';
export const itemKey = item => (item.product?._id || item.product) + ':' + (item.variantId || '');
export function itemOption(item) {
  const product = item.product;
  const variant = product?.variants?.find(option => option._id === item.variantId);
  const invalid = product?.variants?.length ? !variant : Boolean(item.variantId);
  const stock = variant ? variant.stock : product?.stock;
  return {
    price: variant?.price ?? product?.price ?? 0,
    unit: variant?.label || product?.unit,
    stock,
    available: Boolean(product && !product.archived && product.inStock && !invalid && (stock == null || stock >= item.quantity)),
  };
}
export const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
export const statusLabels = { confirmed: 'Confirmed', preparing: 'Preparing', out_for_delivery: 'Out for delivery', delivered: 'Delivered', unavailable: 'Awaiting an update' };
export const dateTime = value => value ? new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
