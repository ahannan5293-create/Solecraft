'use client';

import React, { useEffect } from 'react';

// Tell TypeScript about the <model-viewer> custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

interface ModelViewerProps {
  src: string;
}

const ModelViewerElement = 'model-viewer' as any;

export default function ModelViewer({ src }: ModelViewerProps) {
  useEffect(() => {
    // Dynamically import the model-viewer component only on the client
    import('@google/model-viewer').catch(console.error);
  }, []);

  return (
    <div className="w-full h-full relative" suppressHydrationWarning>
      <ModelViewerElement
        src={src}
        camera-controls
        auto-rotate
        style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        alt="A 3D model of a shoe"
      />
    </div>
  );
}
