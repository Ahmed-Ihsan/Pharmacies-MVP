import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Loading from './components/common/Loading';

// Lazy loaded pages
const GenericList = lazy(() => import('./pages/generics/GenericList'));
const GenericDetail = lazy(() => import('./pages/generics/GenericDetail'));
const GenericFormPage = lazy(() => import('./pages/generics/GenericFormPage'));

const BrandList = lazy(() => import('./pages/brands/BrandList'));
const BrandDetail = lazy(() => import('./pages/brands/BrandDetail'));
const BrandFormPage = lazy(() => import('./pages/brands/BrandFormPage'));

const ManufacturerList = lazy(() => import('./pages/manufacturers/ManufacturerList'));
const ManufacturerDetail = lazy(() => import('./pages/manufacturers/ManufacturerDetail'));
const ManufacturerFormPage = lazy(() => import('./pages/manufacturers/ManufacturerFormPage'));

const TherapeuticClassList = lazy(() => import('./pages/therapeutic-classes/TherapeuticClassList'));
const TherapeuticClassDetail = lazy(() => import('./pages/therapeutic-classes/TherapeuticClassDetail'));
const TherapeuticClassFormPage = lazy(() => import('./pages/therapeutic-classes/TherapeuticClassFormPage'));

const DosageFormList = lazy(() => import('./pages/dosage-forms/DosageFormList'));
const DosageFormDetail = lazy(() => import('./pages/dosage-forms/DosageFormDetail'));
const DosageFormFormPage = lazy(() => import('./pages/dosage-forms/DosageFormFormPage'));

const AlternativeList = lazy(() => import('./pages/alternatives/AlternativeList'));
const AlternativeFormPage = lazy(() => import('./pages/alternatives/AlternativeFormPage'));

const PriceList = lazy(() => import('./pages/prices/PriceList'));
const PriceFormPage = lazy(() => import('./pages/prices/PriceFormPage'));

const SearchResults = lazy(() => import('./pages/search/SearchResults'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },

      // Generics — uses: GET /generics/, GET /generics/{id}, GET /generics/{id}/alternatives, POST, PUT /generics/
      { path: 'generics', element: <Suspense fallback={<Loading />}><GenericList /></Suspense> },
      { path: 'generics/new', element: <Suspense fallback={<Loading />}><GenericFormPage /></Suspense> },
      { path: 'generics/:id', element: <Suspense fallback={<Loading />}><GenericDetail /></Suspense> },
      { path: 'generics/:id/edit', element: <Suspense fallback={<Loading />}><GenericFormPage /></Suspense> },

      // Brands — uses: GET /brands/, GET /brands/{id}, GET /brands/{id}/prices, GET /brands/by-ndc, GET /brands/by-barcode, POST, PUT, DELETE
      { path: 'brands', element: <Suspense fallback={<Loading />}><BrandList /></Suspense> },
      { path: 'brands/new', element: <Suspense fallback={<Loading />}><BrandFormPage /></Suspense> },
      { path: 'brands/:id', element: <Suspense fallback={<Loading />}><BrandDetail /></Suspense> },
      { path: 'brands/:id/edit', element: <Suspense fallback={<Loading />}><BrandFormPage /></Suspense> },

      // Manufacturers — uses: GET /manufacturers/, GET /manufacturers/{id}, POST, PUT, DELETE
      { path: 'manufacturers', element: <Suspense fallback={<Loading />}><ManufacturerList /></Suspense> },
      { path: 'manufacturers/new', element: <Suspense fallback={<Loading />}><ManufacturerFormPage /></Suspense> },
      { path: 'manufacturers/:id', element: <Suspense fallback={<Loading />}><ManufacturerDetail /></Suspense> },
      { path: 'manufacturers/:id/edit', element: <Suspense fallback={<Loading />}><ManufacturerFormPage /></Suspense> },

      // Therapeutic Classes — uses: GET /, GET /roots, GET /{id}/children, GET /{id}, POST, PUT, DELETE
      { path: 'therapeutic-classes', element: <Suspense fallback={<Loading />}><TherapeuticClassList /></Suspense> },
      { path: 'therapeutic-classes/new', element: <Suspense fallback={<Loading />}><TherapeuticClassFormPage /></Suspense> },
      { path: 'therapeutic-classes/:id', element: <Suspense fallback={<Loading />}><TherapeuticClassDetail /></Suspense> },
      { path: 'therapeutic-classes/:id/edit', element: <Suspense fallback={<Loading />}><TherapeuticClassFormPage /></Suspense> },

      // Dosage Forms — uses: GET /dosage-forms/, GET /{id}, POST, PUT, DELETE
      { path: 'dosage-forms', element: <Suspense fallback={<Loading />}><DosageFormList /></Suspense> },
      { path: 'dosage-forms/new', element: <Suspense fallback={<Loading />}><DosageFormFormPage /></Suspense> },
      { path: 'dosage-forms/:id', element: <Suspense fallback={<Loading />}><DosageFormDetail /></Suspense> },
      { path: 'dosage-forms/:id/edit', element: <Suspense fallback={<Loading />}><DosageFormFormPage /></Suspense> },

      // Alternatives — uses: GET /alternatives/, GET /{id}, POST, PUT, DELETE
      { path: 'alternatives', element: <Suspense fallback={<Loading />}><AlternativeList /></Suspense> },
      { path: 'alternatives/new', element: <Suspense fallback={<Loading />}><AlternativeFormPage /></Suspense> },
      { path: 'alternatives/:id/edit', element: <Suspense fallback={<Loading />}><AlternativeFormPage /></Suspense> },

      // Prices — uses: GET /prices/by-brand/{id}, GET /prices/active/{id}, GET /{id}, POST, PUT, DELETE
      { path: 'prices', element: <Suspense fallback={<Loading />}><PriceList /></Suspense> },
      { path: 'prices/new', element: <Suspense fallback={<Loading />}><PriceFormPage /></Suspense> },
      { path: 'prices/:id/edit', element: <Suspense fallback={<Loading />}><PriceFormPage /></Suspense> },

      // Search — uses: GET /brands/by-ndc/{ndc}, GET /brands/by-barcode/{barcode}, GET /generics/ + GET /brands/
      { path: 'search', element: <Suspense fallback={<Loading />}><SearchResults /></Suspense> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
