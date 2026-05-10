/** Utility for generating codes in frontend (for preview/validation) */

export class CodeGenerator {
  /** Generate therapeutic class code */
  static generateClassCode(parentCode?: string): string {
    const prefix = 'TC';
    
    if (parentCode) {
      const parentSuffix = parentCode.includes('-') 
        ? parentCode.split('-').pop() 
        : parentCode;
      
      if (parentSuffix && /^\d+$/.test(parentSuffix)) {
        const newNumber = (parseInt(parentSuffix) + 1).toString().padStart(4, '0');
        return `${prefix}-${newNumber}`;
      } else if (parentSuffix) {
        const letters = parentSuffix.replace(/[^A-Za-z]/g, '');
        const digits = parentSuffix.replace(/[^0-9]/g, '');
        
        if (digits) {
          const newNumber = (parseInt(digits) + 1).toString().padStart(4, '0');
          return `${prefix}-${letters}${newNumber}`;
        } else {
          const randomNum = Math.floor(Math.random() * 9000) + 1000;
          return `${prefix}-${letters}${randomNum}`;
        }
      }
    }
    
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    return `${prefix}-${randomNum.toString().padStart(4, '0')}`;
  }

  /** Generate CAS number */
  static generateCasNumber(): string {
    const base = Math.floor(Math.random() * 89999992) + 10000000;
    const segment = Math.floor(Math.random() * 90) + 10;
    const checksum = Math.floor(Math.random() * 10);
    return `${base}-${segment}-${checksum}`;
  }

  /** Generate NDC number */
  static generateNdcNumber(): string {
    const labelerCode = Math.floor(Math.random() * 90000) + 10000;
    const productCode = Math.floor(Math.random() * 9000) + 1000;
    const packageCode = Math.floor(Math.random() * 90) + 10;
    return `${labelerCode}-${productCode}-${packageCode}`;
  }

  /** Generate EAN-13 barcode */
  static generateBarcode(): string {
    let base = '';
    for (let i = 0; i < 12; i++) {
      base += Math.floor(Math.random() * 10).toString();
    }
    
    // Calculate checksum (simplified)
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      const num = parseInt(base[i]);
      if ((i + 1) % 2 === 0) {
        total += num * 3;
      } else {
        total += num;
      }
    }
    const checksum = (10 - (total % 10)) % 10;
    
    return base + checksum.toString();
  }

  /** Generate ATC code */
  static generateAtcCode(parentCode?: string): string {
    if (parentCode) {
      if (parentCode.length < 5) {
        const lastChar = parentCode[parentCode.length - 1];
        if (/\d/.test(lastChar)) {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          return parentCode + letters[Math.floor(Math.random() * letters.length)];
        } else {
          return parentCode + Math.floor(Math.random() * 10).toString();
        }
      } else {
        const category = parentCode[0];
        return `${category}${Math.floor(Math.random() * 9000) + 1000}`;
      }
    }
    
    const anatomicalGroups = ['A', 'B', 'C', 'D', 'G', 'H', 'J', 'L', 'M', 'N', 'P', 'R', 'S', 'V'];
    const group = anatomicalGroups[Math.floor(Math.random() * anatomicalGroups.length)];
    return `${group}${(Math.floor(Math.random() * 99) + 1).toString().padStart(2, '0')}`;
  }

  /** Validate code format */
  static validateCode(code: string, codeType: string): { valid: boolean; error?: string } {
    const patterns: Record<string, RegExp> = {
      class_code: /^TC-[A-Z0-9]{4}$/,
      cas_number: /^\d{4,8}-\d{2}-\d$/,
      ndc_number: /^\d{5}-\d{4}-\d{2}$/,
      barcode: /^\d{13}$/,
      atc_code: /^[A-Z][A-Z0-9]{4}$/,
    };

    const pattern = patterns[codeType];
    
    if (!pattern) {
      return { valid: false, error: `Unknown code type: ${codeType}` };
    }
    
    if (!pattern.test(code)) {
      return { valid: false, error: `Invalid ${codeType} format` };
    }
    
    return { valid: true };
  }

  /** Get code pattern description */
  static getPatternDescription(codeType: string): string {
    const descriptions: Record<string, string> = {
      class_code: 'TC-XXXX (e.g., TC-0001)',
      cas_number: 'XXXXXXXX-XX-X (e.g., 50-78-2)',
      ndc_number: 'XXXXX-XXXX-XX (e.g., 50580-011-00)',
      barcode: '13 digits (e.g., 7891234567890)',
      atc_code: 'XXXXX (e.g., A01BA)',
    };

    return descriptions[codeType] || 'Unknown pattern';
  }
}
