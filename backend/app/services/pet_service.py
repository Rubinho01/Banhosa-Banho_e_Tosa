from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.pet import Pet
from app.models.tutor import Tutor
from app.repositories import agendamento_repository, pet_repository, tutor_repository
from app.schemas.pet import PetCreate, PetUpdate


def _get_or_404(db: Session, pet_id: str) -> Pet:
    pet = pet_repository.get_by_id(db, pet_id)
    if pet is None:
        raise NotFoundError(f"Pet '{pet_id}' não encontrado.")
    return pet


def _get_tutor_or_404(db: Session, tutor_id: str) -> Tutor:
    tutor = tutor_repository.get_by_id(db, tutor_id)
    if tutor is None:
        raise NotFoundError(f"Tutor '{tutor_id}' não encontrado.")
    return tutor


def list_pets(db: Session) -> list[Pet]:
    return pet_repository.list_all(db)


def create_pet(db: Session, payload: PetCreate) -> Pet:
    tutor = _get_tutor_or_404(db, payload.tutor_id)

    pet = Pet(
        name=payload.name,
        species=payload.species,
        breed=payload.breed,
        size=payload.size,
        tutor_id=tutor.id,
    )
    return pet_repository.create(db, pet)


def update_pet(db: Session, pet_id: str, payload: PetUpdate) -> Pet:
    pet = _get_or_404(db, pet_id)
    tutor = _get_tutor_or_404(db, payload.tutor_id)

    # PI-03: a duração gravada em cada agendamento depende do porte (RN-01).
    # Trocar o porte com reserva viva deixaria a agenda com durações erradas e
    # possíveis sobreposições; por isso a troca só é aceita sem reservas ativas.
    if payload.size != pet.size and agendamento_repository.exists_active_for_pet(db, pet.id):
        raise ConflictError(
            "Não é possível alterar o porte do pet: existem agendamentos pendentes ou confirmados "
            "e a duração deles depende do porte (RN-01). Conclua ou cancele esses agendamentos antes."
        )

    pet.name = payload.name
    pet.species = payload.species
    pet.breed = payload.breed
    pet.size = payload.size
    pet.tutor = tutor
    return pet_repository.update(db, pet)


def delete_pet(db: Session, pet_id: str) -> None:
    pet = _get_or_404(db, pet_id)
    if agendamento_repository.exists_for_pet(db, pet.id):
        raise ConflictError(
            "Não é possível excluir o pet: existem agendamentos vinculados a ele "
            "(o histórico de agendamentos é preservado)."
        )
    pet_repository.delete(db, pet)
