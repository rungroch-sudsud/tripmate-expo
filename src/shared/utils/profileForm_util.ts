export const validateFullName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    if (name !== trimmedName) {
      return 'ชื่อ-นามสกุลห้ามมีช่องว่างก่อนและหลัง';
    }
    
    if (!trimmedName) {
      return 'กรุณากรอกชื่อ-นามสกุล';
    }
    
    const specialCharRegex = /[^a-zA-Zก-๙\s]/;
    if (specialCharRegex.test(trimmedName)) {
      return 'ชื่อ-นามสกุลไม่สามารถมีอักขระพิเศษได้';
    }
    
    if (trimmedName.includes('  ')) {
      return 'ชื่อ-นามสกุลไม่สามารถมีช่องว่างมากกว่า 1 ช่องได้';
    }
    
    const parts = trimmedName.split(' ');
    if (parts.length !== 2) {
      return 'กรุณากรอกชื่อและนามสกุล คั่นด้วยช่องว่าง 1 ช่อง';
    }
    
    if (parts[0].length === 0 || parts[1].length === 0) {
      return 'กรุณากรอกชื่อและนามสกุลให้ครบถ้วน';
    }
    
    return null;
  };


export const validateNickname = (name: string): string | null => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      return 'กรุณากรอกชื่อเล่น';
    }
    
    if (name !== trimmed) {
      return 'ชื่อเล่นห้ามมีช่องว่างก่อนและหลัง';
    }
    
    if (trimmed.includes(' ')) {
      return 'ชื่อเล่นต้องเป็นคำเดียวโดยไม่มีช่องว่าง';
    }
    
    const specialCharRegex = /[^a-zA-Zก-๙]/;
    if (specialCharRegex.test(trimmed)) {
      return 'ชื่อเล่นสามารถประกอบด้วยตัวอักษรภาษาไทยหรืออังกฤษเท่านั้น';
    }
    
    return null;
  };

export  const validateAge = (age: string): string | null => {
    if (!age.trim()) {
      return 'กรุณากรอกอายุ';
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 0) {
      return 'อายุต้องเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0';
    }

    if (ageNum > 150) {
      return 'กรุณากรอกอายุที่ถูกต้อง';
    }

    return null;
  };

export  const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
      return 'กรุณากรอกอีเมล';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'รูปแบบอีเมลไม่ถูกต้อง';
    }

    return null;
  };


  export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone.trim()) {
    return 'กรุณากรอกหมายเลขโทรศัพท์';
  }
  
  if (!/^[0-9]{10}$/.test(phone)) {
    return 'กรุณากรอกหมายเลขโทรศัพท์ที่ถูกต้อง (10 หลัก)';
  }
  
  return null;
};
export  const validateFacebookUrl = (url: string): string | undefined => {
    if (!url.trim()) return undefined;
    
    const facebookUrlRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+/i;
    const usernameRegex = /^[a-zA-Z0-9.]{5,}$/;
    
    if (facebookUrlRegex.test(url) || usernameRegex.test(url)) {
      return undefined;
    }
    
    return "กรุณาใส่ Facebook URL ที่ถูกต้อง หรือ Username";
  };

export  const validateLineId = (lineId: string): string | undefined => {
    if (!lineId.trim()) return undefined;
    
    const lineIdRegex = /^[a-zA-Z0-9._-]{4,20}$/;
    
    if (lineIdRegex.test(lineId)) {
      return undefined;
    }
    
    return "LINE ID ต้องมี 4-20 ตัวอักษร และใช้ได้เฉพาะ a-z, 0-9, ., _, -";
  };
