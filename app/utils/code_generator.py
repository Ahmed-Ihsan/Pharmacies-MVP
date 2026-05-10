"""Utility for auto-generating codes with customizable patterns."""

import random
import string
from typing import Optional
from datetime import datetime


class CodeGenerator:
    """Generate codes following specific patterns for pharmacy entities."""
    
    @staticmethod
    def generate_class_code(parent_code: Optional[str] = None) -> str:
        """
        Generate therapeutic class code following ATC-like pattern.
        Pattern: TC-{parent_code}{random_4_digits}
        Example: TC-0001, TC-A001 (if parent is TC-A000)
        """
        prefix = "TC"
        
        if parent_code:
            # Extract the numeric part from parent code
            # e.g., TC-A001 -> A001
            parent_suffix = parent_code.split("-")[-1] if "-" in parent_code else parent_code
            
            # Increment the numeric part
            if parent_suffix.isdigit():
                new_number = str(int(parent_suffix) + 1).zfill(4)
                return f"{prefix}-{new_number}"
            else:
                # Handle alphanumeric codes
                letters = "".join([c for c in parent_suffix if c.isalpha()])
                digits = "".join([c for c in parent_suffix if c.isdigit()])
                
                if digits:
                    new_number = str(int(digits) + 1).zfill(4)
                    return f"{prefix}-{letters}{new_number}"
                else:
                    # Generate new random code
                    random_num = random.randint(1000, 9999)
                    return f"{prefix}-{letters}{random_num}"
        else:
            # Generate new root code
            random_num = random.randint(1, 9999)
            return f"{prefix}-{str(random_num).zfill(4)}"
    
    @staticmethod
    def generate_cas_number() -> str:
        """
        Generate CAS number following standard format.
        Pattern: XXXXXXXX-XX-X (8 digits-2 digits-1 digit checksum)
        Example: 50-78-2, 1234567-89-0
        """
        # Generate 7-8 digit base
        base = str(random.randint(1000000, 99999999))
        
        # Generate 2-digit segment
        segment = str(random.randint(10, 99))
        
        # Calculate checksum (simplified - real CAS uses specific algorithm)
        checksum = str(random.randint(0, 9))
        
        return f"{base}-{segment}-{checksum}"
    
    @staticmethod
    def generate_ndc_number() -> str:
        """
        Generate NDC number following FDA format.
        Pattern: XXXXX-XXXX-XX (5 digits-4 digits-2 digits)
        Example: 50580-011-00
        """
        labeler_code = str(random.randint(10000, 99999))
        product_code = str(random.randint(1000, 9999))
        package_code = str(random.randint(10, 99))
        
        return f"{labeler_code}-{product_code}-{package_code}"
    
    @staticmethod
    def generate_barcode() -> str:
        """
        Generate EAN-13 barcode.
        Pattern: 13 digits with checksum
        Example: 7891234567890
        """
        # Generate 12 digits
        base = "".join([str(random.randint(0, 9)) for _ in range(12)])
        
        # Calculate checksum (simplified EAN-13 algorithm)
        total = 0
        for i, digit in enumerate(base):
            num = int(digit)
            if (i + 1) % 2 == 0:
                total += num * 3
            else:
                total += num
        
        checksum = (10 - (total % 10)) % 10
        
        return base + str(checksum)
    
    @staticmethod
    def generate_atc_code(parent_code: Optional[str] = None) -> str:
        """
        Generate ATC code following WHO format.
        Pattern: XXXXX (1 letter + 4 digits/letters)
        Example: A01, A01BA, C09AA
        """
        if parent_code:
            # Extend parent code
            if len(parent_code) < 5:
                # Add next character
                if parent_code[-1].isdigit():
                    # Add letter
                    next_char = random.choice(string.ascii_uppercase)
                    return parent_code + next_char
                else:
                    # Add digit
                    next_digit = random.randint(0, 9)
                    return parent_code + str(next_digit)
            else:
                # Generate new code in same category
                category = parent_code[0]
                return f"{category}{random.randint(1000, 9999)}"
        else:
            # Generate new root code (anatomical group)
            anatomical_groups = ['A', 'B', 'C', 'D', 'G', 'H', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'V']
            group = random.choice(anatomical_groups)
            return f"{group}{random.randint(1, 99):02d}"
    
    @staticmethod
    def generate_manufacturer_code() -> str:
        """
        Generate manufacturer code.
        Pattern: MF-XXXX (4 random digits)
        Example: MF-1234
        """
        random_num = random.randint(1000, 9999)
        return f"MF-{random_num}"
    
    @staticmethod
    def generate_dosage_form_code() -> str:
        """
        Generate dosage form code.
        Pattern: DF-XXX (3 random characters)
        Example: DF-TAB (tablet)
        """
        chars = string.ascii_uppercase
        random_str = "".join(random.choice(chars) for _ in range(3))
        return f"DF-{random_str}"
    
    @staticmethod
    def validate_code(code: str, code_type: str) -> tuple[bool, Optional[str]]:
        """
        Validate code format based on type.
        Returns (is_valid, error_message)
        """
        patterns = {
            "class_code": r"^TC-[A-Z0-9]{4}$",
            "cas_number": r"^\d{4,8}-\d{2}-\d$",
            "ndc_number": r"^\d{5}-\d{4}-\d{2}$",
            "barcode": r"^\d{13}$",
            "atc_code": r"^[A-Z][A-Z0-9]{4}$",
            "manufacturer_code": r"^MF-\d{4}$",
            "dosage_form_code": r"^DF-[A-Z]{3}$",
        }
        
        import re
        pattern = patterns.get(code_type)
        
        if not pattern:
            return False, f"Unknown code type: {code_type}"
        
        if not re.match(pattern, code):
            return False, f"Invalid {code_type} format. Expected pattern: {pattern}"
        
        return True, None


# Singleton instance
code_generator = CodeGenerator()
