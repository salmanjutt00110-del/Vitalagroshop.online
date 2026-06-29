import os
from app import app
from models import db, User, Order, OrderItem, Payment, PaymentScreenshot, Notification, Coupon, BankAccount, ContactMessage, AdminLog

def clear_all():
    print("Clearing all transactional and customer data from database...")
    with app.app_context():
        try:
            # Clear transactional records
            db.session.query(OrderItem).delete()
            db.session.query(Payment).delete()
            db.session.query(PaymentScreenshot).delete()
            db.session.query(Notification).delete()
            db.session.query(Order).delete()
            db.session.query(ContactMessage).delete()
            db.session.query(AdminLog).delete()
            
            # Clear customer users, keep admin
            db.session.query(User).filter(User.role != 'admin').delete()
            
            # Confirm admin exists
            admin = User.query.filter_by(role='admin').first()
            if not admin:
                from werkzeug.security import generate_password_hash
                admin_pwd = generate_password_hash("Bsfood$44")
                new_admin = User(email="vitalagro4@gmail.com", password_hash=admin_pwd, role="admin")
                db.session.add(new_admin)
                print("Admin user vitalagro4@gmail.com verified.")
                
            db.session.commit()
            print("Database cleaned successfully. Orders, payments, logs, and customer tables are now empty.")
        except Exception as e:
            db.session.rollback()
            print("Failed to clear database:", e)

if __name__ == "__main__":
    clear_all()
