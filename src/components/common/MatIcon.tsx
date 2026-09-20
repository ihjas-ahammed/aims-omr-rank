import React from 'react';

export interface MatIconProps {
  name: string;
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
  title?: string;
}

export default function MatIcon({ name, className = '', size, style = {}, title }: MatIconProps) {
  const customStyle: React.CSSProperties = {
    ...style,
    ...(size ? { fontSize: typeof size === 'number' ? `${size}px` : size } : {})
  };

  return (
    <span
      className={`material-symbols-outlined select-none align-middle leading-none shrink-0 ${className}`}
      style={customStyle}
      title={title}
    >
      {name}
    </span>
  );
}
