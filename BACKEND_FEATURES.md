# Backend Features

## 1. Therapeutic Classes (ATC Classification)
- **List all** with pagination and search
- **Get root classes** (classes with no parent)
- **Get child classes** of a specific parent
- **Get by ID** with full details
- **Create** new therapeutic class
- **Update** existing class
- **Delete** class

## 2. Dosage Forms
- **List all** with pagination and search
- **Get by ID** with details
- **Create** new dosage form
- **Update** existing form
- **Delete** form

## 3. Manufacturers
- **List all** with pagination and search
- **Get by ID** with details
- **Create** new manufacturer
- **Update** existing manufacturer
- **Delete** manufacturer

## 4. Generic Drugs (Active Ingredients)
- **List all** with pagination, search, and therapeutic class filtering
- **Get by ID** with full details (includes therapeutic class info)
- **Get alternatives** for a specific generic drug
- **Create** new generic drug
- **Update** existing generic
- **Delete** generic

## 5. Brand Names (Commercial Products)
- **List all** with pagination, search, generic filtering, and manufacturer filtering
- **Get by NDC number** (National Drug Code lookup)
- **Get by barcode** (UPC/EAN lookup)
- **Get by ID** with full details
- **Get price history** for a brand
- **Create** new brand
- **Update** existing brand
- **Delete** brand

## 6. Alternatives (Generic Substitutes)
- **List all** with pagination and primary generic filtering
- **Get by ID** with generic drug names
- **Create** new alternative relationship
- **Update** existing alternative
- **Delete** alternative

## 7. Prices (Drug Pricing)
- **List prices by brand** with pagination
- **Get active price** for a brand as of specific date (default: today)
- **Get by ID** with brand details
- **Create** new price entry
- **Update** existing price
- **Delete** price

## Common Features Across All Endpoints
- **Pagination** (`skip`, `limit` parameters)
- **Search** (text search on relevant fields)
- **Filtering** (by related entities)
- **Error handling** (404 Not Found, 409 Conflict for duplicates)
- **Pydantic validation** (request/response schemas)

## System Endpoints
- **Health check** at `/health`
- **Root endpoint** at `/` with API info
- **Auto-generated docs** at `/docs` (Swagger UI) and `/redoc`

Total: **7 main entities** with **35+ API endpoints** covering full CRUD operations plus specialized features like NDC/barcode lookup, hierarchical classification, and price history tracking.
