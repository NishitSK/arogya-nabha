import React from 'react';

const LabResults: React.FC = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Lab Results</h1>
      <p className="text-muted-foreground">Your uploaded or fetched lab reports will appear here in future.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 border rounded bg-card h-32 flex items-center justify-center text-sm text-muted-foreground">No lab results yet.</div>
        <div className="p-4 border rounded bg-card h-32 flex items-center justify-center text-sm text-muted-foreground">Integrations coming soon.</div>
      </div>
    </div>
  );
};

export default LabResults;
