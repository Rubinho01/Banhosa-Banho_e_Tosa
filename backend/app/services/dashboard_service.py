from datetime import date

from sqlalchemy.orm import Session

from app.repositories import agendamento_repository, pet_repository, profissional_repository, tutor_repository


def get_dashboard_data(db: Session) -> dict:
    today = date.today()
    todays_appointments = agendamento_repository.list_by_date(db, today)

    tutors = tutor_repository.list_all(db)
    pets = pet_repository.list_all(db)
    professionals = profissional_repository.list_all(db)

    return {
        "totals": {
            "appointmentsToday": len(todays_appointments),
            "activeClients": len(tutors),
            "pets": len(pets),
            "professionals": len([item for item in professionals if item.active]),
        },
        "appointments": todays_appointments,
    }
