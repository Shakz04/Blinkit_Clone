import { fail, text, number, image, images, id } from './validation.js';

export function productData(body, existing) {
  if (typeof body.inStock !== 'boolean') fail('Choose product availability');
  const variants = body.variants || [];
  if (!Array.isArray(variants) || variants.length > 12) fail('Use up to 12 product options');
  const labels = new Set();
  const options = variants.map(option => {
    const label = text(option.label, 'option label', 60, true);
    if (labels.has(label.toLowerCase())) fail('Product option labels must be different');
    labels.add(label.toLowerCase());
    if (option._id && (!existing || !existing.variants.id(id(option._id)))) fail('Invalid product option');
    return {
      ...(option._id ? { _id: option._id } : {}),
      label,
      price: number(option.price, 'option price', 0.01),
      stock: number(option.stock, 'option stock', 0, 1000000, true),
    };
  });
  const price = options.length ? Math.min(...options.map(option => option.price)) : number(body.price, 'price', 0.01);
  const originalPrice = body.originalPrice == null || body.originalPrice === '' ? undefined : number(body.originalPrice, 'original price', price);
  const gallery = images(body.images || []);
  return {
    name: text(body.name, 'product name', 150, true),
    category: text(body.category, 'category', 80, true),
    description: text(body.description, 'description', 4000),
    brand: text(body.brand, 'brand', 80),
    ingredients: text(body.ingredients, 'ingredients', 2000),
    nutrition: text(body.nutrition, 'nutrition', 2000),
    image: gallery[0] || image(body.image) || undefined,
    images: gallery,
    price, originalPrice,
    discount: originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0,
    unit: options[0]?.label || text(body.unit || '1 pc', 'unit', 60, true),
    stock: options.length ? options.reduce((sum, option) => sum + option.stock, 0) : number(body.stock, 'stock quantity', 0, 1000000, true),
    variants: options,
    inStock: body.inStock,
  };
}
export function selection(product, variantId = '') {
  if (!product || product.archived) fail('This product is no longer available', 409);
  if (!product.inStock) fail(product.name + ' is unavailable', 409);
  const variant = product.variants?.length ? product.variants.find(item => String(item._id) === String(variantId)) : null;
  if (product.variants?.length && !variant) fail('Choose an available option for ' + product.name);
  if (!product.variants?.length && variantId) fail('This product option is no longer available', 409);
  return { variantId: variant ? String(variant._id) : '', price: variant?.price ?? product.price, unit: variant?.label || product.unit, stock: variant ? variant.stock : product.stock };
}
export function available(product) {
  return !product.archived && product.inStock && (product.variants?.length ? product.variants.some(item => item.stock > 0) : product.stock == null || product.stock > 0);
}
export function present(product) {
  const data = product.toObject ? product.toObject() : product;
  return { ...data, available: available(data) };
}
