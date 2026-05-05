# Pharmacy Management API

A professional pharmacy management backend built with FastAPI and SQLAlchemy, featuring a complete Drug Master Database with Generic vs. Brand Name management.

## Features

- **Drug Master Database**: Complete management of generic drugs and brand names
- **Therapeutic Classification**: Hierarchical classification system (ATC codes)
- **Dosage Forms**: Support for tablets, capsules, syrups, injections, etc.
- **Manufacturer Management**: Track drug manufacturers and their products
- **Alternative/Substitution**: Link bioequivalent generic alternatives
- **Pricing System**: Track acquisition and selling prices with history
- **Barcode/NDC Support**: Lookup by NDC number or barcode
- **RESTful API**: Full CRUD operations with search and filtering

## Technology Stack

- **Framework**: FastAPI (Python 3.10+)
- **Database**: SQLite (configured for easy development)
- **ORM**: SQLAlchemy 2.0 with declarative models
- **Migrations**: Alembic
- **Validation**: Pydantic v2
- **Architecture**: Repository + Service Layer pattern

## Project Structure

```
cydl/
├── app/
│   ├── api/v1/              # API endpoints (REST)
│   │   ├── endpoints/       # Domain-specific endpoints
│   │   ├── deps/           # Dependencies (DB session)
│   │   └── api.py          # Router aggregation
│   ├── core/               # Core configuration
│   │   ├── config.py       # Pydantic settings
│   │   ├── constants.py    # Enums and constants
│   │   └── exceptions.py   # Custom exceptions
│   ├── db/                 # Database layer
│   │   ├── base.py         # SQLAlchemy base & engine
│   │   └── session.py      # Session factory
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic request/response models
│   ├── repositories/       # Data access layer
│   ├── services/           # Business logic layer
│   └── main.py             # FastAPI application entry
├── scripts/                # Utility scripts
│   ├── init_database.py    # Create database tables
│   └── seed_data.py        # Load sample data
├── data/                   # SQLite database file
├── alembic/                # Database migrations
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Initialize Database

```bash
# Create tables
python scripts/init_database.py

# Load sample data
python scripts/seed_data.py
```

### 3. Run the Application

```bash
python -m uvicorn app.main:app --reload
```

Or directly:

```bash
python app/main.py
```

### 4. Access API Documentation

Once running, access the auto-generated documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

For complete API documentation with all endpoints, request/response schemas, and examples, see **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

### Quick Reference

| Resource | Endpoints |
|----------|-----------|
| **Therapeutic Classes** | `GET /api/v1/therapeutic-classes` (list, search) |
| | `POST /api/v1/therapeutic-classes` (create) |
| | `GET /api/v1/therapeutic-classes/{id}` (get) |
| | `PUT /api/v1/therapeutic-classes/{id}` (update) |
| | `DELETE /api/v1/therapeutic-classes/{id}` (delete) |
| | `GET /api/v1/therapeutic-classes/roots` (root classes) |
| | `GET /api/v1/therapeutic-classes/{id}/children` (child classes) |
| **Dosage Forms** | `GET /api/v1/dosage-forms` |
| **Manufacturers** | `GET /api/v1/manufacturers` |
| **Generic Drugs** | `GET /api/v1/generics` |
| | `GET /api/v1/generics?search={query}` |
| | `GET /api/v1/generics/{id}/alternatives` |
| **Brand Names** | `GET /api/v1/brands` |
| | `GET /api/v1/brands?search={query}` |
| | `GET /api/v1/brands/by-ndc/{ndc}` |
| | `GET /api/v1/brands/by-barcode/{barcode}` |
| | `GET /api/v1/brands/{id}/prices` |
| **Alternatives** | `GET /api/v1/alternatives` |
| **Prices** | `GET /api/v1/prices/by-brand/{brand_id}` |
| | `GET /api/v1/prices/active/{brand_id}` |

## Database Schema

### Core Tables

1. **therapeutic_classes** - Hierarchical drug classification (ATC)
2. **dosage_forms** - Administration forms (tablet, capsule, etc.)
3. **manufacturers** - Drug manufacturers
4. **generic_drugs** - Active pharmaceutical ingredients
5. **brand_names** - Commercial drug products
6. **generic_alternatives** - Links bioequivalent drugs
7. **drug_prices** - Price history

### Relationships

```
TherapeuticClass (1) ←→ (N) GenericDrug
GenericDrug (1) ←→ (N) BrandName
Manufacturer (1) ←→ (N) BrandName
DosageForm (1) ←→ (N) BrandName
GenericDrug (N) ←→ (N) GenericDrug [via generic_alternatives]
BrandName (1) ←→ (N) DrugPrice
```

## Usage Examples

### Create a Generic Drug

```bash
curl -X POST "http://localhost:8000/api/v1/generics" \
  -H "Content-Type: application/json" \
  -d '{
    "generic_name": "Aspirin",
    "cas_number": "50-78-2",
    "indications": "Pain relief, anti-inflammatory",
    "pregnancy_category": "D"
  }'
```

### Search Drugs

```bash
curl "http://localhost:8000/api/v1/generics?search=paracetamol"
```

### Get Alternatives

```bash
curl "http://localhost:8000/api/v1/generics/1/alternatives"
```

### Lookup by NDC

```bash
curl "http://localhost:8000/api/v1/brands/by-ndc/50580-011-00"
```

### Add Price

```bash
curl -X POST "http://localhost:8000/api/v1/prices" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": 1,
    "acquisition_price": 5.50,
    "selling_price": 12.99,
    "effective_date": "2024-01-01"
  }'
```

## Development

### Running Tests

```bash
pytest tests/
```

### Database Migrations

Using Alembic (optional, already initialized):

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=sqlite:///./data/pharmacy.db
SECRET_KEY=your-secret-key
DEBUG=True
```

## Data Model Details

### Generic Drug Fields
- `generic_name` - Official generic name
- `cas_number` - Chemical Abstracts Service registry
- `molecular_formula` - Chemical formula
- `therapeutic_class_id` - FK to classification
- `pharmacology` - Mechanism of action
- `indications` - Approved uses
- `contraindications` - When NOT to use
- `side_effects` - Adverse effects
- `interactions` - Drug-drug interactions
- `pregnancy_category` - FDA category (A/B/C/D/X)
- `controlled_substance_schedule` - DEA schedule

### Brand Name Fields
- `brand_name` - Commercial name
- `generic_id` - FK to generic drug
- `manufacturer_id` - FK to manufacturer
- `dosage_form_id` - FK to dosage form
- `strength_value/unit` - Drug strength
- `ndc_number` - National Drug Code
- `barcode` - UPC/EAN
- `prescription_required` - Rx/OTC flag
- `storage_conditions` - Storage requirements

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions welcome! Please follow the existing code structure and add tests for new features.
