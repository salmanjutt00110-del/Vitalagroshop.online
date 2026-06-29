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
    id: 'jsbank',
    label: 'JS Bank',
    sublabel: 'FREE Delivery 🎁',
    icon: '🏛️',
    bgColor: 'rgba(0,102,179,0.06)',
    borderColor: 'rgba(0,102,179,0.2)',
    textColor: '#0066B3',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '9077000001107064',
    iban: 'PK75JSBL9077000001107064',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK75JSBL9077000001107064',
    instructions: {
      en: 'Transfer the total order amount to our JS Bank Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے JS Bank کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
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
    id: 'bankalhabib',
    label: 'Bank AL Habib',
    sublabel: 'FREE Delivery 🎁',
    icon: '🏦',
    bgColor: 'rgba(0,114,54,0.06)',
    borderColor: 'rgba(0,114,54,0.2)',
    textColor: '#007236',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0139098100230301',
    iban: 'PK80BAHL0139098100230301',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK80BAHL0139098100230301',
    instructions: {
      en: 'Transfer the total order amount to our Bank AL Habib Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے Bank AL Habib کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'habibmetro',
    label: 'Habib Metropolitan',
    sublabel: 'FREE Delivery 🎁',
    icon: '🟣',
    bgColor: 'rgba(102,45,145,0.06)',
    borderColor: 'rgba(102,45,145,0.2)',
    textColor: '#662D91',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '0208027140267178',
    iban: 'PK39MPBL0208027140267178',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK39MPBL0208027140267178',
    instructions: {
      en: 'Transfer the total order amount to our Habib Metropolitan Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے Habib Metropolitan کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
    }
  },
  {
    id: 'mcb',
    label: 'MCB Bank',
    sublabel: 'FREE Delivery 🎁',
    icon: '🟠',
    bgColor: 'rgba(245,130,32,0.06)',
    borderColor: 'rgba(245,130,32,0.2)',
    textColor: '#F58220',
    deliveryFee: 0,
    freeDelivery: true,
    available: true,
    accountTitle: 'Vital Agro Chemical Industries (Pvt) Ltd',
    accountNumber: '1137058881007015',
    iban: 'PK38MUCB1137058881007015',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PK38MUCB1137058881007015',
    instructions: {
      en: 'Transfer the total order amount to our MCB Bank Corporate Account. Send screenshot proof of payment.',
      ur: 'کل رقم ہمارے MCB Bank کارپوریٹ اکاؤنٹ میں ٹرانسفر کریں۔ ادائیگی کے بعد سکرین شاٹ ثبوت اپ لوڈ کریں۔'
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
  }
];

export const getDeliveryFee = (methodId) =>
  PAYMENT_METHODS.find(m => m.id === methodId)?.deliveryFee ?? 299;
