'use client'

import  Sidebar  from "@/components/sidebar";

const page = () => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      <Sidebar />
      <main style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>center content</div>
      </main>
    </div>
  );
};

export default page;
