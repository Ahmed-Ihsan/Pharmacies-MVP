from fastapi import APIRouter

from app.api.v1.endpoints import (
    therapeutic_classes,
    dosage_forms,
    manufacturers,
    generics,
    brands,
    alternatives,
    prices,
)

api_router = APIRouter()

api_router.include_router(
    therapeutic_classes.router,
    prefix="/therapeutic-classes",
    tags=["therapeutic-classes"]
)

api_router.include_router(
    dosage_forms.router,
    prefix="/dosage-forms",
    tags=["dosage-forms"]
)

api_router.include_router(
    manufacturers.router,
    prefix="/manufacturers",
    tags=["manufacturers"]
)

api_router.include_router(
    generics.router,
    prefix="/generics",
    tags=["generics"]
)

api_router.include_router(
    brands.router,
    prefix="/brands",
    tags=["brands"]
)

api_router.include_router(
    alternatives.router,
    prefix="/alternatives",
    tags=["alternatives"]
)

api_router.include_router(
    prices.router,
    prefix="/prices",
    tags=["prices"]
)
