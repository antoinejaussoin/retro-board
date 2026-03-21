import React from 'react';

export default function ErrorPage({ statusCode }: { statusCode: number }) {
  return <div>HTTP {statusCode}</div>;
}