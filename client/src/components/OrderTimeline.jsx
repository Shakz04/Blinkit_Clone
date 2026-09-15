import { statuses, statusLabels, dateTime } from '../lib/shop';

export default function OrderTimeline({ fulfillment }) {
  const index = statuses.indexOf(fulfillment.status);
  return <ol className="order-timeline">{statuses.map((status, i) => {
    const event = fulfillment.history?.find(entry => entry.status === status);
    return <li key={status} className={i <= index ? 'complete' : ''} aria-current={i === index ? 'step' : undefined}><span className="timeline-dot" aria-hidden="true">{i < index ? '✓' : i + 1}</span><strong>{statusLabels[status]}</strong><small>{event ? dateTime(event.at) : 'Pending'}</small></li>;
  })}</ol>;
}
