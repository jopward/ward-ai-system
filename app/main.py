from fastapi import FastAPI
from pydantic import BaseModel


from app.core.database import engine, Base
from app.models.conversation import Conversation
from app.models.driver_interest import DriverInterest
from app.models.ride_notification import RideNotification
from app.services.location_service import (
    extract_pickup_destination,
    extract_time
)

from app.services.ride_service import (
    create_ride,
    detect_ride_request,
    get_all_rides,
    assign_driver,
    get_ride_by_message_id,
    cancel_driver,
    extract_locations,
    complete_ride,
    get_pending_confirmation_ride,
    confirm_ride,
     take_ride
)

from app.services.ai_service import get_ai_reply
from app.services.memory_service import save_message, get_history
from app.services.keyword_service import (
    is_driver_post,
    extract_keywords

)
from app.services.post_classifier import (
    classify_post
)

from app.services.ride_service import (
    reject_ride
)

app = FastAPI()

Base.metadata.create_all(bind=engine)


class Message(BaseModel):
    user_id: str
    text: str
    is_wife: bool = False

    group_id: str = ""
    message_id: str = ""
    

class PromptRequest(BaseModel):

    content: str    

class AssignDriverRequest(BaseModel):

    message_id: str
    driver_number: str

class CancelRideRequest(BaseModel):

    message_id: str
    driver_number: str    
class CompleteRideRequest(BaseModel):

    message_id: str
    driver_number: str

class DriverRequest(BaseModel):

    driver_number: str

class TakeRideRequest(BaseModel):

    ride_id: int

    driver_number: str

class CustomerConfirmRequest(BaseModel):

    customer_number: str

class InterestRequest(BaseModel):

    driver_number: str

    keyword: str 
    
class MatchRequest(BaseModel):

    pickup: str

    destination: str     

class RideCheckRequest(
    BaseModel
):

    ride_id: int      

class CustomerRejectRequest(
    BaseModel
):

    customer_number: str

class ExpireRideRequest(
    BaseModel
):

    customer_number: str    


class SearchNewDriverRequest(
    BaseModel
):

    customer_number: str


@app.get("/")
def home():
    return {
        "message": "Ward AI System Running"
    }


@app.get("/about")
def about():
    return {
        "project": "Ward AI Automation",
        "version": "1.0",
        "status": "Running"
    }


@app.post("/chat")
def chat(message: Message):

    user_id = message.user_id
    text = message.text

    print("API IS_WIFE =", message.is_wife)

    ai_reply = get_ai_reply(
        user_id,
        text,
        message.is_wife
    )

    return {
        "user_message": text,
        "ai_reply": ai_reply
    }


@app.get("/history")
def history():
    return get_history()


@app.post("/ride-test")
def ride_test(message: Message):

    print("MESSAGE =", repr(message.text))
    
    post_type = classify_post(
        message.text
    )

    print(
        "POST TYPE =",
        post_type
    )

    if post_type == "driver":

        return {
            "status": "driver_post"
        }

    if is_driver_post(
        message.text
    ):

        return {
            "status": "driver_post"
        }

    if detect_ride_request(
        message.text
    ):

        pickup, destination = (
           extract_pickup_destination(
              message.text
           )
           
                
        )
        
        keywords = extract_keywords(
            message.text
        )

        ride_time = extract_time(
            message.text
        )

        ride_id = create_ride(
            customer_number=message.user_id,
            message=message.text,
            pickup=pickup,
            destination=destination,
            group_id=message.group_id,
            message_id=message.message_id
        )

    return {
            "ride_id": ride_id,
            "status": "saved",
            "pickup": pickup,
            "destination": destination,
            "ride_time": ride_time,
            "keywords": keywords
   }

    return {
        "status": "ignored"
    }

def rides():

    return get_all_rides()

@app.post("/assign-driver")
def assign_driver_api(
    data: AssignDriverRequest
):

    ride = get_ride_by_message_id(
        data.message_id
    )

    if not ride:

        return {
            "status": "ride_not_found"
        }

    # منع الراكب من حجز طلبه
    if ride.customer_number == data.driver_number:

        return {
            "status": "same_customer"
        }

    success = assign_driver(
        ride.id,
        data.driver_number
    )

    if not success:

        return {
            "status": "already_taken"
        }

    return {
        "status": "pending_confirmation",

        "ride_id": ride.id,

        "customer_number":
            ride.customer_number,

        "driver_number":
            data.driver_number,

        "pickup":
            ride.pickup,

        "destination":
            ride.destination
    }

@app.post("/cancel-driver")
def cancel_driver_api(
    data: CancelRideRequest
):

    ride = get_ride_by_message_id(
        data.message_id
    )

    if not ride:

        return {
            "status": "ride_not_found"
        }

    if (
        ride.driver_number !=
        data.driver_number
    ):

        return {
            "status": "not_owner"
        }

    success = cancel_driver(
        ride.id
    )

    if not success:

        return {
            "status": "error"
        }

    return {
        "status": "cancelled",
        "customer_number": 
        ride.customer_number
    }    

@app.post("/complete-ride")
def complete_ride_api(
    data: CompleteRideRequest
):

    ride = get_ride_by_message_id(
        data.message_id
    )

    if not ride:

        return {
            "status": "ride_not_found"
        }

    if (
        ride.driver_number !=
        data.driver_number
    ):

        return {
            "status": "not_owner"
        }

    success = complete_ride(
        ride.id
    )

    if not success:

        return {
            "status": "error"
        }

    return {
        "status": "completed",
        "customer_number":
            ride.customer_number
    }

@app.post("/my-rides")
def my_rides(
    data: DriverRequest
):

    from app.services.ride_service import (
        get_driver_rides
    )

    return get_driver_rides(
        data.driver_number
    )

@app.post("/customer-confirm")
def customer_confirm(
    data: CustomerConfirmRequest
):

    ride = get_pending_confirmation_ride(
        data.customer_number
    )

    if not ride:

        return {
            "status":
                "confirmation_expired"
        }

    success = confirm_ride(
        ride.id
    )

    if not success:

        return {
            "status":
                "confirmation_expired"
        }

    return {

        "status":
            "confirmed",

        "customer_number":
            ride.customer_number,

        "driver_number":
            ride.driver_number,

        "pickup":
            ride.pickup,

        "destination":
            ride.destination,

        "group_id":
            ride.group_id,

        "message_id":
            ride.message_id
    }

@app.post("/add-interest")
def add_interest_api(
    data: InterestRequest
):

    from app.services.driver_interest_service import (
        add_interest
    )

    add_interest(
        data.driver_number,
        data.keyword
    )

    return {
        "status": "saved"
    }

@app.post("/my-interests")
def my_interests_api(
    data: DriverRequest
):

    from app.services.driver_interest_service import (
        get_driver_interests
    )

    result = []

    interests = get_driver_interests(
        data.driver_number
    )

    for item in interests:

        result.append(
            item.keyword
        )

    return result

@app.post("/find-drivers")
def find_drivers_api(
    data: MatchRequest
):

    from app.services.driver_interest_service import (
        find_matching_drivers
    )

    return find_matching_drivers(
        data.pickup,
        data.destination
    )

@app.post("/take-ride")
def take_ride_api(
    data: TakeRideRequest
):

    ride = take_ride(
        data.ride_id,
        data.driver_number
    )

    if ride is None:

        return {
            "status":
                "ride_not_found"
        }
    if ride == "expired":

        return {
        "status": "expired"
        }

    if ride is False:

        return {
            "status":
                "already_taken"
        }

    return {

    "status":
        "pending_confirmation",

    "ride_id":
        ride["id"],

    "customer_number":
        ride["customer_number"],

    "driver_number":
        ride["driver_number"],

    "pickup":
        ride["pickup"],

    "destination":
        ride["destination"]
}

@app.post("/check-ride")
def check_ride(

    data: RideCheckRequest
):

    from app.core.database import SessionLocal
    from app.models.ride import Ride

    db = SessionLocal()

    try:

        ride = db.query(
            Ride
        ).filter(
            Ride.id == data.ride_id
        ).first()

        if not ride:

            return {
                "status": "not_found"
            }

        return {

            "status":
                ride.status,

            "customer_number":
                ride.customer_number,

            "pickup":
                ride.pickup,

            "destination":
                ride.destination
        }

    finally:

        db.close()

@app.post("/customer-reject")
def customer_reject(
    data: CustomerRejectRequest
):

    result = reject_ride(
        data.customer_number
    )

    if not result:

        return {
            "status":
                "ride_not_found"
        }

    return {

        "status":
            "rejected",

        "driver_number":
            result["driver_number"],

        "ride_id":
            result["ride_id"],

        "pickup":
            result["pickup"],

        "destination":
            result["destination"]
    }        


@app.post("/search-new-driver")
def search_new_driver(
    data: SearchNewDriverRequest
):

    from app.services.ride_service import (
        search_new_driver_for_customer
    )

    result = search_new_driver_for_customer(
        data.customer_number
    )

    if not result:

        return {
            "status":
                "ride_not_found"
        }

    return result   

@app.post("/cancel-customer-ride")
def cancel_customer_ride_api(
    data: CustomerRejectRequest
):

    from app.services.ride_service import (
        cancel_customer_ride
    )

    result = cancel_customer_ride(
        data.customer_number
    )

    if not result:

        return {
            "status":
                "ride_not_found"
        }

    return {

        "status":
            "cancelled",

        "driver_number":
            result["driver_number"],

        "ride_id":
            result["ride_id"]
    }


@app.post("/expire-ride")
def expire_ride_api(
    data: ExpireRideRequest
):

    from app.services.ride_service import (
        expire_ride
    )

    success = expire_ride(
        data.customer_number
    )

    if not success:

        return {
            "status":
                "ride_not_found"
        }

    return {
        "status":
            "expired"
    }

class SaveNotificationRequest(
    BaseModel
):

    ride_id: int

    driver_number: str


class NotifiedDriversRequest(
    BaseModel
):

    ride_id: int


@app.post(
    "/save-ride-notification"
)
def save_ride_notification(
    data: SaveNotificationRequest
):

    from app.services.ride_notification_service import (
        save_notification
    )

    save_notification(
        data.ride_id,
        data.driver_number
    )

    return {
        "status": "saved"
    }


@app.post(
    "/notified-drivers"
)
def notified_drivers(
    data: NotifiedDriversRequest
):

    from app.services.ride_notification_service import (
        get_notified_drivers
    )

    return get_notified_drivers(
        data.ride_id
    )
@app.post(
    "/check-pending-confirmation"
)
def check_pending_confirmation(
    data: CustomerConfirmRequest
):

    ride = get_pending_confirmation_ride(
        data.customer_number
    )

    if not ride:

        return {
            "status":
                "ride_not_found"
        }

    return {
        "status":
            "found"
    }