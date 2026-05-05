import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';

// Generics
import GenericList from './pages/generics/GenericList';
import GenericDetail from './pages/generics/GenericDetail';
import GenericFormPage from './pages/generics/GenericFormPage';

// Brands
import BrandList from './pages/brands/BrandList';
import BrandDetail from './pages/brands/BrandDetail';
import BrandFormPage from './pages/brands/BrandFormPage';

// Manufacturers
import ManufacturerList from './pages/manufacturers/ManufacturerList';
import ManufacturerDetail from './pages/manufacturers/ManufacturerDetail';
import ManufacturerFormPage from './pages/manufacturers/ManufacturerFormPage';

// Therapeutic Classes
import TherapeuticClassList from './pages/therapeutic-classes/TherapeuticClassList';
import TherapeuticClassDetail from './pages/therapeutic-classes/TherapeuticClassDetail';
import TherapeuticClassFormPage from './pages/therapeutic-classes/TherapeuticClassFormPage';

// Dosage Forms
import DosageFormList from './pages/dosage-forms/DosageFormList';
import DosageFormDetail from './pages/dosage-forms/DosageFormDetail';
import DosageFormFormPage from './pages/dosage-forms/DosageFormFormPage';

// Alternatives
import AlternativeList from './pages/alternatives/AlternativeList';
import AlternativeFormPage from './pages/alternatives/AlternativeFormPage';

// Prices
import PriceList from './pages/prices/PriceList';
import PriceFormPage from './pages/prices/PriceFormPage';

// Search
import SearchResults from './pages/search/SearchResults';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },

      // Generics — uses: GET /generics/, GET /generics/{id}, GET /generics/{id}/alternatives, POST, PUT /generics/
      { path: 'generics', element: <GenericList /> },
      { path: 'generics/new', element: <GenericFormPage /> },
      { path: 'generics/:id', element: <GenericDetail /> },
      { path: 'generics/:id/edit', element: <GenericFormPage /> },

      // Brands — uses: GET /brands/, GET /brands/{id}, GET /brands/{id}/prices, GET /brands/by-ndc, GET /brands/by-barcode, POST, PUT, DELETE
      { path: 'brands', element: <BrandList /> },
      { path: 'brands/new', element: <BrandFormPage /> },
      { path: 'brands/:id', element: <BrandDetail /> },
      { path: 'brands/:id/edit', element: <BrandFormPage /> },

      // Manufacturers — uses: GET /manufacturers/, GET /manufacturers/{id}, POST, PUT, DELETE
      { path: 'manufacturers', element: <ManufacturerList /> },
      { path: 'manufacturers/new', element: <ManufacturerFormPage /> },
      { path: 'manufacturers/:id', element: <ManufacturerDetail /> },
      { path: 'manufacturers/:id/edit', element: <ManufacturerFormPage /> },

      // Therapeutic Classes — uses: GET /, GET /roots, GET /{id}/children, GET /{id}, POST, PUT, DELETE
      { path: 'therapeutic-classes', element: <TherapeuticClassList /> },
      { path: 'therapeutic-classes/new', element: <TherapeuticClassFormPage /> },
      { path: 'therapeutic-classes/:id', element: <TherapeuticClassDetail /> },
      { path: 'therapeutic-classes/:id/edit', element: <TherapeuticClassFormPage /> },

      // Dosage Forms — uses: GET /dosage-forms/, GET /{id}, POST, PUT, DELETE
      { path: 'dosage-forms', element: <DosageFormList /> },
      { path: 'dosage-forms/new', element: <DosageFormFormPage /> },
      { path: 'dosage-forms/:id', element: <DosageFormDetail /> },
      { path: 'dosage-forms/:id/edit', element: <DosageFormFormPage /> },

      // Alternatives — uses: GET /alternatives/, GET /{id}, POST, PUT, DELETE
      { path: 'alternatives', element: <AlternativeList /> },
      { path: 'alternatives/new', element: <AlternativeFormPage /> },
      { path: 'alternatives/:id/edit', element: <AlternativeFormPage /> },

      // Prices — uses: GET /prices/by-brand/{id}, GET /prices/active/{id}, GET /{id}, POST, PUT, DELETE
      { path: 'prices', element: <PriceList /> },
      { path: 'prices/new', element: <PriceFormPage /> },
      { path: 'prices/:id/edit', element: <PriceFormPage /> },

      // Search — uses: GET /brands/by-ndc/{ndc}, GET /brands/by-barcode/{barcode}, GET /generics/ + GET /brands/
      { path: 'search', element: <SearchResults /> },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
}
