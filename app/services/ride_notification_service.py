from app.core.database import SessionLocal
from app.models.ride_notification import (
    RideNotification
)


def save_notification(
    ride_id,
    driver_number
):

    db = SessionLocal()

    try:

        item = RideNotification(
            ride_id=ride_id,
            driver_number=driver_number
        )

        db.add(item)

        db.commit()

    finally:

        db.close()


def get_notified_drivers(
    ride_id
):

    db = SessionLocal()

    try:

        rows = db.query(
            RideNotification
        ).filter(
            RideNotification.ride_id
            == ride_id
        ).all()

        result = []

        for row in rows:

            result.append(
                row.driver_number
            )

        return result

    finally:

        db.close()