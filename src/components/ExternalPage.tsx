import React from 'react';

interface ExternalPageProps {
  url: string;
}

const ExternalPage: React.FC<ExternalPageProps> = ({ url }) => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
};

export default ExternalPage;