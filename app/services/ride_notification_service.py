from app.core.database import SessionLocal
from app.models.ride import Ride


def get_unpublished_rides():

    db = SessionLocal()

    try:

        return db.query(
            Ride
        ).filter(
            Ride.status == "NEW",
            Ride.published_to_drivers == False
        ).all()

    finally:

        db.close()

def mark_as_published(
    ride_id
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.id == ride_id
        ).first()

        if ride:

            ride.published_to_drivers = True

            db.commit()

    finally:

        db.close()