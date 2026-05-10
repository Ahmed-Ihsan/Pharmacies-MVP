import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loading from './components/common/Loading';

const Layout = lazy(() => import('./components/layout/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
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
const DosageFormList = lazy(() => import('./pages/dosage-forms/DosageFormList'));
const SearchResults = lazy(() => import('./pages/search/SearchResults'));
const InventoryList = lazy(() => import('./pages/inventory/InventoryList'));
const POSPage = lazy(() => import('./pages/pos/POSPage'));
const SalesHistory = lazy(() => import('./pages/sales/SalesHistory'));
const SaleDetail = lazy(() => import('./pages/sales/SaleDetail'));
const SaleReturns = lazy(() => import('./pages/sales/SaleReturns'));
const AlternativesList = lazy(() => import('./pages/alternatives/AlternativesList'));
const PricesList = lazy(() => import('./pages/prices/PricesList'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Dashboard /></Suspense> },

      // Generics
      { path: 'generics', element: <Suspense fallback={<Loading />}><GenericList /></Suspense> },
      { path: 'generics/new', element: <Suspense fallback={<Loading />}><GenericFormPage /></Suspense> },
      { path: 'generics/:id', element: <Suspense fallback={<Loading />}><GenericDetail /></Suspense> },
      { path: 'generics/:id/edit', element: <Suspense fallback={<Loading />}><GenericFormPage /></Suspense> },

      // Brands
      { path: 'brands', element: <Suspense fallback={<Loading />}><BrandList /></Suspense> },
      { path: 'brands/new', element: <Suspense fallback={<Loading />}><BrandFormPage /></Suspense> },
      { path: 'brands/:id', element: <Suspense fallback={<Loading />}><BrandDetail /></Suspense> },
      { path: 'brands/:id/edit', element: <Suspense fallback={<Loading />}><BrandFormPage /></Suspense> },

      // Manufacturers
      { path: 'manufacturers', element: <Suspense fallback={<Loading />}><ManufacturerList /></Suspense> },
      { path: 'manufacturers/new', element: <Suspense fallback={<Loading />}><ManufacturerFormPage /></Suspense> },
      { path: 'manufacturers/:id', element: <Suspense fallback={<Loading />}><ManufacturerDetail /></Suspense> },
      { path: 'manufacturers/:id/edit', element: <Suspense fallback={<Loading />}><ManufacturerFormPage /></Suspense> },

      // Therapeutic Classes
      { path: 'therapeutic-classes', element: <Suspense fallback={<Loading />}><TherapeuticClassList /></Suspense> },

      // Dosage Forms
      { path: 'dosage-forms', element: <Suspense fallback={<Loading />}><DosageFormList /></Suspense> },

      // Search
      { path: 'search', element: <Suspense fallback={<Loading />}><SearchResults /></Suspense> },

      // Inventory
      { path: 'inventory', element: <Suspense fallback={<Loading />}><InventoryList /></Suspense> },

      // POS & Sales
      { path: 'pos', element: <Suspense fallback={<Loading />}><POSPage /></Suspense> },
      { path: 'sales/history', element: <Suspense fallback={<Loading />}><SalesHistory /></Suspense> },
      { path: 'sales/returns', element: <Suspense fallback={<Loading />}><SaleReturns /></Suspense> },
      { path: 'sales/:id', element: <Suspense fallback={<Loading />}><SaleDetail /></Suspense> },

      // Alternatives & Prices
      { path: 'alternatives', element: <Suspense fallback={<Loading />}><AlternativesList /></Suspense> },
      { path: 'prices', element: <Suspense fallback={<Loading />}><PricesList /></Suspense> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
