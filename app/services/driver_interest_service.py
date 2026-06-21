from app.core.database import SessionLocal
from app.models.driver_interest import DriverInterest
from app.models.driver import Driver


def add_interest(
    driver_number,
    keyword
):

    db = SessionLocal()

    try:

        item = DriverInterest(
            driver_number=driver_number,
            keyword=keyword
        )

        db.add(item)

        db.commit()

        return True

    finally:

        db.close()


def get_driver_interests(
    driver_number
):

    db = SessionLocal()

    try:

        return db.query(
            DriverInterest
        ).filter(
            DriverInterest.driver_number
            == driver_number
        ).all()

    finally:

        db.close()


def remove_interest(
    driver_number,
    keyword
):

    db = SessionLocal()

    try:

        item = db.query(
            DriverInterest
        ).filter(
            DriverInterest.driver_number
            == driver_number,
            DriverInterest.keyword
            == keyword
        ).first()

        if item:

            db.delete(item)

            db.commit()

            return True

        return False

    finally:

        db.close()

def find_matching_drivers(
    pickup,
    destination
):

    db = SessionLocal()

    try:

        results = db.query(
            DriverInterest
        ).filter(
            (DriverInterest.keyword == pickup)
            |
            (DriverInterest.keyword == destination)
        ).all()

        drivers = []

        for item in results:

            approved_driver = (
                db.query(Driver)
                .filter(
                    Driver.phone ==
                    item.driver_number,
                    Driver.active == 1
                )
                .first()
            )

            if (
                approved_driver
                and
                item.driver_number
                not in drivers
            ):

                drivers.append(
                    item.driver_number
                )

        return drivers

    finally:

        db.close()