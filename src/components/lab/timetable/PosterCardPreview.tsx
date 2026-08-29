import React from 'react';
import { getAutoIconForSubject } from '../../../services/timetableAiService';

export interface PosterSubject {
  id?: number | string;
  name: string;
  teacher_code?: string;
  color?: 'blue' | 'green';
  icon_type?: string;
  icon?: string;
}

export interface PosterCardProps {
  batchName: string;
  title: string;
  date: string;
  time: string;
  aptExam?: string;
  extraNote?: string;
  phone1?: string;
  phone2?: string;
  subjects: PosterSubject[];
  id?: string;
}

/**
 * Pixel-perfect SVG Vector Icon Renderer for Timetable Poster Cards.
 * Ensures razor-sharp centered rendering with zero font ligature / baseline drift during PNG export.
 */
export const PosterCardIcon: React.FC<{
  name: string;
  type?: string;
  size?: number;
  color?: string;
}> = ({ name, type, size = 24, color = 'currentColor' }) => {
  if (type === 'math') {
    return (
      <span
        style={{
          fontFamily: "'Times New Roman', serif",
          fontStyle: 'italic',
          fontSize: `${size * 1.1}px`,
          fontWeight: 700,
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color
        }}
      >
        &radic;x
      </span>
    );
  }

  const iconName = (name || '').toLowerCase();

  // 1. Chemistry (Flask / Science)
  if (iconName === 'science' || iconName.includes('chem')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M19.8 18.4L14 9V4h1V2H9v2h1v5l-5.8 9.4C3.4 19.8 4.4 22 6.2 22h11.6c1.8 0 2.8-2.2 2-3.6zM7 19l3.5-5.6h3L17 19H7z" />
      </svg>
    );
  }

  // 2. Physics (Particles / Grain / Atom)
  if (iconName === 'grain' || iconName.includes('phys')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="20" r="2" />
        <circle cx="4" cy="12" r="2" />
        <circle cx="20" cy="12" r="2" />
        <circle cx="6.34" cy="6.34" r="1.6" />
        <circle cx="17.66" cy="17.66" r="1.6" />
        <circle cx="6.34" cy="17.66" r="1.6" />
        <circle cx="17.66" cy="6.34" r="1.6" />
      </svg>
    );
  }

  // 3. Botany (Leaf / Plant)
  if (iconName === 'psychiatry' || iconName.includes('botan') || iconName === 'eco') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 0 17 8zm-7.46 9.38A14.28 14.28 0 0 1 12 11c3.5 0 6.5 1.5 8 4-2.5 1-5.5 1.5-8 1.5a13.3 13.3 0 0 1-2.46-.12z" />
      </svg>
    );
  }

  // 4. Zoology (Paw / Animal)
  if (iconName === 'pets' || iconName.includes('zoo') || iconName.includes('bio')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <circle cx="4.5" cy="9.5" r="2.2" />
        <circle cx="9" cy="5.5" r="2.2" />
        <circle cx="15" cy="5.5" r="2.2" />
        <circle cx="19.5" cy="9.5" r="2.2" />
        <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.49-.97-.66-2.07-.97-3.86-.97s-2.89.31-3.86.97c-.88.6-1.61 1.47-2.48 2.49-1.25 1.48-1.74 3.01-.98 4.28.84 1.41 2.91 1.86 5.32 1.86s4.48-.45 5.32-1.86c.76-1.27.27-2.8-.98-4.28z" />
      </svg>
    );
  }

  // 5. Computer Science (Terminal / Code)
  if (iconName === 'terminal' || iconName.includes('comp') || iconName.includes('cs')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-12.5-8.5l3.5 3.5-3.5 3.5L6 14l2-2-2-2 1.5-1.5zM12 16h6v2h-6v-2z" />
      </svg>
    );
  }

  // 6. Calendar
  if (iconName === 'calendar_month' || iconName.includes('calendar')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
      </svg>
    );
  }

  // 7. Clock / Time (Schedule)
  if (iconName === 'schedule' || iconName.includes('time') || iconName.includes('clock')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
      </svg>
    );
  }

  // 8. Phone / Call
  if (iconName === 'call' || iconName.includes('phone')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.053 15.053 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1.01A11.36 11.36 0 0 1 8.5 3.99c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1.11z" />
      </svg>
    );
  }

  // 9. Book (English / General)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: 'block' }}>
      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11z" />
    </svg>
  );
};

export const PosterCardPreview: React.FC<PosterCardProps> = ({
  batchName,
  title,
  date,
  time,
  aptExam,
  extraNote,
  phone1 = '9072651666',
  phone2 = '9072652666',
  subjects = [],
  id = 'timetable-poster-card'
}) => {
  const effectiveTitle = title || (batchName ? `${batchName.toUpperCase()} - TIME TABLE` : 'AIMS PLUS - TIME TABLE');

  return (
    <div
      id={id}
      style={{
        width: '480px',
        minWidth: '480px',
        maxWidth: '480px',
        backgroundColor: '#ffffff',
        borderRadius: '0px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'none',
        fontFamily: "'Montserrat', sans-serif",
        boxSizing: 'border-box'
      }}
      className="select-none"
    >
      {/* Top Left Curved Accent Wave */}
      <div
        style={{
          position: 'absolute',
          top: '-30px',
          left: '-50px',
          width: '160px',
          height: '220px',
          background: 'linear-gradient(135deg, #062e5b 45%, #78b82a 46%, #78b82a 58%, transparent 59%)',
          borderRadius: '50%',
          zIndex: 1,
          pointerEvents: 'none'
        }}
      />

      {/* Top Right Dot Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          top: '15px',
          right: '18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 5px)',
          gap: '6px',
          zIndex: 1
        }}
      >
        {Array.from({ length: 16 }).map((_, i) => (
          <span key={i} style={{ width: '4px', height: '4px', backgroundColor: '#89a4c7', borderRadius: '50%', display: 'inline-block' }} />
        ))}
      </div>

      {/* Bottom Left Dot Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          bottom: '70px',
          left: '10px',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 4px)',
          gap: '5px',
          opacity: 0.5,
          zIndex: 1
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} style={{ width: '4px', height: '4px', backgroundColor: '#89a4c7', borderRadius: '50%', display: 'inline-block' }} />
        ))}
      </div>

      {/* Main Content Area */}
      <div style={{ width: '100%', padding: '24px 28px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
        {/* Logo */}
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <img
            src="/logo0.png"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo01.png';
            }}
            alt="AIMS PLUS"
            style={{ height: '110px', width: 'auto', maxWidth: '210px', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Title Banner with Sparkles */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '6px', marginBottom: '12px' }}>
          {/* Sparkle Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '14px', height: '3px', backgroundColor: '#78b82a', borderRadius: '0px', transform: 'rotate(-25deg)' }} />
            <div style={{ width: '18px', height: '3px', backgroundColor: '#78b82a', borderRadius: '0px' }} />
            <div style={{ width: '12px', height: '3px', backgroundColor: '#78b82a', borderRadius: '0px', transform: 'rotate(25deg)' }} />
          </div>

          {/* Banner Box */}
          <div
            style={{
              background: '#062e5b',
              color: '#ffffff',
              padding: '7px 18px',
              borderRadius: '0px',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: '1px solid rgba(255, 215, 0, 0.6)',
              boxShadow: '0 3px 8px rgba(6, 46, 91, 0.3)',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '2px',
                border: '1px dashed rgba(255, 255, 255, 0.4)',
                borderRadius: '0px',
                pointerEvents: 'none'
              }}
            />
            {effectiveTitle}
          </div>

          {/* Sparkle Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ width: '14px', height: '3px', backgroundColor: '#062e5b', borderRadius: '0px', transform: 'rotate(25deg)' }} />
            <div style={{ width: '18px', height: '3px', backgroundColor: '#062e5b', borderRadius: '0px' }} />
            <div style={{ width: '12px', height: '3px', backgroundColor: '#062e5b', borderRadius: '0px', transform: 'rotate(-25deg)' }} />
          </div>
        </div>

        {/* Date Row with dashed ribbons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginBottom: '12px' }}>
          <div style={{ flex: 1, height: '1.5px', borderTop: '1.5px dashed #062e5b', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-3.5px', left: 0, width: '6px', height: '6px', backgroundColor: '#062e5b', borderRadius: '0px' }} />
          </div>

          <div
            style={{
              backgroundColor: '#a3da49',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px 4px 6px',
              borderRadius: '0px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div
              style={{
                backgroundColor: '#062e5b',
                color: '#ffffff',
                width: '26px',
                height: '26px',
                borderRadius: '0px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PosterCardIcon name="calendar_month" size={16} color="#ffffff" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#062e5b', letterSpacing: '1.5px' }}>
              {date}
            </span>
          </div>

          <div style={{ flex: 1, height: '1.5px', borderTop: '1.5px dashed #062e5b', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-3.5px', right: 0, width: '6px', height: '6px', backgroundColor: '#062e5b', borderRadius: '0px' }} />
          </div>
        </div>

        {/* Books Divider Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '14px',
            width: '90%',
            borderBottom: '1.5px solid #d0d8e2',
            paddingBottom: '6px'
          }}
        >
          {Array.from({ length: 9 }).map((_, idx) => (
            <PosterCardIcon
              key={idx}
              name="menu_book"
              size={18}
              color={idx % 2 === 0 ? '#0d427d' : '#78b82a'}
            />
          ))}
        </div>

        {/* Schedule Subjects List */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '14px' }}>
          {subjects.map((item, idx) => {
            const isBlue = (item.color || (idx % 2 === 0 ? 'blue' : 'green')) === 'blue';
            const themeColor = isBlue ? '#062e5b' : '#78b82a';
            const teacherText = item.teacher_code
              ? (item.teacher_code.startsWith('(') ? item.teacher_code : `(${item.teacher_code})`)
              : '';

            const autoIcon = getAutoIconForSubject(item.name);
            const iconType = item.icon_type || autoIcon.icon_type;
            const iconName = item.icon || autoIcon.icon;

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '0px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  border: `2px solid ${themeColor}`
                }}
              >
                {/* Icon Box */}
                <div
                  style={{
                    width: '58px',
                    minWidth: '58px',
                    height: '44px',
                    backgroundColor: themeColor,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 800
                  }}
                >
                  <PosterCardIcon
                    name={iconName}
                    type={iconType}
                    size={24}
                    color="#ffffff"
                  />
                </div>

                {/* Details */}
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: 900,
                      color: '#062e5b',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  >
                    {item.name}
                  </span>
                  {teacherText && (
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#062e5b' }}>
                      {teacherText}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Timing Section */}
        {time && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px', width: '100%' }}>
            <PosterCardIcon name="schedule" size={26} color="#062e5b" />
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span
                style={{
                  backgroundColor: '#062e5b',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '0px',
                  marginRight: '10px'
                }}
              >
                Time:
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#5c921c', letterSpacing: '0.5px' }}>
                {time}
              </span>
            </div>
          </div>
        )}

        {/* APT Exam Banner */}
        {aptExam && (
          <div
            style={{
              backgroundColor: '#062e5b',
              color: '#ffffff',
              borderRadius: '0px',
              padding: '5px 22px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 6px rgba(6, 46, 91, 0.25)',
              marginBottom: '10px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              textAlign: 'center'
            }}
          >
            <span style={{ color: '#f8c200', fontWeight: 800 }}>APT Exam :</span>
            <span>{aptExam}</span>
          </div>
        )}

        {/* Extra Note / Improvement Exam Banner */}
        {extraNote && (
          <div
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              borderRadius: '0px',
              padding: '5px 20px',
              fontSize: '13.5px',
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 3px 8px rgba(220, 38, 38, 0.35)',
              marginBottom: '12px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              textAlign: 'center'
            }}
          >
            <span style={{ color: '#f8c200', fontSize: '14px' }}>★</span>
            <span>{extraNote}</span>
            <span style={{ color: '#f8c200', fontSize: '14px' }}>★</span>
          </div>
        )}

        {/* Section Divider */}
        <div style={{ width: '90%', height: '1px', backgroundColor: '#c5d3e3', position: 'relative', marginBottom: '12px' }}>
          <div
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: '#062e5b',
              borderRadius: '0px',
              position: 'absolute',
              top: '-2.5px',
              left: '50%',
              transform: 'translateX(-50%)'
            }}
          />
        </div>

        {/* Contact Phone Numbers */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '16px', zIndex: 3 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: '#78b82a',
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 8px rgba(120, 184, 42, 0.4)'
            }}
          >
            <PosterCardIcon name="call" size={22} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {phone1 && (
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#062e5b', letterSpacing: '1.2px', lineHeight: 1.15 }}>
                {phone1}
              </span>
            )}
            {phone2 && (
              <span style={{ fontSize: '19px', fontWeight: 800, color: '#062e5b', letterSpacing: '1.2px', lineHeight: 1.15 }}>
                {phone2}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Wave Banner */}
      <div style={{ width: '100%', position: 'relative', marginTop: 'auto' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#062e5b',
            padding: '16px 20px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-12px',
              left: '0',
              right: '0',
              height: '14px',
              background: 'linear-gradient(to right, #78b82a 0%, #a3da49 50%, #78b82a 100%)',
              clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)'
            }}
          />
          <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            AIMS EDUCATION · MEDICAL &amp; ENGINEERING
          </span>
        </div>
      </div>
    </div>
  );
};
