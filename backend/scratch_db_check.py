from app import app, db
import models

def check_db():
    with app.app_context():
        print("Database stats:")
        for name in dir(models):
            cls = getattr(models, name)
            if isinstance(cls, type) and issubclass(cls, db.Model) and cls is not db.Model:
                try:
                    count = cls.query.count()
                    print(f"  {name}: {count} records")
                except Exception as e:
                    print(f"  {name} error: {e}")

if __name__ == '__main__':
    check_db()
