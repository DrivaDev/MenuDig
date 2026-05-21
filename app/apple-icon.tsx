import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#FFF7ED',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
        }}
      >
        {/* Orange circle with QR icon */}
        <div
          style={{
            width: 120,
            height: 120,
            background: '#EA580C',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <rect x="3"  y="3"  width="7" height="7" rx="1" fill="white" />
            <rect x="3"  y="14" width="7" height="7" rx="1" fill="white" />
            <rect x="14" y="3"  width="7" height="7" rx="1" fill="white" />
            <rect x="14" y="14" width="3" height="3"          fill="white" />
            <rect x="19" y="14" width="2" height="2"          fill="white" />
            <rect x="14" y="19" width="2" height="2"          fill="white" />
            <rect x="18" y="19" width="3" height="2"          fill="white" />
          </svg>
        </div>
      </div>
    ),
    size,
  )
}
