import { Link } from 'react-router-dom';
import { sellerName } from '../lib/shop';

export default function StoreBadge({ seller }) {
  const name = sellerName(seller);
  const content = <>{seller?.sellerProfile?.logo ? <img src={seller.sellerProfile.logo} alt="" className="store-logo small" /> : <span className="store-initial" aria-hidden="true">{name[0]}</span>}<span>{name}</span></>;
  return seller?._id ? <Link className="store-badge" to={'/stores/' + seller._id} aria-label={'Shop all products from ' + name}>{content}</Link> : <span className="store-badge">{content}</span>;
}
