import React from 'react';

const Prescriptions: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Prescriptions</h1>
      <p className="text-muted-foreground">Your active and past prescriptions will appear here.</p>
      <div className="p-4 rounded-md border bg-card">
        <p className="text-sm">No prescriptions yet.</p>
      </div>
    </div>
  );
};

export default Prescriptions;
