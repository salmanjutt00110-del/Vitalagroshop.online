import os
import json
import random
import datetime
from app import app
from models import db, Product, User, Order, OrderItem, Payment, PaymentScreenshot, Notification, Coupon, BankAccount, ContactMessage, AdminLog
from werkzeug.security import generate_password_hash

def seed_real_data():
    print("Seeding realistic agrotech data...")
    with app.app_context():
        # Clear existing tables to start fresh
        db.session.query(OrderItem).delete()
        db.session.query(Payment).delete()
        db.session.query(PaymentScreenshot).delete()
        db.session.query(Notification).delete()
        db.session.query(Order).delete()
        db.session.query(Coupon).delete()
        db.session.query(BankAccount).delete()
        db.session.query(ContactMessage).delete()
        db.session.query(AdminLog).delete()
        db.session.query(User).delete()
        db.session.commit()
        print("Cleared all existing tables.")

        # Ensure core products exist
        products = Product.query.all()
        if not products:
            print("No products found, please run reset_db.py first or ensure products are seeded.")
            return

        # Fetch product instances to map
        prod_map = {p.id: p for p in products}
        
        # Pakistani cities, customers and provinces
        customers = [
            {"name": "Haji Muhammad Yousaf", "phone": "0300-7654321", "city": "Multan", "province": "Punjab", "address": "Chah Bohar Wala, Near Grain Market"},
            {"name": "Chaudhary Nisar Ahmad", "phone": "0303-9876543", "city": "Sargodha", "province": "Punjab", "address": "Chak 45-SB, Kot Momin Road"},
            {"name": "Kamran Khan Jutt", "phone": "0321-4567890", "city": "Faisalabad", "province": "Punjab", "address": "Jhang Road, near Bypass"},
            {"name": "Malik Zaheer Abbas", "phone": "0333-1234567", "city": "Bahawalpur", "province": "Punjab", "address": "Yazman Mandi, Mouza Abbasia"},
            {"name": "Rana Tanveer Hussain", "phone": "0345-5556677", "city": "Sheikhupura", "province": "Punjab", "address": "Muridke Road, near Vital Farm Services"},
            {"name": "Syed Ali Raza Shah", "phone": "0301-8889900", "city": "Sahiwal", "province": "Punjab", "address": "Chichawatni Galla, G.T. Road"},
            {"name": "Mian Zubair Ahmad", "phone": "0312-3334455", "city": "Okara", "province": "Punjab", "address": "Depalpur Chowk, Near Al-Fateh Agri"},
            {"name": "Muhammad Asif Gujjar", "phone": "0305-6667788", "city": "Vehari", "province": "Punjab", "address": "Chak 108-WB, Mailsi"},
            {"name": "Mehrban Ali Shah", "phone": "0300-1112233", "city": "Khanewal", "province": "Punjab", "address": "Kabirwala Road, near bypass"},
            {"name": "Chaudhary Sajid Warraich", "phone": "0322-9998877", "city": "Gujranwala", "province": "Punjab", "address": "Wazirabad Road, Ghakkhar Mandi"},
            {"name": "Sardar Muhammad Khan", "phone": "0334-4445556", "city": "Rahim Yar Khan", "province": "Punjab", "address": "Sadiqabad Bypass, Near Shell Petrol Pump"},
            {"name": "Dr. Tariq Mahmood", "phone": "0302-2223334", "city": "Toba Tek Singh", "province": "Punjab", "address": "Kamalia Road, Rajana Chowk"},
            {"name": "Mir Baloch Khan", "phone": "0331-7776655", "city": "Sukkur", "province": "Sindh", "address": "Pano Aqil Bypass, near National Highway"},
            {"name": "Waseem Akhtar", "phone": "0346-4441122", "city": "Hyderabad", "province": "Sindh", "address": "Hala Naka, near Sabzi Mandi"},
            {"name": "Asad Ullah Jan", "phone": "0313-5559988", "city": "Peshawar", "province": "KPK", "address": "Charsadda Road, near Ring Road Chowk"},
        ]

        # Status distribution
        statuses = ["pending", "confirmed", "dispatched", "delivered", "cancelled"]
        status_weights = [0.15, 0.20, 0.15, 0.40, 0.10] # mostly delivered/confirmed

        # Payment methods
        pay_methods = ["COD", "Bank", "JazzCash", "COD"] # COD represents COD order
        
        # Start seeding dates from 14 days ago to today
        today = datetime.datetime.utcnow()
        order_count = 0

        for i in range(45): # 45 realistic orders to fill the charts nicely
            order_count += 1
            cust = random.choice(customers)
            status = random.choices(statuses, weights=status_weights)[0]
            pay_method = random.choice(pay_methods)
            
            # Date variance
            days_ago = random.randint(0, 14)
            hour_var = random.randint(0, 23)
            minute_var = random.randint(0, 59)
            created_date = today - datetime.timedelta(days=days_ago, hours=hour_var, minutes=minute_var)

            # Choose 1 to 3 items
            num_items = random.randint(1, 3)
            chosen_prods = random.sample(list(prod_map.keys()), num_items)
            
            order_items = []
            total_amount = 0.0
            total_qty = 0

            for pid in chosen_prods:
                p_item = prod_map[pid]
                # parse sizes from pricing matrix
                try:
                    matrix = json.loads(p_item.dynamicPricingMatrix)
                except Exception:
                    matrix = {"500ml": 750}
                
                size = random.choice(list(matrix.keys()))
                price = float(matrix[size])
                qty = random.randint(1, 5)
                
                total_amount += price * qty
                total_qty += qty
                
                order_items.append({
                    "product_id": pid,
                    "product_name": p_item.name_en,
                    "pack_size": size,
                    "quantity": qty,
                    "price": price
                })

            # Add shipping charges: 250 PKR
            total_amount += 250.0

            order_id = f"va-order-{random.randint(100000, 999999)}-{i}"
            str_count = str(order_count).zfill(4)
            order_number = f"VA-{created_date.year}-{str_count}"
            
            # Create Order
            order = Order(
                id=order_id,
                order_number=order_number,
                customer_name=cust["name"],
                phone=cust["phone"],
                city=cust["city"],
                province=cust["province"],
                postal_code="38000" if cust["city"] == "Faisalabad" else "66000",
                address=cust["address"],
                notes=random.choice(["Deliver in afternoon", "Call before arrival", "Urgent delivery needed", None]),
                status=status,
                quantity=total_qty,
                total_amount=total_amount,
                payment_method=pay_method,
                created_at=created_date,
                updated_at=created_date + datetime.timedelta(hours=random.randint(1, 24))
            )
            
            db.session.add(order)
            db.session.flush() # flush to generate relations

            # Create OrderItems
            for oi in order_items:
                item = OrderItem(
                    order_id=order.id,
                    product_id=oi["product_id"],
                    product_name=oi["product_name"],
                    pack_size=oi["pack_size"],
                    quantity=oi["quantity"],
                    price=oi["price"],
                    created_at=created_date
                )
                db.session.add(item)

            # Create Payments for non-COD or if confirmed/delivered
            if pay_method != "COD" or status in ["confirmed", "delivered"]:
                pay_status = "approved" if status in ["confirmed", "delivered"] else "pending"
                if status == "cancelled":
                    pay_status = "rejected"
                    
                pay = Payment(
                    order_id=order.id,
                    method=pay_method,
                    amount=total_amount,
                    status=pay_status,
                    transaction_ref=f"TID{random.randint(100000000, 999999999)}",
                    timestamp=created_date.strftime("%Y-%m-%d %H:%M:%S"),
                    receiver_wallet="Vital HBL A/C" if pay_method == "Bank" else "Vital JazzCash",
                    sender_name=cust["name"],
                    confidence_score=round(random.uniform(0.85, 0.99), 2),
                    created_at=created_date
                )
                db.session.add(pay)

            # Create Notifications for some orders
            if random.random() > 0.6:
                notif = Notification(
                    type="new_order",
                    message=f"New order {order_number} placed by {cust['name']} ({cust['city']}) for PKR {total_amount}",
                    read=status == "delivered",
                    created_at=created_date
                )
                db.session.add(notif)

        # Seed some coupons
        coupons = [
            Coupon(code="VITAL10", discount_percent=10.0, active=True),
            Coupon(code="AZADI78", discount_percent=15.0, active=True),
            Coupon(code="KISAAN5", discount_percent=5.0, active=True)
        ]
        for c in coupons:
            db.session.add(c)

        # Seed users (1 admin, 2 staff, 3 customers)
        admin_pwd = generate_password_hash("Bsfood$44")
        staff_pwd = generate_password_hash("StaffPass123")
        cust_pwd = generate_password_hash("CustomerPass123")
        
        users = [
            User(email="vitalagro4@gmail.com", password_hash=admin_pwd, role="admin"),
            User(email="moderator@vitalagro.com", password_hash=staff_pwd, role="moderator"),
            User(email="agent@vitalagro.com", password_hash=staff_pwd, role="agent"),
            User(email="yousaf@gmail.com", password_hash=cust_pwd, role="customer"),
            User(email="kamran@gmail.com", password_hash=cust_pwd, role="customer"),
            User(email="nisar@gmail.com", password_hash=cust_pwd, role="customer")
        ]
        for u in users:
            db.session.add(u)

        # Seed bank accounts
        banks = [
            BankAccount(bank_name="JS Bank", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="9077000001107064", iban="PK75JSBL9077000001107064", qr_code="", instructions="Please transfer PKR 299 delivery charges or full payment.", status="Active"),
            BankAccount(bank_name="Habib Bank Limited (HBL)", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="0004697901070703", iban="PK55HABB0004697901070703", qr_code="", instructions="Standard HBL transfer. Upload screenshot of payment reference.", status="Active"),
            BankAccount(bank_name="Bank Al Habib", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="0139098100230301", iban="PK80BAHL0139098100230301", qr_code="", instructions="Standard Bank Al Habib transfer. Upload screenshot of payment reference.", status="Active"),
            BankAccount(bank_name="Habib Metropolitan Bank", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="0208027140267178", iban="PK39MPBL0208027140267178", qr_code="", instructions="Standard Habib Metropolitan transfer. Upload screenshot of payment reference.", status="Active"),
            BankAccount(bank_name="MCB Bank", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="1137058881007015", iban="PK38MUCB1137058881007015", qr_code="", instructions="Standard MCB transfer. Upload screenshot of payment reference.", status="Active"),
            BankAccount(bank_name="Meezan Bank", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="0012810107354095", iban="PK05MEZN0012810107354095", qr_code="", instructions="Shariah-compliant Meezan Bank transfer.", status="Active"),
            BankAccount(bank_name="United Bank Limited (UBL)", account_title="Vital Agro Chemical Industries (Pvt) Ltd", account_number="0109000030216512", iban="PK15UNIL0109000030216512", qr_code="", instructions="Standard UBL transfer. Upload screenshot of payment reference.", status="Active")
        ]
        for b in banks:
            db.session.add(b)

        # Seed customer contact messages
        messages = [
            ContactMessage(name="Chaudhary Nisar", email="nisar.agri@gmail.com", phone="0302-9876543", subject="Franchise Application", text="I want to open a dealer franchise in Vehari. Please send commission structures and target sales requirements.", status="Unread"),
            ContactMessage(name="Rao Shabbir", email="shabbir.farm@yahoo.com", phone="0313-7890123", subject="Foliar Consultation", text="Which plant nutrition booster is best for cotton crops during the monsoon phase in South Punjab?", status="Responded"),
            ContactMessage(name="Muhammad Bilal", email="bilal.haroon@outlook.com", phone="0300-1122334", subject="Bulk Discount Query", text="Do you offer wholesale discounts for ordering 200 units of Aaqaab or Fatty?", status="Archived"),
            ContactMessage(name="Kamran Jutt", email="jutt.farmer@gmail.com", phone="0321-4567890", subject="Delivery Time Delay", text="My order VA-2026-0012 has not been dispatched yet. Please confirm shipping courier status.", status="Unread")
        ]
        for m in messages:
            db.session.add(m)

        # Seed initial admin activity logs
        logs = [
            AdminLog(admin_user="vitalagro4@gmail.com", action="Database initialization and seeding complete", ip_address="127.0.0.1"),
            AdminLog(admin_user="vitalagro4@gmail.com", action="Updated product catalog inventory for Fatty", ip_address="127.0.0.1"),
            AdminLog(admin_user="moderator@vitalagro.com", action="Approved advance payment screenshot for order VA-2026-0004", ip_address="192.168.10.15"),
            AdminLog(admin_user="agent@vitalagro.com", action="Dispatched courier shipment via TCS for order VA-2026-0008", ip_address="192.168.10.22")
        ]
        for l in logs:
            db.session.add(l)

        db.session.commit()
        print(f"Successfully seeded {order_count} realistic agrotech orders and associated tables into SQLite database!")

if __name__ == "__main__":
    seed_real_data()
