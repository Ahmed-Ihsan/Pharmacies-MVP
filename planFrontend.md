All API Endpoints
Root Endpoints

GET /
GET /health
Therapeutic Classes (/api/v1/therapeutic-classes)

GET /
GET /roots
GET /{class_id}
GET /{class_id}/children
POST /
PUT /{class_id}
DELETE /{class_id}
Dosage Forms (/api/v1/dosage-forms)

GET /
GET /{dosage_form_id}
POST /
PUT /{dosage_form_id}
DELETE /{dosage_form_id}
Manufacturers (/api/v1/manufacturers)

GET /
GET /{manufacturer_id}
POST /
PUT /{manufacturer_id}
DELETE /{manufacturer_id}
Generics (/api/v1/generics)

GET /
GET /{generic_id}
GET /{generic_id}/alternatives
POST /
PUT /{generic_id}
DELETE /{generic_id}
Brands (/api/v1/brands)

GET /
GET /by-ndc/{ndc_number}
GET /by-barcode/{barcode}
GET /{brand_id}
GET /{brand_id}/prices
POST /
PUT /{brand_id}
DELETE /{brand_id}
Alternatives (/api/v1/alternatives)

GET /
GET /{alternative_id}
POST /
PUT /{alternative_id}
DELETE /{alternative_id}
Prices (/api/v1/prices)

GET /by-brand/{brand_id}
GET /active/{brand_id}
GET /{price_id}
POST /
PUT /{price_id}
DELETE /{price_id}

Pages List
Dashboard

Overview statistics (counts for all entities)
Quick search bar
Recent activity summary
Generic Drugs (Generics)

List view with search and filter by therapeutic class
Detail view showing generic info with related brands
Create/Edit forms
View alternatives section
Brand Names (Brands)

List view with search and filter by generic/manufacturer
Detail view showing brand info, prices, NDC/barcode
Create/Edit forms
Price history section
Manufacturers

List view with search
Detail view with their brands
Create/Edit forms
Therapeutic Classes

List view with search
Detail view showing hierarchy (parent/children)
Create/Edit forms
Tree/hierarchical navigation
Dosage Forms

List view with search
Detail view
Create/Edit forms
Alternatives Management

List view filtering by primary generic
Create/Edit forms for linking generics as alternatives
Price Management

List view by brand
Create/Edit price entries
Active price view with date selection
Search/Lookup

Unified search across generics and brands
Barcode/NDC lookup interface
Results page with filtering
Reports/Analytics (Optional for MVP)

Price trends
Generic-brand coverage reports


frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navigation.tsx
│   │   └── forms/
│   │       ├── GenericForm.tsx
│   │       ├── BrandForm.tsx
│   │       ├── ManufacturerForm.tsx
│   │       ├── TherapeuticClassForm.tsx
│   │       ├── DosageForm.tsx
│   │       ├── AlternativeForm.tsx
│   │       └── PriceForm.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── generics/
│   │   │   ├── GenericList.tsx
│   │   │   ├── GenericDetail.tsx
│   │   │   └── GenericAlternatives.tsx
│   │   ├── brands/
│   │   │   ├── BrandList.tsx
│   │   │   ├── BrandDetail.tsx
│   │   │   └── BrandPrices.tsx
│   │   ├── manufacturers/
│   │   │   ├── ManufacturerList.tsx
│   │   │   └── ManufacturerDetail.tsx
│   │   ├── therapeutic-classes/
│   │   │   ├── TherapeuticClassList.tsx
│   │   │   └── TherapeuticClassDetail.tsx
│   │   ├── dosage-forms/
│   │   │   ├── DosageFormList.tsx
│   │   │   └── DosageFormDetail.tsx
│   │   ├── alternatives/
│   │   │   ├── AlternativeList.tsx
│   │   │   └── AlternativeDetail.tsx
│   │   ├── prices/
│   │   │   ├── PriceList.tsx
│   │   │   └── PriceDetail.tsx
│   │   └── search/
│   │       └── SearchResults.tsx
│   ├── hooks/
│   │   ├── useGenerics.ts
│   │   ├── useBrands.ts
│   │   ├── useManufacturers.ts
│   │   ├── useTherapeuticClasses.ts
│   │   ├── useDosageForms.ts
│   │   ├── useAlternatives.ts
│   │   ├── usePrices.ts
│   │   └── useSearch.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── genericService.ts
│   │   ├── brandService.ts
│   │   ├── manufacturerService.ts
│   │   ├── therapeuticClassService.ts
│   │   ├── dosageFormService.ts
│   │   ├── alternativeService.ts
│   │   └── priceService.ts
│   ├── types/
│   │   ├── generic.ts
│   │   ├── brand.ts
│   │   ├── manufacturer.ts
│   │   ├── therapeuticClass.ts
│   │   ├── dosageForm.ts
│   │   ├── alternative.ts
│   │   ├── price.ts
│   │   └── common.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

Phase 1: Setup (High Priority)

Initialize React + TypeScript project with Vite
Install and configure TailwindCSS, shadcn/ui, Lucide icons
Setup project folder structure
Create TypeScript interfaces for all entities
Setup Axios API client with base configuration
Create API service functions for all endpoints
Build Layout components (Sidebar, Header, Navigation)
Build common UI components (Button, Input, Select, Table, Modal, Pagination, SearchBar)
Phase 2: Core Pages (Medium Priority) 9. Create Dashboard page with overview stats 10. Create Generic Drugs list page with search/filter 11. Create Generic Drug detail page with alternatives view 12. Create Brand Names list page with NDC/barcode lookup 13. Create Brand detail page with price history 14. Create Manufacturers list and detail pages 15. Create Therapeutic Classes hierarchical pages 16. Create Dosage Forms list and detail pages 17. Create Alternatives management pages 18. Create Price Management pages 19. Create unified Search/Lookup page 20. Create reusable form components (GenericForm, BrandForm, etc.)

Phase 3: Integration (Medium/Low Priority) 21. Setup React Router with all routes 22. Create custom hooks for data fetching 23. Add error handling and loading states 24. Test integration with backend API