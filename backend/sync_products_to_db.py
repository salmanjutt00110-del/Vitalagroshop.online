import os
import json
from app import app
from models import db, Product

json_path = r"C:\Users\salma\.gemini\antigravity-ide\brain\c346366f-d904-4309-8993-1dded7e3533c\scratch\products.json"

def sync_products_to_db():
    print(f"Reading products data from {json_path}...")
    if not os.path.exists(json_path):
        print("Error: products.json does not exist. Run convert_products.js first.")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        products_data = json.load(f)
        
    print(f"Loaded {len(products_data)} products from JSON.")
    
    with app.app_context():
        # Recreate tables to ensure schema modifications are picked up
        db.drop_all()
        db.create_all()
        
        count = 0
        for pid, p_data in products_data.items():
            if not pid:
                continue
                
            # Check if exists
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
            p.png_url = p_data.get("pngUrl") or p_data.get("imageUrl") or ""
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
        print(f"Successfully migrated/synced {count} products into SQLite database.")

if __name__ == "__main__":
    sync_products_to_db()
