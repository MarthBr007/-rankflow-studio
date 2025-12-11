'use client';

import React from 'react';

export type ContentResultProps = {
  type: string;
  editedResult: any;
  onRefine?: () => void;
  isRefining?: boolean;
};

export default function ContentResult({ type, editedResult }: ContentResultProps) {
  return (
    <div className="result-container">
      <div className="result-section">
        <h3>{type ? `${type} resultaat` : 'Resultaat'}</h3>
        <pre
          style={{ fontSize: '0.9rem', background: '#f8f8f8', padding: '1rem', overflow: 'auto' }}
        >
          {JSON.stringify(editedResult, null, 2)}
        </pre>
      </div>
    </div>
  );
}
