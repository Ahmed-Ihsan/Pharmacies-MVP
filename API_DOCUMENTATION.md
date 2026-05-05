# API Documentation

Complete API endpoint documentation for the Pharmacy Management System.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
Currently no authentication is implemented. All endpoints are publicly accessible.

---

## Therapeutic Classes

Manage hierarchical drug classification system (ATC codes).

### Endpoints

#### List All Therapeutic Classes
```http
GET /therapeutic-classes
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `search` (str, optional): Search by class name or code

**Response:** Paginated list of therapeutic classes

---

#### Get Root Classes
```http
GET /therapeutic-classes/roots
```

**Description:** Get all root therapeutic classes (classes with no parent)

**Response:** List of root therapeutic classes

---

#### Get Child Classes
```http
GET /therapeutic-classes/{class_id}/children
```

**Path Parameters:**
- `class_id` (int): Parent class ID

**Response:** List of child therapeutic classes

---

#### Get Specific Therapeutic Class
```http
GET /therapeutic-classes/{class_id}
```

**Path Parameters:**
- `class_id` (int): Therapeutic class ID

**Response:** Therapeutic class details

---

#### Create Therapeutic Class
```http
POST /therapeutic-classes
```

**Request Body:**
```json
{
  "class_name": "string",
  "class_code": "string",
  "description": "string",
  "parent_id": "integer (optional)"
}
```

**Response:** Created therapeutic class (201)

---

#### Update Therapeutic Class
```http
PUT /therapeutic-classes/{class_id}
```

**Path Parameters:**
- `class_id` (int): Therapeutic class ID

**Request Body:**
```json
{
  "class_name": "string",
  "class_code": "string",
  "description": "string",
  "parent_id": "integer (optional)"
}
```

**Response:** Updated therapeutic class

---

#### Delete Therapeutic Class
```http
DELETE /therapeutic-classes/{class_id}
```

**Path Parameters:**
- `class_id` (int): Therapeutic class ID

**Response:** Success message

---

## Dosage Forms

Manage drug administration forms (tablets, capsules, syrups, injections, etc.).

### Endpoints

#### List All Dosage Forms
```http
GET /dosage-forms
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `search` (str, optional): Search by form name

**Response:** Paginated list of dosage forms

---

#### Get Specific Dosage Form
```http
GET /dosage-forms/{dosage_form_id}
```

**Path Parameters:**
- `dosage_form_id` (int): Dosage form ID

**Response:** Dosage form details

---

#### Create Dosage Form
```http
POST /dosage-forms
```

**Request Body:**
```json
{
  "form_name": "string",
  "description": "string"
}
```

**Response:** Created dosage form (201)

---

#### Update Dosage Form
```http
PUT /dosage-forms/{dosage_form_id}
```

**Path Parameters:**
- `dosage_form_id` (int): Dosage form ID

**Request Body:**
```json
{
  "form_name": "string",
  "description": "string"
}
```

**Response:** Updated dosage form

---

#### Delete Dosage Form
```http
DELETE /dosage-forms/{dosage_form_id}
```

**Path Parameters:**
- `dosage_form_id` (int): Dosage form ID

**Response:** Success message

---

## Manufacturers

Manage drug manufacturers and their products.

### Endpoints

#### List All Manufacturers
```http
GET /manufacturers
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `search` (str, optional): Search by manufacturer name

**Response:** Paginated list of manufacturers

---

#### Get Specific Manufacturer
```http
GET /manufacturers/{manufacturer_id}
```

**Path Parameters:**
- `manufacturer_id` (int): Manufacturer ID

**Response:** Manufacturer details

---

#### Create Manufacturer
```http
POST /manufacturers
```

**Request Body:**
```json
{
  "manufacturer_name": "string",
  "country": "string (optional)",
  "website": "string (optional)",
  "contact_email": "string (optional)"
}
```

**Response:** Created manufacturer (201)

---

#### Update Manufacturer
```http
PUT /manufacturers/{manufacturer_id}
```

**Path Parameters:**
- `manufacturer_id` (int): Manufacturer ID

**Request Body:**
```json
{
  "manufacturer_name": "string",
  "country": "string (optional)",
  "website": "string (optional)",
  "contact_email": "string (optional)"
}
```

**Response:** Updated manufacturer

---

#### Delete Manufacturer
```http
DELETE /manufacturers/{manufacturer_id}
```

**Path Parameters:**
- `manufacturer_id` (int): Manufacturer ID

**Response:** Success message

---

## Generic Drugs

Manage active pharmaceutical ingredients (generic drugs).

### Endpoints

#### List All Generic Drugs
```http
GET /generics
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `search` (str, optional): Search by generic name
- `therapeutic_class_id` (int, optional): Filter by therapeutic class

**Response:** Paginated list of generic drugs

---

#### Get Specific Generic Drug
```http
GET /generics/{generic_id}
```

**Path Parameters:**
- `generic_id` (int): Generic drug ID

**Response:** Generic drug with full details

---

#### Get Generic Alternatives
```http
GET /generics/{generic_id}/alternatives
```

**Path Parameters:**
- `generic_id` (int): Generic drug ID

**Description:** Get all bioequivalent alternative generics for a specific drug

**Response:** List of alternative generics with names

---

#### Create Generic Drug
```http
POST /generics
```

**Request Body:**
```json
{
  "generic_name": "string",
  "cas_number": "string (optional)",
  "molecular_formula": "string (optional)",
  "therapeutic_class_id": "integer (optional)",
  "pharmacology": "string (optional)",
  "indications": "string (optional)",
  "contraindications": "string (optional)",
  "side_effects": "string (optional)",
  "interactions": "string (optional)",
  "pregnancy_category": "string (optional)",
  "controlled_substance_schedule": "string (optional)"
}
```

**Response:** Created generic drug (201)

---

#### Update Generic Drug
```http
PUT /generics/{generic_id}
```

**Path Parameters:**
- `generic_id` (int): Generic drug ID

**Request Body:**
```json
{
  "generic_name": "string (optional)",
  "cas_number": "string (optional)",
  "molecular_formula": "string (optional)",
  "therapeutic_class_id": "integer (optional)",
  "pharmacology": "string (optional)",
  "indications": "string (optional)",
  "contraindications": "string (optional)",
  "side_effects": "string (optional)",
  "interactions": "string (optional)",
  "pregnancy_category": "string (optional)",
  "controlled_substance_schedule": "string (optional)"
}
```

**Response:** Updated generic drug

---

#### Delete Generic Drug
```http
DELETE /generics/{generic_id}
```

**Path Parameters:**
- `generic_id` (int): Generic drug ID

**Response:** Success message

---

## Brand Names

Manage commercial drug products with NDC and barcode support.

### Endpoints

#### List All Brand Names
```http
GET /brands
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `search` (str, optional): Search by brand name
- `generic_id` (int, optional): Filter by generic drug
- `manufacturer_id` (int, optional): Filter by manufacturer

**Response:** Paginated list of brand names

---

#### Get Brand by NDC Number
```http
GET /brands/by-ndc/{ndc_number}
```

**Path Parameters:**
- `ndc_number` (str): National Drug Code

**Response:** Brand name details

---

#### Get Brand by Barcode
```http
GET /brands/by-barcode/{barcode}
```

**Path Parameters:**
- `barcode` (str): UPC/EAN barcode

**Response:** Brand name details

---

#### Get Specific Brand
```http
GET /brands/{brand_id}
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Response:** Brand name with full details

---

#### Get Brand Prices
```http
GET /brands/{brand_id}/prices
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)

**Response:** Price history for the brand

---

#### Create Brand Name
```http
POST /brands
```

**Request Body:**
```json
{
  "brand_name": "string",
  "generic_id": "integer",
  "manufacturer_id": "integer",
  "dosage_form_id": "integer",
  "strength_value": "number (optional)",
  "strength_unit": "string (optional)",
  "ndc_number": "string (optional)",
  "barcode": "string (optional)",
  "prescription_required": "boolean (optional)",
  "storage_conditions": "string (optional)"
}
```

**Response:** Created brand name (201)

---

#### Update Brand Name
```http
PUT /brands/{brand_id}
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Request Body:**
```json
{
  "brand_name": "string (optional)",
  "generic_id": "integer (optional)",
  "manufacturer_id": "integer (optional)",
  "dosage_form_id": "integer (optional)",
  "strength_value": "number (optional)",
  "strength_unit": "string (optional)",
  "ndc_number": "string (optional)",
  "barcode": "string (optional)",
  "prescription_required": "boolean (optional)",
  "storage_conditions": "string (optional)"
}
```

**Response:** Updated brand name

---

#### Delete Brand Name
```http
DELETE /brands/{brand_id}
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Response:** Success message

---

## Alternatives

Manage bioequivalent generic alternative relationships.

### Endpoints

#### List All Alternatives
```http
GET /alternatives
```

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)
- `primary_generic_id` (int, optional): Filter by primary generic drug

**Response:** Paginated list of alternatives

---

#### Get Specific Alternative
```http
GET /alternatives/{alternative_id}
```

**Path Parameters:**
- `alternative_id` (int): Alternative ID

**Response:** Alternative with generic drug names

---

#### Create Alternative
```http
POST /alternatives
```

**Request Body:**
```json
{
  "primary_generic_id": "integer",
  "alternative_generic_id": "integer",
  "notes": "string (optional)"
}
```

**Response:** Created alternative (201)

---

#### Update Alternative
```http
PUT /alternatives/{alternative_id}
```

**Path Parameters:**
- `alternative_id` (int): Alternative ID

**Request Body:**
```json
{
  "primary_generic_id": "integer (optional)",
  "alternative_generic_id": "integer (optional)",
  "notes": "string (optional)"
}
```

**Response:** Updated alternative

---

#### Delete Alternative
```http
DELETE /alternatives/{alternative_id}
```

**Path Parameters:**
- `alternative_id` (int): Alternative ID

**Response:** Success message

---

## Prices

Manage drug pricing with history tracking.

### Endpoints

#### List Prices by Brand
```http
GET /prices/by-brand/{brand_id}
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Query Parameters:**
- `skip` (int, optional): Pagination offset (default: 0)
- `limit` (int, optional): Items per page (default: 100)

**Response:** Paginated list of prices for the brand

---

#### Get Active Price
```http
GET /prices/active/{brand_id}
```

**Path Parameters:**
- `brand_id` (int): Brand name ID

**Query Parameters:**
- `as_of` (date, optional): Date to check price for (default: today, format: YYYY-MM-DD)

**Description:** Get the currently active price for a brand as of a specific date

**Response:** Active price details

---

#### Get Specific Price
```http
GET /prices/{price_id}
```

**Path Parameters:**
- `price_id` (int): Price ID

**Response:** Price entry with brand details

---

#### Create Price
```http
POST /prices
```

**Request Body:**
```json
{
  "brand_id": "integer",
  "acquisition_price": "number",
  "selling_price": "number",
  "effective_date": "string (YYYY-MM-DD)",
  "notes": "string (optional)"
}
```

**Response:** Created price entry (201)

---

#### Update Price
```http
PUT /prices/{price_id}
```

**Path Parameters:**
- `price_id` (int): Price ID

**Request Body:**
```json
{
  "acquisition_price": "number (optional)",
  "selling_price": "number (optional)",
  "effective_date": "string (optional)",
  "notes": "string (optional)"
}
```

**Response:** Updated price entry

---

#### Delete Price
```http
DELETE /prices/{price_id}
```

**Path Parameters:**
- `price_id` (int): Price ID

**Response:** Success message

---

## System Endpoints

### Health Check
```http
GET /health
```

**Response:** System health status

```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Root Endpoint
```http
GET /
```

**Response:** API information

```json
{
  "message": "Pharmacy Management API",
  "version": "1.0.0",
  "docs": "/docs"
}
```

---

## Common Features

### Pagination
Most list endpoints support pagination:
- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 100)

### Search
Many endpoints support text search via the `search` query parameter.

### Filtering
Endpoints support filtering by related entities (e.g., brands by generic_id or manufacturer_id).

### Error Responses

**404 Not Found**
```json
{
  "detail": "Resource not found"
}
```

**409 Conflict**
```json
{
  "detail": "Duplicate entry"
}
```

**422 Unprocessable Entity**
```json
{
  "detail": "Validation error"
}
```

---

## Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
