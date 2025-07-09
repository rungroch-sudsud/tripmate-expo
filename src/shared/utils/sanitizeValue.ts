export  const sanitizeValue = (value: any): string => {
    if (value === "N/A" || value === null || value === undefined) {
      return '';
    }
    return String(value);
  };