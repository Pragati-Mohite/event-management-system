import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function EventDetails() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900">Event Details</h1>
        <p className="mt-4 text-gray-600">Event ID: {id}</p>
        <p className="text-sm text-gray-500 mt-2">This page is under construction.</p>
      </div>
    </div>
  );
}
