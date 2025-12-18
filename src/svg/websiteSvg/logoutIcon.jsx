import React from 'react';

function LogoutIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.00049 14H3.33382C2.9802 14 2.64106 13.8595 2.39101 13.6095C2.14096 13.3594 2.00049 13.0203 2.00049 12.6667V3.33333C2.00049 2.97971 2.14096 2.64057 2.39101 2.39052C2.64106 2.14048 2.9802 2 3.33382 2H6.00049M10.6672 11.3333L14.0005 8M14.0005 8L10.6672 4.66667M14.0005 8H6.00049"
        stroke="#5A5E67"
        strokeWidth="1.336"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default LogoutIcon;


