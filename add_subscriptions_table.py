
from src.models import db, Subscription
from api.index import create_app

app = create_app()

with app.app_context():
    # Create the subscriptions table
    db.create_all()

    # Add initial subscription plans if they don\'t exist
    pro_plan = Subscription.query.filter_by(name="Pro").first()
    if not pro_plan:
        pro_plan = Subscription(name="Pro", price=45.0, billing_cycle="weekly")
        db.session.add(pro_plan)

    enterprise_plan = Subscription.query.filter_by(name="Enterprise").first()
    if not enterprise_plan:
        enterprise_plan = Subscription(name="Enterprise", price=150.0, billing_cycle="monthly")
        db.session.add(enterprise_plan)

    db.session.commit()
    print("Subscriptions table created and initial plans added.")


