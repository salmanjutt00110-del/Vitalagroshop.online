import os
import time
import datetime
import json
import base64
import jwt
from threading import Lock
from functools import wraps
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Product, Order, OrderItem, Payment, PaymentScreenshot, Review, Wishlist, CartItem, ScannerHistory, ChatHistory, Notification, Coupon, Inventory, AdminLog, BankAccount, ContactMessage, DealerApplication, HeroSlide, WebsiteSetting, Feedback, VisitorLog

app = Flask(__name__)
CORS(app)

# Load secret keys
JWT_SECRET = os.environ.get("JWT_SECRET", "super_premium_secure_jwt_secret_token_12345")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL") or os.environ.get("VITE_ADMIN_EMAIL", "vitalagro4@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or os.environ.get("VITE_ADMIN_PASSWORD", "Bsfood$44")
GEMINI_API_KEY = os.environ.get("VITE_GEMINI_API_KEY") or os.environ.get("GEMINI_API_KEY", "")

# Thread-safe local rate limiter dictionary to avoid redis dependency
ip_request_times = {}
rate_limiter_lock = Lock()
RATE_LIMIT_MAX = 60 # 60 requests per minute
RATE_LIMIT_WINDOW = 60 # seconds

# Configuration: PostgreSQL with SQLite fallback
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
else:
    # Always resolve to the backend/instance folder to keep DB paths consistent
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, "instance", "vital_agro.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# Create tables and load mock products if database is fresh
with app.app_context():
    db.create_all()

# Utility functions
def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def log_admin_action(admin_user, action):
    try:
        log = AdminLog(admin_user=admin_user, action=action, ip_address=request.remote_addr)
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print("Log error:", e)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
        else:
            return jsonify({"error": "Unauthorized"}), 401
        
        user_data = verify_token(token)
        if not user_data:
            return jsonify({"error": "Invalid or expired token"}), 401
        
        request.user = user_data
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if token and token.startswith("Bearer "):
            token = token.split(" ")[1]
        else:
            return jsonify({"error": "Unauthorized"}), 401
        
        user_data = verify_token(token)
        if not user_data or user_data.get("role") != "admin":
            return jsonify({"error": "Admin privileges required"}), 403
        
        request.user = user_data
        return f(*args, **kwargs)
    return decorated

# Simple Rate Limiter Middleware
@app.before_request
def rate_limit():
    ip = request.remote_addr
    now = time.time()
    with rate_limiter_lock:
        if ip not in ip_request_times:
            ip_request_times[ip] = []
        
        # Filter request timestamps older than rate limit window
        ip_request_times[ip] = [t for t in ip_request_times[ip] if now - t < RATE_LIMIT_WINDOW]
        
        if len(ip_request_times[ip]) >= RATE_LIMIT_MAX:
            return jsonify({"error": "Too many requests. Please try again in a minute."}), 429
        
        ip_request_times[ip].append(now)
        
    # Dynamic daily visitor telemetry log (exclude static assets)
    if request.path.startswith("/api/"):
        try:
            today = datetime.date.today()
            existing = VisitorLog.query.filter_by(ip_address=ip, visit_date=today).first()
            if not existing:
                log = VisitorLog(ip_address=ip, visit_date=today)
                db.session.add(log)
                db.session.commit()
        except Exception as e:
            print("Visitor tracking error:", e)

# Authentication Endpoints
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User already exists"}), 400
    
    hashed_pwd = generate_password_hash(password)
    user = User(email=email, password_hash=hashed_pwd, role="customer")
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    # Check Admin Credentials via environment configs
    if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
        payload = {
            "user_id": "admin-uid",
            "email": email,
            "role": "admin",
            "exp": time.time() + 86400 # 24 hours
        }
        token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
        log_admin_action(email, "Administrative login session initialized")
        return jsonify({
            "token": token,
            "user": {"email": email, "id": "admin-uid", "role": "admin"}
        }), 200
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 400
    
    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "exp": time.time() + 86400
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return jsonify({
        "token": token,
        "user": {"email": user.email, "id": user.id, "role": user.role}
    }), 200

@app.route("/api/auth/me", methods=["GET"])
@login_required
def auth_me():
    return jsonify({"user": request.user}), 200

# UPLOAD FOLDER CONFIGURATION FOR PRODUCT IMAGES
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "uploads"))
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Products Endpoints
@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    output = []
    for p in products:
        output.append({
            "id": p.id,
            "name": {"en": p.name_en, "ur": p.name_ur or p.name_en},
            "genericName": {"en": p.generic_name_en or "Biotech Synthesis", "ur": p.generic_name_ur or "بائیوٹیک فارمولا"},
            "slug": p.slug,
            "category": p.category,
            "rating": p.rating or 4.9,
            "activeIngredient": p.active_ingredient or "Organic Synthesis Matrix",
            "formulation": p.formulation or "SL",
            "packaging": p.packaging or "500ml",
            "productCode": p.product_code or f"VA-{p.id.upper()}",
            "price": p.price,
            "oldPrice": p.old_price,
            "stockStatus": p.stock_status or ("In Stock" if p.stockInventory > 0 else "Out of Stock"),
            
            # Trillion-Dollar CRUD updates
            "productName": p.name_en,
            "productCategory": p.category,
            "productDescription": p.productDescription or "",
            "baseImageURL": p.baseImageURL or "",
            "variantImages": json.loads(p.variantImages) if p.variantImages else [],
            "dynamicPricingMatrix": json.loads(p.dynamicPricingMatrix) if p.dynamicPricingMatrix else {},
            "stockInventory": p.stockInventory or 0
        })
    return jsonify(output), 200

@app.route("/api/products/<product_id>", methods=["GET"])
def get_product_details(product_id):
    p = Product.query.filter_by(id=product_id).first()
    if not p:
        return jsonify({"error": "Product not found"}), 404
    return jsonify({
        "id": p.id,
        "name": {"en": p.name_en, "ur": p.name_ur or p.name_en},
        "genericName": {"en": p.generic_name_en or "Biotech Synthesis", "ur": p.generic_name_ur or "بائیوٹیک فارمولا"},
        "slug": p.slug,
        "category": p.category,
        "rating": p.rating or 4.9,
        "activeIngredient": p.active_ingredient or "Organic Synthesis Matrix",
        "formulation": p.formulation or "SL",
        "packaging": p.packaging or "500ml",
        "productCode": p.product_code or f"VA-{p.id.upper()}",
        "price": p.price,
        "oldPrice": p.old_price,
        "stockStatus": p.stock_status or ("In Stock" if p.stockInventory > 0 else "Out of Stock"),
        
        # Trillion-Dollar CRUD updates
        "productName": p.name_en,
        "productCategory": p.category,
        "productDescription": p.productDescription or "",
        "baseImageURL": p.baseImageURL or "",
        "variantImages": json.loads(p.variantImages) if p.variantImages else [],
        "dynamicPricingMatrix": json.loads(p.dynamicPricingMatrix) if p.dynamicPricingMatrix else {},
        "stockInventory": p.stockInventory or 0
    }), 200

@app.route("/api/products", methods=["POST"])
@admin_required
def create_product():
    data = {}
    if request.content_type and "multipart/form-data" in request.content_type:
        p_id = request.form.get("id", "").strip().lower()
        product_name = request.form.get("productName", "").strip()
        product_category = request.form.get("productCategory", "").strip()
        product_description = request.form.get("productDescription", "").strip()
        stock_inventory = int(request.form.get("stockInventory", 0))
        dynamic_pricing_str = request.form.get("dynamicPricingMatrix", "{}")
        
        # Save base image file
        base_image_url = ""
        base_image_file = request.files.get("baseImage")
        if base_image_file:
            ext = base_image_file.filename.split(".")[-1]
            filename = f"{p_id}_base_{int(time.time())}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            base_image_file.save(filepath)
            base_image_url = f"/uploads/{filename}"
            
        variant_images_list = []
        for i in range(5):
            var_file = request.files.get(f"variantImage_{i}")
            if var_file:
                ext = var_file.filename.split(".")[-1]
                v_filename = f"{p_id}_var_{i}_{int(time.time())}.{ext}"
                v_filepath = os.path.join(UPLOAD_FOLDER, v_filename)
                var_file.save(v_filepath)
                variant_images_list.append(f"/uploads/{v_filename}")
        variant_images_str = json.dumps(variant_images_list)
        p_src = request.form
    else:
        data = request.get_json() or {}
        p_id = data.get("id", "").strip().lower()
        product_name = data.get("productName", "").strip()
        product_category = data.get("productCategory", "").strip()
        product_description = data.get("productDescription", "").strip()
        stock_inventory = int(data.get("stockInventory", 0))
        dynamic_pricing_str = json.dumps(data.get("dynamicPricingMatrix", {}))
        base_image_url = data.get("baseImageURL", "")
        variant_images_str = json.dumps(data.get("variantImages", []))
        p_src = data

    if not p_id or not product_name:
        return jsonify({"error": "Product ID and Product Name are required"}), 400

    try:
        pricing_matrix = json.loads(dynamic_pricing_str)
    except Exception:
        pricing_matrix = {}
    
    core_price = 999.0
    if pricing_matrix:
        prices = list(pricing_matrix.values())
        if prices:
            core_price = float(prices[0])

    existing = Product.query.filter_by(id=p_id).first()
    if existing:
        return jsonify({"error": f"Product with ID '{p_id}' already exists"}), 400

    tagline = p_src.get("tagline", "")
    short_desc = p_src.get("shortDesc", "")
    desc_json = p_src.get("description", "")
    features = p_src.get("features", "")
    benefits = p_src.get("benefits", "")
    crops = p_src.get("crops", "")
    specs = p_src.get("specs", "")
    sizes = p_src.get("sizes", "")
    name_json_val = p_src.get("name", "")
    generic_json_val = p_src.get("genericName", "")

    def to_json_str(val, default="{}"):
        if not val:
            return default
        if isinstance(val, (dict, list)):
            return json.dumps(val)
        return val

    new_prod = Product(
        id=p_id,
        name_en=product_name,
        name_ur=p_src.get("name_ur") or (json.loads(name_json_val).get("ur") if name_json_val and isinstance(name_json_val, str) and name_json_val.startswith("{") else (name_json_val.get("ur") if isinstance(name_json_val, dict) else product_name)),
        name_json=to_json_str(name_json_val, json.dumps({"en": product_name})),
        generic_name_json=to_json_str(generic_json_val, json.dumps({"en": "Biotech Formulation"})),
        slug=p_id,
        category=product_category,
        price=core_price,
        stock_status="In Stock" if stock_inventory > 0 else "Out of Stock",
        productDescription=product_description,
        baseImageURL=base_image_url,
        variantImages=variant_images_str,
        dynamicPricingMatrix=dynamic_pricing_str,
        stockInventory=stock_inventory,
        tagline=tagline,
        short_desc_json=to_json_str(short_desc),
        description_json=to_json_str(desc_json),
        features_json=to_json_str(features),
        benefits_json=to_json_str(benefits),
        crops_json=to_json_str(crops, "[]"),
        specs_json=to_json_str(specs),
        sizes_json=to_json_str(sizes, "[]"),
        png_url=p_src.get("pngUrl") or p_src.get("png_url") or base_image_url,
        is_featured=p_src.get("is_featured") == "true" or p_src.get("is_featured") == True,
        is_visible=p_src.get("is_visible") != "false" and p_src.get("is_visible") != False,
        is_archived=p_src.get("is_archived") == "true" or p_src.get("is_archived") == True,
        sort_order=int(p_src.get("sort_order", 0))
    )
    db.session.add(new_prod)
    db.session.commit()

    log = AdminLog(admin_user=request.user.get("email", "admin"), action=f"Synthesized product {product_name} ({p_id})")
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Product synthesized successfully", "id": p_id}), 201

@app.route("/api/products/<product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    p = Product.query.filter_by(id=product_id).first()
    if not p:
        return jsonify({"error": "Product not found"}), 404

    data = {}
    if request.content_type and "multipart/form-data" in request.content_type:
        product_name = request.form.get("productName", p.name_en).strip()
        product_category = request.form.get("productCategory", p.category).strip()
        product_description = request.form.get("productDescription", p.productDescription).strip()
        stock_inventory = int(request.form.get("stockInventory", p.stockInventory or 0))
        dynamic_pricing_str = request.form.get("dynamicPricingMatrix", p.dynamicPricingMatrix or "{}")
        
        base_image_file = request.files.get("baseImage")
        if base_image_file:
            ext = base_image_file.filename.split(".")[-1]
            filename = f"{product_id}_base_{int(time.time())}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            base_image_file.save(filepath)
            p.baseImageURL = f"/uploads/{filename}"
            
        variant_images_list = json.loads(p.variantImages) if p.variantImages else []
        for i in range(5):
            var_file = request.files.get(f"variantImage_{i}")
            if var_file:
                ext = var_file.filename.split(".")[-1]
                v_filename = f"{product_id}_var_{i}_{int(time.time())}.{ext}"
                v_filepath = os.path.join(UPLOAD_FOLDER, v_filename)
                var_file.save(v_filepath)
                variant_images_list.append(f"/uploads/{v_filename}")
        p.variantImages = json.dumps(variant_images_list)
        p_src = request.form
    else:
        data = request.get_json() or {}
        product_name = data.get("productName", p.name_en).strip()
        product_category = data.get("productCategory", p.category).strip()
        product_description = data.get("productDescription", p.productDescription).strip()
        stock_inventory = int(data.get("stockInventory", p.stockInventory or 0))
        dynamic_pricing_str = json.dumps(data.get("dynamicPricingMatrix", {}))
        if "baseImageURL" in data:
            p.baseImageURL = data.get("baseImageURL")
        if "variantImages" in data:
            p.variantImages = json.dumps(data.get("variantImages", []))
        p_src = data

    p.name_en = product_name
    p.category = product_category
    p.productDescription = product_description
    p.stockInventory = stock_inventory
    p.dynamicPricingMatrix = dynamic_pricing_str
    p.stock_status = "In Stock" if stock_inventory > 0 else "Out of Stock"

    try:
        pricing_matrix = json.loads(dynamic_pricing_str)
    except Exception:
        pricing_matrix = {}
    
    if pricing_matrix:
        prices = list(pricing_matrix.values())
        if prices:
            p.price = float(prices[0])

    def to_json_str(val, default="{}"):
        if not val:
            return default
        if isinstance(val, (dict, list)):
            return json.dumps(val)
        return val

    if "tagline" in p_src:
        p.tagline = p_src.get("tagline")
    if "shortDesc" in p_src:
        p.short_desc_json = to_json_str(p_src.get("shortDesc"))
    if "description" in p_src or "description_json" in p_src:
        p.description_json = to_json_str(p_src.get("description") or p_src.get("description_json"))
    if "features" in p_src:
        p.features_json = to_json_str(p_src.get("features"))
    if "benefits" in p_src:
        p.benefits_json = to_json_str(p_src.get("benefits"))
    if "crops" in p_src:
        p.crops_json = to_json_str(p_src.get("crops"), "[]")
    if "specs" in p_src:
        p.specs_json = to_json_str(p_src.get("specs"))
    if "sizes" in p_src:
        p.sizes_json = to_json_str(p_src.get("sizes"), "[]")
    if "name" in p_src:
        p.name_json = to_json_str(p_src.get("name"))
        p.name_ur = p_src.get("name_ur") or (json.loads(to_json_str(p_src.get("name"))).get("ur") if isinstance(p_src.get("name"), str) and p_src.get("name").startswith("{") else (p_src.get("name").get("ur") if isinstance(p_src.get("name"), dict) else product_name))
    if "genericName" in p_src:
        p.generic_name_json = to_json_str(p_src.get("genericName"))
    if "pngUrl" in p_src or "png_url" in p_src:
        p.png_url = p_src.get("pngUrl") or p_src.get("png_url")
    if "is_featured" in p_src:
        p.is_featured = p_src.get("is_featured") == "true" or p_src.get("is_featured") == True
    if "is_visible" in p_src:
        p.is_visible = p_src.get("is_visible") != "false" and p_src.get("is_visible") != False
    if "is_archived" in p_src:
        p.is_archived = p_src.get("is_archived") == "true" or p_src.get("is_archived") == True
    if "sort_order" in p_src:
        p.sort_order = int(p_src.get("sort_order", 0))

    db.session.commit()

    log = AdminLog(admin_user=request.user.get("email", "admin"), action=f"Modified product parameters for {product_name} ({product_id})")
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Product details customized successfully"}), 200

@app.route("/api/products/<product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    p = Product.query.filter_by(id=product_id).first()
    if not p:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(p)
    db.session.commit()

    log = AdminLog(admin_user=request.user.get("email", "admin"), action=f"Purged product {product_id} from database registry")
    db.session.add(log)
    db.session.commit()

    return jsonify({"message": "Product purged from ledger successfully"}), 200

# Orders API
@app.route("/api/orders", methods=["POST"])
def place_order():
    is_multipart = request.content_type and "multipart/form-data" in request.content_type
    
    if is_multipart:
        customer_name = request.form.get("customerName")
        customer_phone = request.form.get("customerPhone")
        customer_city = request.form.get("customerCity")
        customer_province = request.form.get("customerProvince")
        customer_postal = request.form.get("customerPostalCode")
        customer_address = request.form.get("customerAddress")
        customer_instructions = request.form.get("customerInstructions", "")
        payment_method = request.form.get("paymentMethod", "cod")
        
        grand_total = float(request.form.get("grandTotal", 0))
        total_amount = grand_total
        
        payment_tid = request.form.get("paymentTID", "")
        selected_bank_iban = request.form.get("selectedBankIBAN", "")
        advance_amount = float(request.form.get("advanceAmount", 299))
        
        product_id = request.form.get("productId")
        product_name = request.form.get("productName")
        pack_size = request.form.get("packSize")
        quantity = int(request.form.get("quantity", 1))
        price = float(request.form.get("price", 0))
        
        cart_items_str = request.form.get("cartItems")
        cart_items = []
        if cart_items_str:
            try:
                cart_items = json.loads(cart_items_str)
            except Exception:
                pass
                
        order_id = request.form.get("id") or f"va-order-{int(time.time())}"
        
        if not customer_name or not customer_phone:
            return jsonify({"error": "Missing customer name or phone"}), 400
    else:
        data = request.get_json() or {}
        customer = data.get("customer", {})
        item = data.get("item", {})
        
        if not customer or not item:
            return jsonify({"error": "Missing customer or item payload parameters"}), 400
            
        customer_name = customer.get("name")
        customer_phone = customer.get("phone")
        customer_city = customer.get("city")
        customer_province = customer.get("province")
        customer_postal = customer.get("postalCode")
        customer_address = customer.get("address")
        customer_instructions = customer.get("specialInstructions", "")
        payment_method = data.get("paymentMethod", "COD")
        
        grand_total = data.get("totalAmount") or data.get("grandTotal") or 0
        total_amount = grand_total
        
        payment_tid = data.get("paymentTID") or (data.get("paymentDetails").get("refId") if data.get("paymentDetails") else "")
        selected_bank_iban = data.get("selectedBankIBAN") or ""
        advance_amount = data.get("advanceAmount") or (299 if payment_method.lower() == 'cod' else grand_total)
        
        product_id = item.get("productId")
        product_name = item.get("productName")
        pack_size = item.get("packSize")
        quantity = item.get("quantity", 1)
        price = item.get("price", 0)
        cart_items = []
        
        order_id = data.get("id") or f"va-order-{int(time.time())}"

    # Generate sequential Order ID VA-YYYY-NNNN
    year = datetime.datetime.utcnow().year
    order_count = Order.query.count() + 1
    order_number = f"VA-{year}-{str(order_count).zfill(4)}"
    
    # Save base64 / screenshot if exists
    screenshot_file = request.files.get("screenshot") if is_multipart else None
    screenshot_base64 = None
    proof_screenshot_url = None
    
    if screenshot_file:
        try:
            ext = screenshot_file.filename.split(".")[-1]
            filename = f"{order_id}_proof_{int(time.time())}.{ext}"
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            
            # Read first to get base64
            screenshot_bytes = screenshot_file.read()
            screenshot_base64 = base64.b64encode(screenshot_bytes).decode('utf-8')
            
            # Save file on disk
            with open(filepath, "wb") as f:
                f.write(screenshot_bytes)
                
            proof_screenshot_url = f"/uploads/{filename}"
        except Exception as e:
            print("Failed to save order receipt screenshot:", e)
            
    # For JSON request fallback
    if not is_multipart:
        payment_details_data = data.get("paymentDetails")
        if payment_details_data:
            screenshot_base64 = payment_details_data.get("receiptBase64")
            
    new_order = Order(
        id=order_id,
        order_number=order_number,
        customer_name=customer_name,
        phone=customer_phone,
        city=customer_city,
        province=customer_province,
        postal_code=customer_postal,
        address=customer_address,
        notes=customer_instructions,
        status="pending",
        quantity=quantity if not cart_items else sum(c.get("quantity", 1) for c in cart_items),
        total_amount=total_amount,
        payment_method=payment_method,
        tidString=payment_tid,
        proofScreenshotURL=proof_screenshot_url
    )
    
    if cart_items:
        for c_item in cart_items:
            oi = OrderItem(
                order_id=order_id,
                product_id=c_item.get("id") or "",
                product_name=c_item.get("name") or "",
                pack_size=c_item.get("size") or "",
                quantity=c_item.get("quantity", 1),
                price=c_item.get("price", 0)
            )
            db.session.add(oi)
    else:
        order_item = OrderItem(
            order_id=order_id,
            product_id=product_id or "",
            product_name=product_name or "",
            pack_size=pack_size or "",
            quantity=quantity,
            price=price
        )
        db.session.add(order_item)
        
    # Create Payment entry
    new_payment = Payment(
        order_id=order_id,
        method=payment_method,
        amount=advance_amount,
        status="pending",
        transaction_ref=payment_tid,
        timestamp=datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
        receiver_wallet=selected_bank_iban
    )
    db.session.add(new_payment)
    
    # Save screenshot entry if exists
    if screenshot_base64:
        new_screenshot = PaymentScreenshot(
            order_id=order_id,
            base64_data=screenshot_base64,
            file_path=proof_screenshot_url,
            ocr_report=json.dumps({
                "refId": payment_tid,
                "amount": advance_amount,
                "paymentMethod": payment_method
            })
        )
        db.session.add(new_screenshot)
        
    db.session.add(new_order)
    
    # Create notification for admin
    if screenshot_base64:
        notif_type = "payment_uploaded"
        notif_title = "New Payment Proof"
        notif_msg = f"Payment proof uploaded for Order {order_number} by {customer_name} (PKR {advance_amount})."
    else:
        notif_type = "new_order"
        notif_title = "New Order Placed"
        notif_msg = f"Order {order_number} has been placed by {customer_name} for PKR {total_amount}."
        
    notif = Notification(
        type=notif_type,
        title=notif_title,
        message=notif_msg,
        reference_id=order_id
    )
    db.session.add(notif)
    db.session.commit()
    
    # Notify Admin Log
    admin_log = AdminLog(admin_user="system", action=f"Order {order_number} was successfully placed")
    db.session.add(admin_log)
    db.session.commit()
    
    return jsonify({"message": "Order created successfully", "order_id": order_id, "order_number": order_number}), 201

@app.route("/api/orders/<order_id>", methods=["GET"])
def get_order(order_id):
    order = Order.query.filter_by(id=order_id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404
        
    order_items = OrderItem.query.filter_by(order_id=order_id).all()
    payment = Payment.query.filter_by(order_id=order_id).first()
    screenshot = PaymentScreenshot.query.filter_by(order_id=order_id).first()
    
    payment_details = None
    if payment:
        payment_details = {
            "refId": payment.transaction_ref,
            "amountPaid": payment.amount,
            "status": payment.status,
            "timestamp": payment.timestamp,
            "receiverWallet": payment.receiver_wallet,
            "senderName": payment.sender_name,
            "confidenceScore": payment.confidence_score,
            "receiptBase64": screenshot.base64_data if screenshot else None
        }
        
    return jsonify({
        "id": order.id,
        "orderNumber": order.order_number,
        "status": order.status,
        "paymentMethod": order.payment_method,
        "totalAmount": order.total_amount,
        "createdAt": order.created_at.isoformat() + "Z",
        "updatedAt": order.updated_at.isoformat() + "Z",
        "customer": {
            "name": order.customer_name,
            "phone": order.phone,
            "city": order.city,
            "province": order.province,
            "postalCode": order.postal_code,
            "address": order.address,
            "specialInstructions": order.notes
        },
        "item": {
            "productId": order_items[0].product_id if order_items else "",
            "productName": order_items[0].product_name if order_items else "",
            "packSize": order_items[0].pack_size if order_items else "",
            "quantity": order_items[0].quantity if order_items else 1,
            "price": order_items[0].price if order_items else 0
        },
        "items": [
            {
                "productId": item.product_id,
                "productName": item.product_name,
                "packSize": item.pack_size,
                "quantity": item.quantity,
                "price": item.price
            } for item in order_items
        ],
        "paymentDetails": payment_details
    }), 200

@app.route("/api/orders/track/<order_number>", methods=["GET"])
def track_order(order_number):
    order = Order.query.filter_by(order_number=order_number).first()
    if not order:
        order = Order.query.filter_by(id=order_number).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404
        
    order_item = OrderItem.query.filter_by(order_id=order.id).first()
    payment = Payment.query.filter_by(order_id=order.id).first()
    screenshot = PaymentScreenshot.query.filter_by(order_id=order.id).first()
    
    payment_details = None
    if payment:
        payment_details = {
            "refId": payment.transaction_ref,
            "amountPaid": payment.amount,
            "status": payment.status,
            "timestamp": payment.timestamp,
            "receiverWallet": payment.receiver_wallet,
            "senderName": payment.sender_name,
            "confidenceScore": payment.confidence_score,
            "receiptBase64": screenshot.base64_data if screenshot else None
        }
        
    return jsonify({
        "id": order.id,
        "orderNumber": order.order_number,
        "status": order.status,
        "paymentMethod": order.payment_method,
        "totalAmount": order.total_amount,
        "proofScreenshotURL": order.proofScreenshotURL,
        "tidString": order.tidString,
        "createdAt": order.created_at.isoformat() + "Z",
        "updatedAt": order.updated_at.isoformat() + "Z",
        "customer": {
            "name": order.customer_name,
            "phone": order.phone,
            "city": order.city,
            "province": order.province,
            "postalCode": order.postal_code,
            "address": order.address,
            "specialInstructions": order.notes
        },
        "item": {
            "productId": order_item.product_id if order_item else "",
            "productName": order_item.product_name if order_item else "",
            "packSize": order_item.pack_size if order_item else "",
            "quantity": order_item.quantity if order_item else 1,
            "price": order_item.price if order_item else 0
        },
        "paymentDetails": payment_details
    }), 200

@app.route("/api/orders", methods=["GET"])
@admin_required
def list_orders():
    orders = Order.query.all()
    output = []
    for order in orders:
        order_items = OrderItem.query.filter_by(order_id=order.id).all()
        payment = Payment.query.filter_by(order_id=order.id).first()
        screenshot = PaymentScreenshot.query.filter_by(order_id=order.id).first()
        
        payment_details = None
        if payment:
            payment_details = {
                "refId": payment.transaction_ref,
                "amountPaid": payment.amount,
                "status": payment.status,
                "timestamp": payment.timestamp,
                "receiverWallet": payment.receiver_wallet,
                "senderName": payment.sender_name,
                "confidenceScore": payment.confidence_score,
                "receiptBase64": screenshot.base64_data if screenshot else None
            }
            
        output.append({
            "id": order.id,
            "orderNumber": order.order_number,
            "status": order.status,
            "paymentMethod": order.payment_method,
            "totalAmount": order.total_amount,
            "createdAt": order.created_at.isoformat() + "Z",
            "updatedAt": order.updated_at.isoformat() + "Z",
            "customer": {
                "name": order.customer_name,
                "phone": order.phone,
                "city": order.city,
                "province": order.province,
                "address": order.address,
                "specialInstructions": order.notes
            },
            "item": {
                "productName": order_items[0].product_name if order_items else "",
                "packSize": order_items[0].pack_size if order_items else "",
                "quantity": order_items[0].quantity if order_items else 1,
                "price": order_items[0].price if order_items else 0
            },
            "items": [
                {
                    "productId": item.product_id,
                    "productName": item.product_name,
                    "packSize": item.pack_size,
                    "quantity": item.quantity,
                    "price": item.price
                } for item in order_items
            ],
            "paymentDetails": payment_details
        })
    # Sort orders by created date descending
    output.sort(key=lambda x: x["createdAt"], reverse=True)
    return jsonify(output), 200

@app.route("/api/orders/<order_id>/status", methods=["PUT"])
@admin_required
def update_order_status(order_id):
    order = Order.query.filter_by(id=order_id).first()
    if not order:
        return jsonify({"error": "Order not found"}), 404
        
    data = request.get_json() or {}
    new_status = data.get("status")
    
    if new_status:
        order.status = new_status
        
    payment_details_data = data.get("paymentDetails")
    if payment_details_data:
        payment = Payment.query.filter_by(order_id=order_id).first()
        if payment:
            payment.status = payment_details_data.get("status", payment.status)
            payment.transaction_ref = payment_details_data.get("refId", payment.transaction_ref)
            payment.amount = payment_details_data.get("amountPaid", payment.amount)
            
    db.session.commit()
    
    log = AdminLog(admin_user=request.user.get("email", "admin"), action=f"Updated status of Order {order.order_number} to {new_status}")
    db.session.add(log)
    db.session.commit()
    
    return jsonify({"message": "Order updated successfully"}), 200

# OCR Payment verification proxy using client key securely
@app.route("/api/payments/verify-receipt", methods=["POST"])
def verify_payment_receipt():
    data = request.get_json() or {}
    ref_id = data.get("refId")
    
    # Check for duplicate double-spend payments database reference numbers
    if ref_id:
        existing = Payment.query.filter_by(transaction_ref=ref_id).first()
        if existing:
            return jsonify({
                "duplicate": True,
                "error": "Duplicate transaction detected. This reference ID was already validated."
            }), 400
            
    return jsonify({
        "duplicate": False,
        "message": "Transaction Reference ID is unique"
    }), 200

# Crop disease detector scanner proxies
@app.route("/api/scanner/diagnose", methods=["POST"])
def diagnose_crop():
    # Placeholder database record registration
    data = request.get_json() or {}
    base64_image = data.get("image")
    crop_type = data.get("cropType", "Unknown")
    
    new_diag = ScannerHistory(
        crop_type=crop_type,
        diagnosis="Awaiting evaluation",
        recommended_treatment="",
        base64_image=base64_image[:1000] if base64_image else ""
    )
    db.session.add(new_diag)
    db.session.commit()
    
    return jsonify({"id": new_diag.id, "message": "Scanner entry logged"}), 200

# Chatbot proxies
@app.route("/api/chatbot/ask", methods=["POST"])
def chat():
    # Register chat histories in SQLite/Postgres log database
    data = request.get_json() or {}
    message = data.get("message")
    
    new_chat = ChatHistory(
        role="user",
        content=message
    )
    db.session.add(new_chat)
    db.session.commit()
    
    return jsonify({"status": "received"}), 200

# Admin Stats Endpoints
@app.route("/api/admin/stats", methods=["GET"])
@admin_required
def get_admin_stats():
    orders = Order.query.all()
    products = Product.query.all()
    dealers = DealerApplication.query.all()
    
    total = len(orders)
    pending = len([o for o in orders if o.status == 'pending'])
    confirmed = len([o for o in orders if o.status == 'confirmed'])
    delivered = len([o for o in orders if o.status == 'delivered'])
    revenue = sum([o.total_amount for o in orders if o.status == 'delivered'])
    
    # Compute orders today
    today_str = datetime.date.today().isoformat()
    today_orders = len([o for o in orders if o.created_at.date().isoformat() == today_str])
    
    # Category share
    cat_counts = {}
    for p in products:
        cat = p.category or "Special Product"
        cat_counts[cat] = cat_counts.get(cat, 0) + 1
    category_share = [{"name": cat.replace('_', ' ').title(), "value": count} for cat, count in cat_counts.items()]
    
    # Low stock
    low_stock = [{"name": p.name_en, "stock": p.stockInventory or 0} for p in products if (p.stockInventory is not None and p.stockInventory <= 10)]
    
    # Top products by sales (from order items)
    order_items = OrderItem.query.all()
    prod_sales = {} # pid -> {name, qty, rev}
    for item in order_items:
        pid = item.product_id
        if pid not in prod_sales:
            prod_sales[pid] = {"name": item.product_name, "sold": 0, "revenue": 0.0}
        prod_sales[pid]["sold"] += item.quantity
        prod_sales[pid]["revenue"] += item.price * item.quantity
    
    top_products = sorted(list(prod_sales.values()), key=lambda x: x["sold"], reverse=True)[:5]
    
    # Monthly sales data (last 6 months)
    monthly_sales = {}
    today = datetime.datetime.utcnow()
    for i in range(5, -1, -1):
        m_date = today - datetime.timedelta(days=30 * i)
        m_name = m_date.strftime("%b")
        monthly_sales[m_name] = 0.0
        
    for o in orders:
        if o.status == 'delivered':
            m_name = o.created_at.strftime("%b")
            if m_name in monthly_sales:
                monthly_sales[m_name] += o.total_amount
                
    monthly_sales_list = [{"name": name, "sales": sales} for name, sales in monthly_sales.items()]
    
    # Daily sales for the last 7 days (Revenue Growth Chart)
    daily_sales = {}
    for i in range(6, -1, -1):
        d_date = today - datetime.timedelta(days=i)
        d_name = d_date.strftime("%a")
        daily_sales[d_name] = {"revenue": 0.0, "orders": 0}
        
    for o in orders:
        d_name = o.created_at.strftime("%a")
        if d_name in daily_sales:
            if o.status == 'delivered':
                daily_sales[d_name]["revenue"] += o.total_amount
            daily_sales[d_name]["orders"] += 1
            
    daily_sales_list = [{"name": name, "revenue": data["revenue"], "orders": data["orders"]} for name, data in daily_sales.items()]
    
    return jsonify({
        "total": total,
        "pending": pending,
        "confirmed": confirmed,
        "delivered": delivered,
        "revenue": revenue,
        "todayOrders": today_orders,
        "totalDealers": len([d for d in dealers if d.status == 'Active' or d.status == 'Approved']),
        "totalProducts": len([p for p in products if not p.is_archived]),
        "lowStockCount": len(low_stock),
        "categoryShareData": category_share,
        "lowStockData": low_stock[:5],
        "topProductsData": top_products,
        "monthlySalesData": monthly_sales_list,
        "revenueGrowthData": daily_sales_list
    }), 200

@app.route("/api/orders/<order_id>/screenshot", methods=["GET"])
def get_order_screenshot(order_id):
    screenshot = PaymentScreenshot.query.filter_by(order_id=order_id).first()
    if not screenshot or not screenshot.base64_data:
        return jsonify({"error": "Screenshot not found"}), 404
    try:
        import base64
        img_data = base64.b64decode(screenshot.base64_data)
        response = make_response(img_data)
        response.headers.set('Content-Type', 'image/png')
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# CRUD for Admin Audit Logs
@app.route("/api/admin/logs", methods=["GET"])
@admin_required
def get_admin_logs():
    logs = AdminLog.query.order_by(AdminLog.created_at.desc()).all()
    return jsonify([{
        "id": l.id,
        "admin_user": l.admin_user,
        "action": l.action,
        "ip_address": l.ip_address,
        "created_at": l.created_at.isoformat() + "Z"
    } for l in logs]), 200

# CRUD for User Management
@app.route("/api/admin/users", methods=["GET"])
@admin_required
def get_admin_users():
    users = User.query.all()
    return jsonify([{
        "id": u.id,
        "email": u.email,
        "role": u.role,
        "created_at": u.created_at.isoformat() + "Z"
    } for u in users]), 200

@app.route("/api/admin/users/<int:user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = request.get_json() or {}
    new_role = data.get("role")
    if new_role not in ["customer", "admin", "moderator", "agent"]:
        return jsonify({"error": "Invalid role"}), 400
    
    user.role = new_role
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Updated user role for {user.email} to {new_role}")
    return jsonify({"message": "Role updated successfully"}), 200

@app.route("/api/admin/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    email = user.email
    db.session.delete(user)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Deleted user account for {email}")
    return jsonify({"message": "User deleted successfully"}), 200

# CRUD for Coupons
@app.route("/api/coupons", methods=["GET"])
def get_coupons():
    coupons = Coupon.query.all()
    return jsonify([{
        "id": c.id,
        "code": c.code,
        "discount": c.discount_percent,
        "active": c.active,
        "created_at": c.created_at.isoformat() + "Z" if c.created_at else None
    } for c in coupons]), 200

@app.route("/api/coupons", methods=["POST"])
@admin_required
def create_coupon():
    data = request.get_json() or {}
    code = data.get("code")
    discount = data.get("discount")
    if not code or discount is None:
        return jsonify({"error": "Code and discount are required"}), 400
    
    if Coupon.query.filter_by(code=code.upper()).first():
        return jsonify({"error": "Coupon code already exists"}), 400
        
    c = Coupon(code=code.upper(), discount_percent=float(discount), active=True)
    db.session.add(c)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Created coupon {code} ({discount}%)")
    return jsonify({"message": "Coupon created successfully", "id": c.id}), 201

@app.route("/api/coupons/<code>", methods=["DELETE"])
@admin_required
def delete_coupon(code):
    c = Coupon.query.filter_by(code=code.upper()).first()
    if not c:
        return jsonify({"error": "Coupon not found"}), 404
    db.session.delete(c)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Deleted coupon {code}")
    return jsonify({"message": "Coupon deleted successfully"}), 200

# CRUD for Customer Reviews
@app.route("/api/reviews", methods=["GET"])
def get_reviews():
    reviews = Review.query.order_by(Review.created_at.desc()).all()
    return jsonify([{
        "id": r.id,
        "product_id": r.product_id,
        "user_name": r.user_name,
        "rating": r.rating,
        "text": r.text,
        "created_at": r.created_at.isoformat() + "Z" if r.created_at else None
    } for r in reviews]), 200

@app.route("/api/reviews", methods=["POST"])
def create_review():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    user_name = data.get("user_name")
    rating = data.get("rating", 5)
    text = data.get("text")
    if not product_id or not user_name or not text:
        return jsonify({"error": "Product ID, user name, and text are required"}), 400
    
    r = Review(product_id=product_id, user_name=user_name, rating=int(rating), text=text)
    db.session.add(r)
    db.session.commit()
    return jsonify({"message": "Review submitted successfully", "id": r.id}), 201

@app.route("/api/reviews/<int:review_id>", methods=["DELETE"])
@admin_required
def delete_review(review_id):
    r = Review.query.get(review_id)
    if not r:
        return jsonify({"error": "Review not found"}), 404
    db.session.delete(r)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Deleted review id {review_id} by {r.user_name}")
    return jsonify({"message": "Review deleted successfully"}), 200

# CRUD for Contact Messages
@app.route("/api/messages", methods=["GET"])
@admin_required
def get_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    return jsonify([{
        "id": m.id,
        "name": m.name,
        "email": m.email,
        "phone": m.phone,
        "subject": m.subject,
        "text": m.text,
        "status": m.status,
        "created_at": m.created_at.isoformat() + "Z" if m.created_at else None
    } for m in messages]), 200

@app.route("/api/messages", methods=["POST"])
def create_message():
    data = request.get_json() or {}
    name = data.get("name")
    email = data.get("email")
    phone = data.get("phone")
    subject = data.get("subject")
    text = data.get("text")
    if not name or not text:
        return jsonify({"error": "Name and text are required"}), 400
    
    m = ContactMessage(name=name, email=email, phone=phone, subject=subject, text=text, status="Unread")
    db.session.add(m)
    db.session.commit()
    
    # Notify admin
    notif = Notification(
        type="new_message",
        title="New Contact Message",
        message=f"New message from {name} regarding '{subject or 'No Subject'}': {text[:100]}...",
        reference_id=str(m.id)
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({"message": "Message submitted successfully", "id": m.id}), 201

@app.route("/api/messages/<int:msg_id>", methods=["DELETE"])
@admin_required
def delete_message(msg_id):
    m = ContactMessage.query.get(msg_id)
    if not m:
        return jsonify({"error": "Message not found"}), 404
    db.session.delete(m)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Deleted message from {m.name}")
    return jsonify({"message": "Message deleted successfully"}), 200

# CRUD for Bank Accounts
@app.route("/api/banks", methods=["GET"])
def get_bank_accounts():
    banks = BankAccount.query.all()
    return jsonify([{
        "id": b.id,
        "bank_name": b.bank_name,
        "account_title": b.account_title,
        "account_number": b.account_number,
        "iban": b.iban,
        "qr_code": b.qr_code,
        "instructions": b.instructions,
        "status": b.status
    } for b in banks]), 200

@app.route("/api/banks", methods=["POST"])
@admin_required
def create_bank_account():
    data = request.get_json() or {}
    bank_name = data.get("bank_name")
    account_title = data.get("account_title")
    account_number = data.get("account_number")
    iban = data.get("iban")
    qr_code = data.get("qr_code")
    instructions = data.get("instructions")
    
    if not bank_name or not account_title or not account_number:
        return jsonify({"error": "Bank name, title and account number are required"}), 400
        
    b = BankAccount(
        bank_name=bank_name,
        account_title=account_title,
        account_number=account_number,
        iban=iban,
        qr_code=qr_code,
        instructions=instructions,
        status="Active"
    )
    db.session.add(b)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Created bank account {bank_name} ({account_number})")
    return jsonify({"message": "Bank account created successfully", "id": b.id}), 201

@app.route("/api/banks/<int:bank_id>", methods=["PUT"])
@admin_required
def update_bank_account(bank_id):
    b = BankAccount.query.get(bank_id)
    if not b:
        return jsonify({"error": "Bank account not found"}), 404
    data = request.get_json() or {}
    b.bank_name = data.get("bank_name", b.bank_name)
    b.account_title = data.get("account_title", b.account_title)
    b.account_number = data.get("account_number", b.account_number)
    b.iban = data.get("iban", b.iban)
    b.qr_code = data.get("qr_code", b.qr_code)
    b.instructions = data.get("instructions", b.instructions)
    b.status = data.get("status", b.status)
    
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Updated bank account {b.bank_name}")
    return jsonify({"message": "Bank account updated successfully"}), 200

@app.route("/api/banks/<int:bank_id>", methods=["DELETE"])
@admin_required
def delete_bank_account(bank_id):
    b = BankAccount.query.get(bank_id)
    if not b:
        return jsonify({"error": "Bank account not found"}), 404
    bank_name = b.bank_name
    db.session.delete(b)
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Deleted bank account {bank_name}")
    return jsonify({"message": "Bank account deleted successfully"}), 200

# --- Multilingual Public Products & Catalog Sync Endpoints ---

@app.route("/api/products/public", methods=["GET"])
def get_public_products():
    products = Product.query.filter_by(is_visible=True, is_archived=False).all()
    result = {}
    for p in products:
        def safe_json(val, default):
            if not val:
                return default
            try:
                return json.loads(val)
            except Exception:
                return default
        
        result[p.id] = {
            "id": p.id,
            "slug": p.slug,
            "name": safe_json(p.name_json, {"en": p.name_en, "ur": p.name_ur or p.name_en}),
            "genericName": safe_json(p.generic_name_json, {"en": p.generic_name_en, "ur": p.generic_name_ur or p.generic_name_en}),
            "category": p.category,
            "tagline": p.tagline,
            "imageUrl": p.baseImageURL or "",
            "pngUrl": p.png_url,
            "rating": p.rating or 4.8,
            "importedFormulaBadge": p.imported_formula_badge,
            "premiumProductBadge": p.premium_product_badge,
            "researchBasedBadge": p.research_based_badge,
            "shortDesc": safe_json(p.short_desc_json, {}),
            "description": safe_json(p.description_json, {}),
            "features": safe_json(p.features_json, {}),
            "benefits": safe_json(p.benefits_json, {}),
            "crops": safe_json(p.crops_json, []),
            "application": safe_json(p.application_json, {}),
            "specs": safe_json(p.specs_json, {}),
            "sizes": safe_json(p.sizes_json, []),
            "seoTitle": p.seo_title,
            "seoDescription": p.seo_description,
            "is_featured": p.is_featured,
            "sort_order": p.sort_order
        }
    return jsonify(result), 200

@app.route("/api/products/sync", methods=["POST"])
@admin_required
def sync_products():
    data = request.get_json() or {}
    products_list = data if isinstance(data, list) else data.get("products", [])
    if not products_list:
        return jsonify({"error": "No products list provided"}), 400
    
    count = 0
    for p_data in products_list:
        pid = p_data.get("id") or p_data.get("slug")
        if not pid:
            continue
        
        p = Product.query.get(pid)
        if not p:
            p = Product(id=pid)
            db.session.add(p)
        
        p.slug = pid
        
        name_val = p_data.get("name", {})
        p.name_json = json.dumps(name_val) if isinstance(name_val, dict) else json.dumps({"en": str(name_val)})
        p.name_en = name_val.get("en", "") if isinstance(name_val, dict) else str(name_val)
        p.name_ur = name_val.get("ur", "") if isinstance(name_val, dict) else ""
        
        generic_val = p_data.get("genericName", {})
        p.generic_name_json = json.dumps(generic_val) if isinstance(generic_val, dict) else json.dumps({"en": str(generic_val)})
        p.generic_name_en = generic_val.get("en", "") if isinstance(generic_val, dict) else str(generic_val)
        p.generic_name_ur = generic_val.get("ur", "") if isinstance(generic_val, dict) else ""
        
        p.category = p_data.get("category", "plant_nutrition")
        p.rating = float(p_data.get("rating", 4.8))
        p.active_ingredient = p_data.get("activeIngredient") or p_data.get("formulation") or ""
        p.formulation = p_data.get("formulation") or ""
        p.packaging = p_data.get("packaging") or ""
        p.product_code = p_data.get("productCode") or ""
        
        sizes = p_data.get("sizes", [])
        first_price = 0.0
        first_old_price = 0.0
        if sizes:
            first_price = float(sizes[0].get("price") or 0)
            first_old_price = float(sizes[0].get("oldPrice") or first_price)
        
        p.price = float(p_data.get("price", first_price))
        p.old_price = float(p_data.get("oldPrice", first_old_price))
        p.stock_status = p_data.get("stockStatus", "In Stock")
        p.stockInventory = int(p_data.get("stockInventory", 100))
        
        p.tagline = p_data.get("tagline")
        p.short_desc_json = json.dumps(p_data.get("shortDesc", {}))
        p.description_json = json.dumps(p_data.get("description", {}))
        p.features_json = json.dumps(p_data.get("features", {}))
        p.benefits_json = json.dumps(p_data.get("benefits", {}))
        p.crops_json = json.dumps(p_data.get("crops", []))
        p.application_json = json.dumps(p_data.get("application", {}))
        p.specs_json = json.dumps(p_data.get("specs", {}))
        p.sizes_json = json.dumps(sizes)
        
        p.seo_title = p_data.get("seoTitle")
        p.seo_description = p_data.get("seoDescription")
        p.png_url = p_data.get("pngUrl")
        p.baseImageURL = p_data.get("imageUrl") or p_data.get("pngUrl") or ""
        p.imported_formula_badge = bool(p_data.get("importedFormulaBadge", False))
        p.premium_product_badge = bool(p_data.get("premiumProductBadge", False))
        p.research_based_badge = bool(p_data.get("researchBasedBadge", False))
        p.is_featured = bool(p_data.get("is_featured", False))
        p.is_visible = bool(p_data.get("is_visible", True))
        p.is_archived = bool(p_data.get("is_archived", False))
        p.sort_order = int(p_data.get("sort_order", 0))
        
        count += 1
    
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Synced {count} products catalog records")
    return jsonify({"message": f"Successfully synced {count} products to database"}), 200

# --- Admin Notifications System ---

@app.route("/api/notifications", methods=["GET"])
@admin_required
def get_notifications():
    notifs = Notification.query.order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify([{
        "id": n.id,
        "type": n.type,
        "title": n.title,
        "message": n.message,
        "reference_id": n.reference_id,
        "read": n.read,
        "created_at": n.created_at.isoformat() + "Z"
    } for n in notifs]), 200

@app.route("/api/notifications/<int:notif_id>/read", methods=["PUT"])
@admin_required
def mark_notification_read(notif_id):
    n = Notification.query.get(notif_id)
    if not n:
        return jsonify({"error": "Notification not found"}), 404
    n.read = True
    db.session.commit()
    return jsonify({"message": "Notification marked as read"}), 200

@app.route("/api/notifications/read-all", methods=["PUT"])
@admin_required
def mark_all_notifications_read():
    Notification.query.filter_by(read=False).update({Notification.read: True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"}), 200

# --- Dealer Franchises Endpoints ---

@app.route("/api/dealers", methods=["POST"])
def create_dealer_application():
    data = request.get_json() or {}
    name = data.get("name")
    business_name = data.get("businessName") or data.get("business_name")
    city = data.get("city")
    phone = data.get("phone")
    email = data.get("email")
    experience = data.get("experience")
    current_brands = data.get("currentBrands") or data.get("current_brands")
    coverage_area = data.get("coverageArea") or data.get("coverage_area")
    
    if not name or not phone:
        return jsonify({"error": "Name and phone number are required"}), 400
        
    d = DealerApplication(
        name=name,
        business_name=business_name,
        city=city,
        phone=phone,
        email=email,
        experience=experience,
        current_brands=current_brands,
        coverage_area=coverage_area,
        status="Pending"
    )
    db.session.add(d)
    db.session.commit()
    
    # Notify Admin
    notif = Notification(
        type="dealer_application",
        title="New Dealer Application",
        message=f"Dealer franchise application received from {name} for business '{business_name or 'N/A'}' in {city or 'N/A'}.",
        reference_id=str(d.id)
    )
    db.session.add(notif)
    db.session.commit()
    
    return jsonify({"message": "Dealer application submitted successfully", "id": d.id}), 201

@app.route("/api/dealers", methods=["GET"])
@admin_required
def list_dealers():
    dealers = DealerApplication.query.all()
    return jsonify([{
        "id": d.id,
        "name": d.name,
        "business_name": d.business_name,
        "city": d.city,
        "phone": d.phone,
        "email": d.email,
        "experience": d.experience,
        "current_brands": d.current_brands,
        "coverage_area": d.coverage_area,
        "status": d.status,
        "notes": d.notes,
        "created_at": d.created_at.isoformat() + "Z" if d.created_at else None
    } for d in dealers]), 200

@app.route("/api/dealers/<int:dealer_id>/status", methods=["PUT"])
@admin_required
def update_dealer_status(dealer_id):
    d = DealerApplication.query.get(dealer_id)
    if not d:
        return jsonify({"error": "Dealer application not found"}), 404
        
    data = request.get_json() or {}
    status = data.get("status")
    notes = data.get("notes")
    
    if status:
        d.status = status
    if notes is not None:
        d.notes = notes
        
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Updated dealer application status of {d.name} to {status}")
    return jsonify({"message": "Dealer application updated successfully"}), 200

# --- Payment Registries & Verification Endpoints ---

@app.route("/api/payments", methods=["GET"])
@admin_required
def list_payments():
    payments = Payment.query.all()
    output = []
    for pay in payments:
        order = Order.query.filter_by(id=pay.order_id).first()
        screenshot = PaymentScreenshot.query.filter_by(order_id=pay.order_id).first()
        
        output.append({
            "id": pay.id,
            "order_id": pay.order_id,
            "order_number": order.order_number if order else "N/A",
            "customer": order.customer_name if order else pay.sender_name or "Unknown",
            "method": pay.method,
            "amount": f"PKR {int(pay.amount)}" if pay.amount else "PKR 0",
            "tid": pay.transaction_ref,
            "status": pay.status,
            "date": pay.timestamp or pay.created_at.strftime("%Y-%m-%d %H:%M"),
            "proofScreenshotURL": screenshot.file_path if screenshot else None
        })
    output.sort(key=lambda x: x["date"], reverse=True)
    return jsonify(output), 200

@app.route("/api/payments/<int:payment_id>/status", methods=["PUT"])
@admin_required
def update_payment_status(payment_id):
    pay = Payment.query.get(payment_id)
    if not pay:
        return jsonify({"error": "Payment record not found"}), 404
        
    data = request.get_json() or {}
    status = data.get("status")
    
    if status:
        pay.status = status
        if status in ["Verified", "approved"]:
            order = Order.query.filter_by(id=pay.order_id).first()
            if order and order.status == "pending":
                order.status = "confirmed"
                log = AdminLog(admin_user="system", action=f"Order {order.order_number} confirmed automatically via verified payment")
                db.session.add(log)
                
    db.session.commit()
    log_admin_action(request.user.get("email"), f"Updated payment transaction {pay.transaction_ref} status to {status}")
    return jsonify({"message": "Payment transaction status updated successfully"}), 200

# --- Dynamic Hero Slides Endpoints ---

@app.route("/api/hero-slides", methods=["GET"])
def get_hero_slides():
    slides = HeroSlide.query.filter_by(is_active=True).order_by(HeroSlide.sort_order.asc()).all()
    output = []
    for s in slides:
        try:
            titles = json.loads(s.title_json)
        except Exception:
            titles = {"en": s.title_json}
            
        try:
            subtitles = json.loads(s.subtitle_json)
        except Exception:
            subtitles = {"en": s.subtitle_json}
            
        output.append({
            "id": s.id,
            "title": titles,
            "subtitle": subtitles,
            "image_url": s.image_url,
            "link": s.link,
            "sort_order": s.sort_order
        })
    return jsonify(output), 200

@app.route("/api/hero-slides", methods=["POST"])
@admin_required
def create_hero_slide():
    data = request.get_json() or {}
    title = data.get("title", {})
    subtitle = data.get("subtitle", {})
    image_url = data.get("image_url")
    link = data.get("link")
    sort_order = int(data.get("sort_order", 0))
    
    if not image_url:
        return jsonify({"error": "Image URL is required"}), 400
        
    s = HeroSlide(
        title_json=json.dumps(title) if isinstance(title, dict) else json.dumps({"en": str(title)}),
        subtitle_json=json.dumps(subtitle) if isinstance(subtitle, dict) else json.dumps({"en": str(subtitle)}),
        image_url=image_url,
        link=link,
        sort_order=sort_order,
        is_active=True
    )
    db.session.add(s)
    db.session.commit()
    return jsonify({"message": "Hero slide created successfully", "id": s.id}), 201

@app.route("/api/hero-slides/<int:slide_id>", methods=["PUT"])
@admin_required
def update_hero_slide(slide_id):
    s = HeroSlide.query.get(slide_id)
    if not s:
        return jsonify({"error": "Hero slide not found"}), 404
        
    data = request.get_json() or {}
    if "title" in data:
        t_val = data.get("title")
        s.title_json = json.dumps(t_val) if isinstance(t_val, dict) else json.dumps({"en": str(t_val)})
    if "subtitle" in data:
        sub_val = data.get("subtitle")
        s.subtitle_json = json.dumps(sub_val) if isinstance(sub_val, dict) else json.dumps({"en": str(sub_val)})
    if "image_url" in data:
        s.image_url = data.get("image_url")
    if "link" in data:
        s.link = data.get("link")
    if "sort_order" in data:
        s.sort_order = int(data.get("sort_order"))
    if "is_active" in data:
        s.is_active = bool(data.get("is_active"))
        
    db.session.commit()
    return jsonify({"message": "Hero slide updated successfully"}), 200

@app.route("/api/hero-slides/<int:slide_id>", methods=["DELETE"])
@admin_required
def delete_hero_slide(slide_id):
    s = HeroSlide.query.get(slide_id)
    if not s:
        return jsonify({"error": "Hero slide not found"}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Hero slide deleted successfully"}), 200

# --- Dynamic Website Settings Endpoints ---

@app.route("/api/settings", methods=["GET"])
def get_settings():
    settings = WebsiteSetting.query.all()
    output = {}
    for s in settings:
        try:
            output[s.key] = json.loads(s.value_json)
        except Exception:
            output[s.key] = s.value_json
    return jsonify(output), 200

@app.route("/api/settings/<key>", methods=["PUT"])
@admin_required
def update_setting(key):
    data = request.get_json() or {}
    value = data.get("value")
    
    if value is None:
        return jsonify({"error": "Value parameter is required"}), 400
        
    s = WebsiteSetting.query.get(key)
    if not s:
        s = WebsiteSetting(key=key)
        db.session.add(s)
        
    s.value_json = json.dumps(value)
    db.session.commit()
    
    log = AdminLog(
        admin_user=request.user.get("email", "admin"),
        action=f"Updated website setting '{key}'",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": f"Website setting '{key}' updated successfully"}), 200

@app.route("/api/admin/purge-data", methods=["POST"])
@admin_required
def purge_database_data():
    try:
        # Clear transactional tables
        db.session.query(OrderItem).delete()
        db.session.query(Payment).delete()
        db.session.query(PaymentScreenshot).delete()
        db.session.query(Notification).delete()
        db.session.query(Order).delete()
        db.session.query(ContactMessage).delete()
        db.session.query(DealerApplication).delete()
        db.session.query(AdminLog).delete()
        
        # Clear customer users, keep admin
        db.session.query(User).filter(User.role != 'admin').delete()
        db.session.commit()
        
        log = AdminLog(
            admin_user=request.user.get("email", "admin"),
            action="Purged all transactional and mock database records",
            ip_address=request.remote_addr
        )
        db.session.add(log)
        db.session.commit()
        return jsonify({"message": "Database transaction registries purged successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to purge database data: {str(e)}"}), 500

# --- Feedbacks & Bug Reports Endpoints ---
@app.route("/api/feedbacks", methods=["POST"])
def submit_feedback():
    category = request.form.get("category", "general")
    message = request.form.get("message", "")
    
    # Handle screenshot/image file
    screenshot_file = request.files.get("screenshot")
    image_base64 = None
    if screenshot_file:
        try:
            screenshot_bytes = screenshot_file.read()
            image_base64 = "data:image/png;base64," + base64.b64encode(screenshot_bytes).decode('utf-8')
        except Exception as e:
            print("Failed to encode screenshot file:", e)
            
    # Handle audio file
    audio_file = request.files.get("audio")
    audio_base64 = None
    if audio_file:
        try:
            audio_bytes = audio_file.read()
            audio_base64 = "data:audio/webm;base64," + base64.b64encode(audio_bytes).decode('utf-8')
        except Exception as e:
            print("Failed to encode audio file:", e)
            
    # Direct base64 uploads fallback (for JSON/Base64 payloads)
    if not image_base64:
        image_base64 = request.form.get("image_base64")
    if not audio_base64:
        audio_base64 = request.form.get("audio_base64")

    if not message:
        return jsonify({"error": "Message is required"}), 400

    new_feedback = Feedback(
        category=category,
        message=message,
        image_base64=image_base64,
        audio_base64=audio_base64,
        status="Open"
    )
    db.session.add(new_feedback)
    db.session.commit()

    # Trigger admin panel real-time notification
    notif = Notification(
        type="new_feedback",
        title=f"New {category.replace('_', ' ').title()}",
        message=f"{message[:60]}...",
        reference_id=str(new_feedback.id)
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Feedback submitted successfully", "feedback_id": new_feedback.id}), 201

@app.route("/api/feedbacks", methods=["GET"])
@admin_required
def list_feedbacks():
    feedbacks = Feedback.query.all()
    output = []
    for f in feedbacks:
        output.append({
            "id": f.id,
            "category": f.category,
            "message": f.message,
            "image_base64": f.image_base64,
            "audio_base64": f.audio_base64,
            "status": f.status,
            "createdAt": f.created_at.isoformat() + "Z"
        })
    output.sort(key=lambda x: x["createdAt"], reverse=True)
    return jsonify(output), 200

@app.route("/api/feedbacks/<int:feedback_id>/status", methods=["PUT"])
@admin_required
def update_feedback_status(feedback_id):
    feedback = Feedback.query.get(feedback_id)
    if not feedback:
        return jsonify({"error": "Feedback record not found"}), 404
        
    data = request.get_json() or {}
    new_status = data.get("status")
    if new_status:
        feedback.status = new_status
        db.session.commit()
        
    log = AdminLog(
        admin_user=request.user.get("email", "admin"),
        action=f"Updated status of Feedback #{feedback_id} to {new_status}",
        ip_address=request.remote_addr
    )
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Feedback resolved/updated successfully"}), 200

# --- Analytics / Visitor Telemetry ---
@app.route("/api/analytics/visitors", methods=["GET"])
def get_analytics_visitors():
    today = datetime.date.today()
    today_count = VisitorLog.query.filter_by(visit_date=today).count()
    total_count = VisitorLog.query.count()
    return jsonify({
        "today": today_count,
        "total": total_count
    }), 200

# --- Post-Checkout Payment Proof Upload ---
@app.route("/api/orders/<order_id>/payment-proof", methods=["POST"])
def upload_order_payment_proof(order_id):
    order = Order.query.filter_by(id=order_id).first()
    if not order:
        return jsonify({"error": "Order registry not found"}), 404

    tid = request.form.get("tid")
    screenshot_file = request.files.get("screenshot")

    if not tid:
        return jsonify({"error": "Transaction ID (TID) reference is required"}), 400
    if not screenshot_file:
        return jsonify({"error": "Payment receipt screenshot is required"}), 400

    try:
        # Save screenshot file
        ext = screenshot_file.filename.split(".")[-1]
        filename = f"{order_id}_post_proof_{int(time.time())}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        screenshot_bytes = screenshot_file.read()
        with open(filepath, "wb") as f:
            f.write(screenshot_bytes)
            
        proof_url = f"/uploads/{filename}"
        screenshot_base64 = "data:image/png;base64," + base64.b64encode(screenshot_bytes).decode('utf-8')
        
        # Update order columns
        order.proofScreenshotURL = proof_url
        order.tidString = tid
        order.status = "payment_verification"
        
        # Save to Payment and PaymentScreenshot tables
        payment = Payment.query.filter_by(order_id=order_id).first()
        if not payment:
            payment = Payment(
                order_id=order_id,
                method=order.payment_method,
                amount=order.total_amount,
                status="pending",
                transaction_ref=tid
            )
            db.session.add(payment)
        else:
            payment.transaction_ref = tid
            payment.status = "pending"
            
        screenshot_entry = PaymentScreenshot.query.filter_by(order_id=order_id).first()
        if not screenshot_entry:
            screenshot_entry = PaymentScreenshot(
                order_id=order_id,
                file_path=proof_url,
                base64_data=screenshot_base64
            )
            db.session.add(screenshot_entry)
        else:
            screenshot_entry.file_path = proof_url
            screenshot_entry.base64_data = screenshot_base64
            
        db.session.commit()
        
        # Create admin notification
        notif = Notification(
            type="payment_uploaded",
            title="Post-Checkout Payment Proof",
            message=f"Order {order.order_number} has uploaded payment proof (TID: {tid}).",
            reference_id=order_id
        )
        db.session.add(notif)
        db.session.commit()
        
        return jsonify({
            "message": "Payment proof uploaded successfully", 
            "status": "payment_verification",
            "proofScreenshotURL": proof_url
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print("Failed to save post-checkout payment proof:", e)
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)

