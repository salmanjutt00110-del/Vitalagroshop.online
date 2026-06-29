import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='customer') # 'admin' or 'customer'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    wishlist = db.relationship('Wishlist', backref='user', lazy=True, cascade="all, delete-orphan")
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade="all, delete-orphan")
    scanner_history = db.relationship('ScannerHistory', backref='user', lazy=True, cascade="all, delete-orphan")
    chat_history = db.relationship('ChatHistory', backref='user', lazy=True, cascade="all, delete-orphan")

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.String(100), primary_key=True) # e.g. "fatty", "conference-gold"
    name_en = db.Column(db.String(255), nullable=False)
    name_ur = db.Column(db.String(255), nullable=True)
    name_json = db.Column(db.Text) # JSON mapping lang -> name
    generic_name_en = db.Column(db.String(255))
    generic_name_ur = db.Column(db.String(255))
    generic_name_json = db.Column(db.Text) # JSON mapping lang -> genericName
    slug = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(100), nullable=False, index=True)
    rating = db.Column(db.Float, default=4.5)
    active_ingredient = db.Column(db.String(255))
    formulation = db.Column(db.String(100))
    packaging = db.Column(db.String(255))
    product_code = db.Column(db.String(100))
    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float)
    stock_status = db.Column(db.String(50), default='In Stock')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # CRUD fields
    productDescription = db.Column(db.Text)
    baseImageURL = db.Column(db.String(512))
    variantImages = db.Column(db.Text) # JSON list of strings
    dynamicPricingMatrix = db.Column(db.Text) # JSON mapping sizes to prices
    stockInventory = db.Column(db.Integer, default=0)

    # --- Full catalog JSON fields for production ---
    tagline = db.Column(db.Text)
    short_desc_json = db.Column(db.Text)       # JSON {"en": "...", "ur": "..."}
    description_json = db.Column(db.Text)      # JSON {"en": "...", "ur": "..."}
    features_json = db.Column(db.Text)         # JSON {"en": [...], "ur": [...]}
    benefits_json = db.Column(db.Text)         # JSON {"en": [...], "ur": [...]}
    crops_json = db.Column(db.Text)            # JSON [{"name": {"en":"Cotton","ur":"..."}, "icon": "🌱"}, ...]
    application_json = db.Column(db.Text)      # JSON {"en": "...", "ur": "..."}
    specs_json = db.Column(db.Text)            # JSON {type, storage, shelf_life, compatibility, formType}
    sizes_json = db.Column(db.Text)            # JSON [{size, price, oldPrice, sku, weight, stockStatus}, ...]
    seo_title = db.Column(db.String(512))
    seo_description = db.Column(db.Text)
    png_url = db.Column(db.String(512))        # Primary product image path
    imported_formula_badge = db.Column(db.Boolean, default=False)
    premium_product_badge = db.Column(db.Boolean, default=False)
    research_based_badge = db.Column(db.Boolean, default=False)
    is_featured = db.Column(db.Boolean, default=False)
    is_visible = db.Column(db.Boolean, default=True)
    is_archived = db.Column(db.Boolean, default=False)
    sort_order = db.Column(db.Integer, default=0)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.String(100), primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)
    customer_name = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(100), nullable=False, index=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    province = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(100))
    address = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)
    # 8-state order lifecycle:
    # pending → confirmed → processing → packed → shipped → out_for_delivery → delivered | cancelled
    status = db.Column(db.String(50), default='pending', index=True)
    quantity = db.Column(db.Integer, default=1)
    total_amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(100), default='COD')
    tidString = db.Column(db.String(100))
    proofScreenshotURL = db.Column(db.String(512))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade="all, delete-orphan")
    payments = db.relationship('Payment', backref='order', lazy=True, cascade="all, delete-orphan")
    screenshots = db.relationship('PaymentScreenshot', backref='order', lazy=True, cascade="all, delete-orphan")

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.String(100), nullable=False, index=True)
    product_name = db.Column(db.String(255), nullable=False)
    pack_size = db.Column(db.String(50), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), db.ForeignKey('orders.id'), nullable=False, index=True)
    method = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending', index=True) # pending, approved, rejected, request_new
    transaction_ref = db.Column(db.String(255))
    timestamp = db.Column(db.String(100))
    receiver_wallet = db.Column(db.String(100))
    sender_name = db.Column(db.String(255))
    confidence_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class PaymentScreenshot(db.Model):
    __tablename__ = 'payment_screenshots'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(100), db.ForeignKey('orders.id'), nullable=False, index=True)
    file_path = db.Column(db.String(512))
    base64_data = db.Column(db.Text)
    ocr_report = db.Column(db.Text) # JSON string
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(100), nullable=False, index=True)
    user_name = db.Column(db.String(255), nullable=False)
    rating = db.Column(db.Integer, default=5)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Wishlist(db.Model):
    __tablename__ = 'wishlist'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.String(100), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class CartItem(db.Model):
    __tablename__ = 'cart'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    product_id = db.Column(db.String(100), nullable=False, index=True)
    quantity = db.Column(db.Integer, default=1)
    size = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ScannerHistory(db.Model):
    __tablename__ = 'scanner_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    crop_type = db.Column(db.String(255))
    diagnosis = db.Column(db.Text)
    recommended_treatment = db.Column(db.Text)
    base64_image = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ChatHistory(db.Model):
    __tablename__ = 'chat_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), index=True)
    role = db.Column(db.String(50), nullable=False) # 'user', 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(100)) # "new_order", "payment_uploaded", "new_message", "dealer_application"
    title = db.Column(db.String(255))
    message = db.Column(db.Text, nullable=False)
    reference_id = db.Column(db.String(255))  # e.g. order_id, message_id
    read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Coupon(db.Model):
    __tablename__ = 'coupons'
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(100), unique=True, nullable=False)
    discount_percent = db.Column(db.Float, nullable=False)
    active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Inventory(db.Model):
    __tablename__ = 'inventory'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.String(100), nullable=False, index=True)
    size = db.Column(db.String(50), nullable=False)
    stock = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class AdminLog(db.Model):
    __tablename__ = 'admin_logs'
    id = db.Column(db.Integer, primary_key=True)
    admin_user = db.Column(db.String(255), nullable=False)
    action = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class BankAccount(db.Model):
    __tablename__ = 'bank_accounts'
    id = db.Column(db.Integer, primary_key=True)
    bank_name = db.Column(db.String(255), nullable=False)
    account_title = db.Column(db.String(255), nullable=False)
    account_number = db.Column(db.String(255), nullable=False)
    iban = db.Column(db.String(255))
    qr_code = db.Column(db.Text)
    instructions = db.Column(db.Text)
    status = db.Column(db.String(50), default='Active')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(100))
    subject = db.Column(db.String(255))
    text = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), default='Unread')
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class DealerApplication(db.Model):
    __tablename__ = 'dealer_applications'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    business_name = db.Column(db.String(255))
    city = db.Column(db.String(100))
    phone = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255))
    experience = db.Column(db.Text)
    current_brands = db.Column(db.Text)
    coverage_area = db.Column(db.String(255))
    status = db.Column(db.String(50), default='Pending') # Pending, Approved, Rejected
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class HeroSlide(db.Model):
    __tablename__ = 'hero_slides'
    id = db.Column(db.Integer, primary_key=True)
    title_json = db.Column(db.Text, nullable=False)      # JSON: {"en": "...", "ur": "...", "pn": "...", "roman": "..."}
    subtitle_json = db.Column(db.Text, nullable=False)   # JSON: {"en": "...", "ur": "...", "pn": "...", "roman": "..."}
    image_url = db.Column(db.String(512), nullable=False)
    link = db.Column(db.String(512))
    sort_order = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class WebsiteSetting(db.Model):
    __tablename__ = 'website_settings'
    key = db.Column(db.String(100), primary_key=True)
    value_json = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False) # 'bug', 'suggestion', 'feature', 'general', 'payment', 'website'
    message = db.Column(db.Text, nullable=False)
    image_base64 = db.Column(db.Text)
    audio_base64 = db.Column(db.Text)
    status = db.Column(db.String(50), default='Open') # 'Open', 'Resolved'
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class VisitorLog(db.Model):
    __tablename__ = 'visitor_logs'
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(100))
    visit_date = db.Column(db.Date, default=datetime.date.today)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

