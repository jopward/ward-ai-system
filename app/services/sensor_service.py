from sqlalchemy.orm import Session

from app.models.sensor import Sensor


def get_sensor_by_owner(
    db: Session,
    owner_number: str
):

    return (
        db.query(Sensor)
        .filter(
            Sensor.owner_number == owner_number
        )
        .first()
    )
    


def get_sensor_by_session(
    db: Session,
    session_id: str
):

    return (
        db.query(Sensor)
        .filter(
            Sensor.session_id == session_id
        )
        .first()
    )


def create_sensor(
    db: Session,
    owner_number: str,
    session_id: str
):

    sensor = Sensor(

        owner_number=owner_number,

        session_id=session_id,

        status="WAITING",

        is_active=True

    )

    db.add(sensor)

    db.commit()

    db.refresh(sensor)

    return sensor


def update_sensor_ready(
    db: Session,
    session_id: str,
    sensor_number: str
):

    sensor = (
        db.query(Sensor)
        .filter(
            Sensor.session_id == session_id
        )
        .first()
    )
    print("FOUND =", sensor)
    if not sensor:
        return None

    sensor.sensor_number = sensor_number

    sensor.status = "READY"

    db.commit()

    db.refresh(sensor)
    print("SENSOR NOT FOUND")
    return sensor


def update_sensor_status(
    db: Session,
    session_id: str,
    status: str
):

    sensor = (
        db.query(Sensor)
        .filter(
            Sensor.session_id == session_id
        )
        .first()
    )

    if not sensor:
        return None

    sensor.status = status

    db.commit()

    db.refresh(sensor)

    return sensor

def get_sensor(
    db: Session,
    owner_number: str
):

    return (
        db.query(Sensor)
        .filter(
            Sensor.owner_number == owner_number
        )
        .first()
    )