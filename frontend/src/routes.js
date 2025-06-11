// src/routes.jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App';


const AssetManager = lazy(() => import('./components/equipmentTracker'));
const UserManagement = lazy(() => import('./components/usermanagement'));
const TrafficAnalysis = lazy(() => import('./components/TrafficAnalysis'));
const FieldReport = lazy(() => import('./components/fieldReport'));
const Portal = lazy(() => import('./components/portal'));
const RoadHealthPredictor = lazy(() => import('./components/RoadHealthPredictor'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // errorElement: <ErrorPage />,
    children: [
      {
        path: 'portal',
        element: <Suspense fallback={<div>Loading Portal...</div>}><Portal /></Suspense>,
        children: [
          {
            path: 'equipment',
            element: <Suspense fallback={<div>Loading Asset Manager...</div>}><AssetManager /></Suspense>,
          },
          {
            path: 'users',
            element: <Suspense fallback={<div>Loading User Management...</div>}><UserManagement /></Suspense>,
          },
        ],
      },
      {
        path: 'traffic',
        element: <Suspense fallback={<div>Loading Traffic Analysis...</div>}><TrafficAnalysis /></Suspense>,
      },
      {
        path: 'report',
        element: <Suspense fallback={<div>Loading Field Report...</div>}><FieldReport /></Suspense>,
      },
      {
        path: 'predictor',
        element: <Suspense fallback={<div>Loading Road Health Predictor...</div>}><RoadHealthPredictor /></Suspense>,
      },
    ],
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
