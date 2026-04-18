class PharmacyException(Exception):
    """Base exception for pharmacy application."""
    pass


class NotFoundException(PharmacyException):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, identifier: str):
        self.resource = resource
        self.identifier = identifier
        self.message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(self.message)


class DuplicateException(PharmacyException):
    """Raised when attempting to create a duplicate resource."""
    def __init__(self, resource: str, field: str, value: str):
        self.resource = resource
        self.field = field
        self.value = value
        self.message = f"{resource} with {field} '{value}' already exists"
        super().__init__(self.message)


class ValidationException(PharmacyException):
    """Raised when data validation fails."""
    pass
