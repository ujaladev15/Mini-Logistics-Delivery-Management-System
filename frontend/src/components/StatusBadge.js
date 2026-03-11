import React from 'react';

const icons = { pending: '○', assigned: '◑', picked: '◕', delivered: '●' };

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {icons[status] || '○'} {status}
    </span>
  );
}
