from enum import Enum


class DrugStatus(str, Enum):
    ACTIVE = "active"
    DISCONTINUED = "discontinued"
    RECALLED = "recalled"


class GenericStatus(str, Enum):
    ACTIVE = "active"
    DISCONTINUED = "discontinued"


class ManufacturerStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"


class PregnancyCategory(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    X = "X"


class ControlledSubstanceSchedule(str, Enum):
    CII = "CII"
    CIII = "CIII"
    CIV = "CIV"
    CV = "CV"
    NONE = "none"


class StorageCondition(str, Enum):
    ROOM_TEMPERATURE = "room_temperature"
    REFRIGERATED = "refrigerated"
    FROZEN = "frozen"
    PROTECTED_FROM_LIGHT = "protected_from_light"


class RouteOfAdministration(str, Enum):
    ORAL = "oral"
    INTRAVENOUS = "intravenous"
    INTRAMUSCULAR = "intramuscular"
    SUBCUTANEOUS = "subcutaneous"
    TOPICAL = "topical"
    INHALATION = "inhalation"
    RECTAL = "rectal"
    OPHTHALMIC = "ophthalmic"
    OTIC = "otic"
    NASAL = "nasal"


class InventoryStatus(str, Enum):
    AVAILABLE = "available"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    EXPIRED = "expired"
    EXPIRING_SOON = "expiring_soon"


class MovementType(str, Enum):
    ADD = "add"
    REMOVE = "remove"
    SALE = "sale"
    DAMAGE = "damage"
    ADJUSTMENT = "adjustment"


class AlertType(str, Enum):
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"
    EXPIRING_SOON = "expiring_soon"
    EXPIRED = "expired"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"
    CREDIT = "credit"


class SaleStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class DiscountType(str, Enum):
    PERCENTAGE = "percentage"
    AMOUNT = "amount"
