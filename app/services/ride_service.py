from app.core.database import SessionLocal
from app.models.ride import Ride
import re


def create_ride(
    customer_number,
    message,
    pickup,
    destination,
    group_id="",
    message_id=""
):

    db = SessionLocal()

    ride = Ride(
        customer_number=customer_number,
        message=message,
        pickup=pickup,
        destination=destination,
        group_id=group_id,
        message_id=message_id,
        status="NEW",
        driver_number=""
    )

    db.add(ride)

    db.commit()

    db.refresh(ride)

    ride_id = ride.id

    db.close()

    return ride_id


def detect_ride_request(message):

    ride_words = [
        "راكب من",
        "بدي سيارة من",
        "بدي تكسي من",
        "توصيلة من",
        "من "
    ]

    message = message.lower()

    for word in ride_words:

        if word in message:

            return True

    return False


def get_all_rides():

    db = SessionLocal()

    rides = db.query(Ride).all()

    result = []

    for ride in rides:

        result.append({
            "id": ride.id,
            "customer_number": ride.customer_number,
            "message": ride.message,

            "group_id": ride.group_id,
            "message_id": ride.message_id,

            "pickup": ride.pickup,
            "destination": ride.destination,

            "status": ride.status,
            "driver_number": ride.driver_number,

            "created_at": str(ride.created_at)
        })

    db.close()

    return result


def assign_driver(
    ride_id,
    driver_number
):

    db = SessionLocal()

    ride = db.query(Ride).filter(
        Ride.id == ride_id
    ).first()

    if not ride:

        db.close()

        return False

    if ride.status == "TAKEN":

        db.close()

        return False

    ride.driver_number = driver_number

    ride.status = "PENDING_CONFIRMATION"

    ride.confirmation_status = (
         "PENDING_CONFIRMATION"
    )

    
    db.commit()

    db.close()

    return True

def get_ride_by_message_id(
    message_id
):

    db = SessionLocal()

    try:

        print(
            "SEARCHING FOR =",
            message_id
        )

        real_id = message_id.split("_", 1)[1]

        print(
            "REAL ID =",
            real_id
        )

        ride = db.query(Ride).filter(
            Ride.message_id.contains(
                real_id
            )
        ).first()

        print(
            "FOUND RIDE =",
            ride
        )

        return ride

    finally:

        db.close()

def get_ride_by_id(ride_id):

    db = SessionLocal()

    try:

        ride = db.query(Ride).filter(
            Ride.id == ride_id
        ).first()

        return ride

    finally:

        db.close()  

 

def cancel_driver(ride_id):

    db = SessionLocal()

    try:

        ride = db.query(Ride).filter(
            Ride.id == ride_id
        ).first()

        if not ride:

            return False

        ride.driver_number = ""
        ride.status = "NEW"

        db.commit()

        return True

    finally:

        db.close()         

def extract_locations(message):

    pickup = "unknown"
    destination = "unknown"

    match = re.search(
       r"من\s+(.*?)\s+(?:الى|إلى)\s+(.*)",
        message,
        re.IGNORECASE
    )
    print("MATCH =", match)
    
    if match:

        pickup = match.group(1).strip()
        destination = match.group(2).strip()

    return pickup, destination       

def complete_ride(ride_id):

    db = SessionLocal()

    try:

        ride = db.query(Ride).filter(
            Ride.id == ride_id
        ).first()

        if not ride:
            return False

        ride.status = "COMPLETED"

        db.commit()

        return True

    finally:

        db.close() 

def get_driver_rides(
    driver_number
):

    db = SessionLocal()

    try:

        rides = db.query(Ride).filter(
            Ride.driver_number ==
            driver_number
        ).all()

        result = []

        for ride in rides:

            result.append({
                "id": ride.id,
                "pickup": ride.pickup,
                "destination": ride.destination,
                "status": ride.status
            })

        return result

    finally:

        db.close()        

def get_pending_confirmation_ride(
    customer_number
):

    db = SessionLocal()

    try:

        print(
            "SEARCH PENDING FOR =",
            customer_number
        )

        ride = db.query(Ride).filter(
            Ride.customer_number ==
            customer_number,

            Ride.confirmation_status ==
            "PENDING_CONFIRMATION"
        ).order_by(
            Ride.id.desc()
        ).first()

        print(
            "PENDING RIDE =",
            ride
        )

        if ride:

            print(
                "STATUS =",
                ride.status
            )

            print(
                "CONFIRMATION =",
                ride.confirmation_status
            )

        return ride

    finally:

        db.close()

def confirm_ride(
    ride_id
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.id == ride_id
        ).first()

        if not ride:

            return False

        if (
            ride.confirmation_status
            != "PENDING_CONFIRMATION"
        ):

            return False

        ride.status = "TAKEN"

        ride.confirmation_status = (
            "CONFIRMED"
        )

        db.commit()

        return True

    finally:

        db.close()

def expire_ride(
    customer_number
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.customer_number ==
            customer_number,

            Ride.confirmation_status ==
            "PENDING_CONFIRMATION"
        ).order_by(
            Ride.id.desc()
        ).first()

        if not ride:

            return False

        ride.status = "EXPIRED"

        ride.confirmation_status = (
            "EXPIRED"
        )

        db.commit()

        return True

    finally:

        db.close()        

def take_ride(
    ride_id,
    driver_number
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.id == ride_id
        ).first()

        if not ride:

            return None

        if ride.status != "NEW":

            return False

        ride.driver_number = (
            driver_number
        )

        ride.status = (
            "PENDING_CONFIRMATION"
        )
        
        ride.confirmation_status = (
             "PENDING_CONFIRMATION"
        )
        ride.published_to_drivers = True
        db.commit()

        result = {

            "id":
                ride.id,

            "customer_number":
                ride.customer_number,

            "driver_number":
                ride.driver_number,

            "pickup":
                ride.pickup,

            "destination":
                ride.destination
        }

        return result

    finally:

        db.close()

def reject_ride(
    customer_number
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.customer_number ==
            customer_number,

            Ride.confirmation_status ==
            "PENDING_CONFIRMATION"
        ).order_by(
            Ride.id.desc()
        ).first()

        if not ride:

            return None

        driver_number = (
            ride.driver_number
        )

        ride.driver_number = ""
        ride.status = "NEW"

        ride.confirmation_status = (
            "REJECTED"
        )

        db.commit()

        return {
            "driver_number":
                driver_number,

            "ride_id":
                ride.id,

            "pickup":
                ride.pickup,

            "destination":
                ride.destination
        }

    finally:

        db.close()        
def search_new_driver_for_customer(
    customer_number
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.customer_number ==
            customer_number
        ).order_by(
            Ride.id.desc()
        ).first()

        if not ride:

            return None

        old_driver = (
            ride.driver_number
        )

        ride.driver_number = ""

        ride.status = "NEW"

        ride.confirmation_status = "NEW"

        db.commit()

        return {

            "status":
                "search_again",

            "ride_id":
                ride.id,

            "pickup":
                ride.pickup,

            "destination":
                ride.destination,

            "customer_number":
                ride.customer_number,

            "old_driver":
                old_driver
        }

    finally:

        db.close()
def cancel_customer_ride(
    customer_number
):

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.customer_number ==
            customer_number,

            Ride.confirmation_status ==
            "PENDING_CONFIRMATION"
        ).order_by(
            Ride.id.desc()
        ).first()

        if not ride:

            return None

        driver_number = (
            ride.driver_number
        )

        ride.status = "CANCELLED"

        ride.confirmation_status = (
            "CANCELLED"
        )

        ride.driver_number = ""

        db.commit()

        return {

            "driver_number":
                driver_number,

            "ride_id":
                ride.id
        }

    finally:

        db.close()