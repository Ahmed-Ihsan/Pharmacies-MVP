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
