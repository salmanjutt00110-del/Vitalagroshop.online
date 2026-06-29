import os
import json
from app import app
from models import db, Product, User, Order, OrderItem, Payment, PaymentScreenshot

def reset_and_seed():
    print("Resetting database...")
    with app.app_context():
        # Drop all tables
        db.drop_all()
        # Recreate all tables
        db.create_all()
        print("Tables recreated successfully.")

        # Seed products catalog
        products_seeds = [
            {
                "id": "fatty",
                "productName": "Fatty",
                "productCategory": "plant_nutrition",
                "productDescription": "Fatty is a world-class plant nutrition bio-stimulant formulated with premium organic fatty acids and chelated micronutrients. It accelerates chloroplast development, improves leaf thickness, and helps crops resist drought, heat, and water stress.",
                "baseImageURL": "",
                "variantImages": json.dumps([]),
                "dynamicPricingMatrix": json.dumps({"500ml": 750}),
                "stockInventory": 120
            },
            {
                "id": "aaqab",
                "productName": "Aaqaab",
                "productCategory": "insecticide",
                "productDescription": "Aaqaab is a highly effective, fast-acting biological insecticide designed to eradicate sucking pests and chewing crop insects. Provides durable residual protection for vegetable, rice, and cotton fields.",
                "baseImageURL": "",
                "variantImages": json.dumps([]),
                "dynamicPricingMatrix": json.dumps({"400ml": 599}),
                "stockInventory": 85
            },
            {
                "id": "easy-grow-sc",
                "productName": "Easy Grow",
                "productCategory": "plant_nutrition",
                "productDescription": "Easy Grow offers high-performance chelated NPK and organic elements to bypass plant metabolic blocks, allowing direct leaf absorption and rapid development under harsh climates.",
                "baseImageURL": "",
                "variantImages": json.dumps([]),
                "dynamicPricingMatrix": json.dumps({"200ml": 370, "100ml": 370}),
                "stockInventory": 110
            },
            {
                "id": "purifizin",
                "productName": "Purifizin",
                "productCategory": "fungicide",
                "productDescription": "Purifizin is a premium systemic fungicide providing preventative and curative control over downy mildew, blight, and fungal root incursions in premium crops.",
                "baseImageURL": "",
                "variantImages": json.dumps([]),
                "dynamicPricingMatrix": json.dumps({"900gm": 1199}),
                "stockInventory": 60
            }
        ]

        for p in products_seeds:
            pricing_matrix = json.loads(p["dynamicPricingMatrix"])
            first_price = float(list(pricing_matrix.values())[0]) if pricing_matrix else 999.0
            
            prod = Product(
                id=p["id"],
                name_en=p["productName"],
                name_ur=p["productName"],
                slug=p["id"],
                category=p["productCategory"],
                price=first_price,
                old_price=first_price,
                stock_status="In Stock" if p["stockInventory"] > 0 else "Out of Stock",
                productDescription=p["productDescription"],
                baseImageURL=p["baseImageURL"],
                variantImages=p["variantImages"],
                dynamicPricingMatrix=p["dynamicPricingMatrix"],
                stockInventory=p["stockInventory"]
            )
            db.session.add(prod)

        db.session.commit()
        print("Seeding initial chemical products database records complete.")

if __name__ == "__main__":
    reset_and_seed()
