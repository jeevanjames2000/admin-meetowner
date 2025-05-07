

export const numberToWords = (num: number): string => {
    // Ensure the number is an integer by removing decimal parts
    num = Math.floor(num);
  
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
    if (num === 0) return 'Zero';
  
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      
      if (n < 10) return ones[n];
      
      if (n < 20) return teens[n - 10];
      
      if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      }
      
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
  
    const convert = (n: number): string => {
      if (n === 0) return '';
  
      // Handle crores (10,000,000)
      if (n >= 10000000) {
        return convertLessThanThousand(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
      }
  
      // Handle lakhs (100,000)
      if (n >= 100000) {
        return convertLessThanThousand(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      }
  
      // Handle thousands (1,000)
      if (n >= 1000) {
        return convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convertLessThanThousand(n % 1000) : '');
      }
  
      // Handle numbers less than 1,000
      return convertLessThanThousand(n);
    };
  
    return convert(num).trim() + ' Rupees Only';
  };