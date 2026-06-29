export const PAYMENT_METHODS = [
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sublabel: 'Pay at Door (PKR 299 Fee)',
    icon: '🚚',
    bgColor: 'rgba(216,180,112,0.06)',
    borderColor: 'rgba(216,180,112,0.2)',
    textColor: '#D8B470',
    deliveryFee: 299,
    freeDelivery: false,
    available: true,
    accountTitle: '',
    accountNumber: '',
    iban: '',
    qrCode: '',
    instructions: {
      en: 'Pay standard shipping + order total cash to the courier rider upon delivery at your door.',
      ur: 'ڈلیوری کے وقت نقد رقم کوریئر رائڈر کو ادا کریں۔ آرڈر کی تصدیق فوری طور پر کی جائے گی۔'
    }
  },
  {
    id: 'hbl',
    label: 'HBL',
    sublabel: 'FREE Delivery 🎁',
    icon: '💚',
    bgColor: 'rgba(0,166,81,0.06)',
    borderColor: 'rgba(0,166,81,0.2)',
    textColor: '#00A651',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0004697901070703',
    iban: 'PK55HABB0004697901070703',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK55HABB0004697901070703',
    instructions: {
      en: 'Transfer the total order amount to our HBL Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے HBL کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'meezan',
    label: 'Meezan Bank',
    sublabel: 'FREE Delivery 🎁',
    icon: '👑',
    bgColor: 'rgba(135,31,79,0.06)',
    borderColor: 'rgba(135,31,79,0.2)',
    textColor: '#871F4F',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0012810107354095',
    iban: 'PK05MEZN0012810107354095',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK05MEZN0012810107354095',
    instructions: {
      en: 'Transfer the total order amount to our Meezan Bank Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے میزان بینک کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'ubl',
    label: 'UBL',
    sublabel: 'FREE Delivery 🎁',
    icon: '💙',
    bgColor: 'rgba(0,107,185,0.06)',
    borderColor: 'rgba(0,107,185,0.2)',
    textColor: '#0067B9',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0109000302165122',
    iban: 'PK15UNIL0109000302165122',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK15UNIL0109000302165122',
    instructions: {
      en: 'Transfer the total order amount to our UBL Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے UBL کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'allied',
    label: 'Allied Bank',
    sublabel: 'FREE Delivery 🎁',
    icon: '🔶',
    bgColor: 'rgba(244,121,32,0.06)',
    borderColor: 'rgba(244,121,32,0.2)',
    textColor: '#F47920',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0010065412980012',
    iban: 'PK45ABPA0010065412980012',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK45ABPA0010065412980012',
    instructions: {
      en: 'Transfer the total order amount to our Allied Bank Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے الائیڈ بینک کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'alfalah',
    label: 'Bank Alfalah',
    sublabel: 'FREE Delivery 🎁',
    icon: '🔴',
    bgColor: 'rgba(224,27,36,0.06)',
    borderColor: 'rgba(224,27,36,0.2)',
    textColor: '#E01B24',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '00231006543210',
    iban: 'PK91ALFH00231006543210',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK91ALFH00231006543210',
    instructions: {
      en: 'Transfer the total order amount to our Bank Alfalah Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے بینک الفلاح کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  }
];

export const getDeliveryFee = (methodId) =>
  PAYMENT_METHODS.find(m => m.id === methodId)?.deliveryFee ?? 299;
