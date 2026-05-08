export const locales = ['en', 'th'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'th'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  th: 'ไทย',
}

export type TranslationKey = keyof typeof en

export const en = {
  // Nav
  'nav.home': 'Home',
  'nav.products': 'Products',
  'nav.cart': 'Cart',
  'nav.admin': 'Admin',
  'nav.login': 'Login',
  
  // Vehicle filter
  'vehicle.select': 'Select Vehicle',
  'vehicle.make': 'Make',
  'vehicle.model': 'Model',
  'vehicle.year': 'Year',
  'vehicle.search': 'Search Parts',
  'vehicle.browse': 'Browse All',
  'vehicle.clear': 'Clear',
  
  // Products
  'products.title': 'Products',
  'products.all': 'All Products',
  'products.search': 'Search products...',
  'products.no_results': 'No products found',
  'products.add_to_cart': 'Add to Cart',
  'products.price': 'Price',
  'products.compare_price': 'Original Price',
  'products.stock': 'Stock',
  'products.in_stock': 'In Stock',
  'products.out_of_stock': 'Out of Stock',
  'products.category': 'Category',
  'products.sku': 'SKU',
  
  // Cart
  'cart.title': 'Shopping Cart',
  'cart.empty': 'Your cart is empty',
  'cart.total': 'Total',
  'cart.checkout': 'Checkout',
  'cart.remove': 'Remove',
  'cart.quantity': 'Qty',
  
  // Checkout
  'checkout.title': 'Checkout',
  'checkout.name': 'Full Name',
  'checkout.phone': 'Phone Number',
  'checkout.email': 'Email',
  'checkout.address': 'Shipping Address',
  'checkout.place_order': 'Place Order',
  'checkout.success': 'Order placed successfully!',
  'checkout.bank_info': 'Bank Transfer Information',
  'checkout.bank_name': 'Kasikorn Bank (KBank)',
  'checkout.bank_account': 'Account Number: xxx-x-xxxxx-x',
  'checkout.bank_holder': 'Account Name: CCRAUTO CO., LTD.',
  'checkout.upload_slip': 'Upload Payment Slip',
  
  // Admin
  'admin.title': 'Admin Dashboard',
  'admin.products': 'Products',
  'admin.categories': 'Categories',
  'admin.vehicles': 'Vehicles',
  'admin.orders': 'Orders',
  'admin.add': 'Add',
  'admin.edit': 'Edit',
  'admin.delete': 'Delete',
  'admin.save': 'Save',
  'admin.cancel': 'Cancel',
  'admin.confirm_delete': 'Are you sure?',
  'admin.product_add': 'Add Product',
  'admin.product_edit': 'Edit Product',
  'admin.name_th': 'Name (Thai)',
  'admin.name_en': 'Name (English)',
  'admin.desc_th': 'Description (Thai)',
  'admin.desc_en': 'Description (English)',
  'admin.images': 'Images',
  'admin.fitment': 'Vehicle Fitment',
  'admin.add_fitment': 'Add Fitment',
  
  // Footer
  'footer.contact': 'Contact Us',
  'footer.phone': 'Phone',
  'footer.email': 'Email',
  'footer.address': 'Address',
  'footer.hours': 'Mon-Sat 08:00 - 17:30',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.back': 'Back',
}

export const th: Record<TranslationKey, string> = {
  'nav.home': 'หน้าแรก',
  'nav.products': 'สินค้า',
  'nav.cart': 'ตะกร้า',
  'nav.admin': 'จัดการ',
  'nav.login': 'เข้าสู่ระบบ',
  
  'vehicle.select': 'เลือกรถยนต์',
  'vehicle.make': 'ยี่ห้อ',
  'vehicle.model': 'รุ่น',
  'vehicle.year': 'ปี',
  'vehicle.search': 'ค้นหาอะไหล่',
  'vehicle.browse': 'ดูทั้งหมด',
  'vehicle.clear': 'ล้าง',
  
  'products.title': 'สินค้า',
  'products.all': 'สินค้าทั้งหมด',
  'products.search': 'ค้นหาสินค้า...',
  'products.no_results': 'ไม่พบสินค้า',
  'products.add_to_cart': 'ใส่ตะกร้า',
  'products.price': 'ราคา',
  'products.compare_price': 'ราคาเดิม',
  'products.stock': 'สต็อก',
  'products.in_stock': 'มีสินค้า',
  'products.out_of_stock': 'สินค้าหมด',
  'products.category': 'หมวดหมู่',
  'products.sku': 'รหัสสินค้า',
  
  'cart.title': 'ตะกร้าสินค้า',
  'cart.empty': 'ตะกร้าของคุณว่างเปล่า',
  'cart.total': 'รวม',
  'cart.checkout': 'สั่งซื้อ',
  'cart.remove': 'ลบ',
  'cart.quantity': 'จำนวน',
  
  'checkout.title': 'ยืนยันคำสั่งซื้อ',
  'checkout.name': 'ชื่อ-นามสกุล',
  'checkout.phone': 'เบอร์โทรศัพท์',
  'checkout.email': 'อีเมล',
  'checkout.address': 'ที่อยู่จัดส่ง',
  'checkout.place_order': 'สั่งซื้อ',
  'checkout.success': 'สั่งซื้อสำเร็จ!',
  'checkout.bank_info': 'ข้อมูลการโอนเงิน',
  'checkout.bank_name': 'ธนาคารกสิกรไทย (KBank)',
  'checkout.bank_account': 'เลขที่บัญชี: xxx-x-xxxxx-x',
  'checkout.bank_holder': 'ชื่อบัญชี: บริษัท ซีซีอาร์ออโต้ จำกัด',
  'checkout.upload_slip': 'อัปโหลดสลิปโอนเงิน',
  
  'admin.title': 'แผงจัดการ',
  'admin.products': 'สินค้า',
  'admin.categories': 'หมวดหมู่',
  'admin.vehicles': 'รถยนต์',
  'admin.orders': 'คำสั่งซื้อ',
  'admin.add': 'เพิ่ม',
  'admin.edit': 'แก้ไข',
  'admin.delete': 'ลบ',
  'admin.save': 'บันทึก',
  'admin.cancel': 'ยกเลิก',
  'admin.confirm_delete': 'ยืนยันการลบ?',
  'admin.product_add': 'เพิ่มสินค้า',
  'admin.product_edit': 'แก้ไขสินค้า',
  'admin.name_th': 'ชื่อ (ภาษาไทย)',
  'admin.name_en': 'ชื่อ (ภาษาอังกฤษ)',
  'admin.desc_th': 'รายละเอียด (ภาษาไทย)',
  'admin.desc_en': 'รายละเอียด (ภาษาอังกฤษ)',
  'admin.images': 'รูปภาพ',
  'admin.fitment': 'รุ่นรถที่ใช้ได้',
  'admin.add_fitment': 'เพิ่มรุ่นรถ',
  
  'footer.contact': 'ติดต่อเรา',
  'footer.phone': 'โทรศัพท์',
  'footer.email': 'อีเมล',
  'footer.address': 'ที่อยู่',
  'footer.hours': 'จันทร์-เสาร์ 08:00 - 17:30',
  
  'common.loading': 'กำลังโหลด...',
  'common.error': 'เกิดข้อผิดพลาด',
  'common.success': 'สำเร็จ',
  'common.back': 'ย้อนกลับ',
}
