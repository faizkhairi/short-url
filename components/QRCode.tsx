'use client';

import { QRCode } from 'react-qrcode-logo';

export default function QRCodeDisplay({ value }: { value: string }) {
  return (
    <div className="inline-block rounded-lg bg-white p-2">
      <QRCode
        value={value}
        size={150}
        bgColor="#ffffff"
        fgColor="#18181b"
        qrStyle="dots"
        eyeRadius={5}
      />
    </div>
  );
}
