"""Testes de integração: exercitam o endpoint /agendamentos de ponta a
ponta (router -> service -> repository -> SQLite em memória)."""


def _create_tutor(client, headers):
    resp = client.post(
        "/api/v1/tutores",
        json={"name": "Maria Silva", "phone": "47999990000", "email": "maria@example.com"},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _create_pet(client, headers, tutor_id, size="Grande"):
    resp = client.post(
        "/api/v1/pets",
        json={"name": "Thor", "species": "Cão", "breed": "Golden Retriever", "size": size, "tutor_id": tutor_id},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _create_professional(client, headers):
    resp = client.post(
        "/api/v1/profissionais",
        json={"name": "Ana Tosadora", "role": "Tosador", "specialty": "Tosa em geral", "active": True},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def test_create_appointment_calculates_rn01_duration_on_server(client, auth_headers):
    tutor = _create_tutor(client, auth_headers)
    pet = _create_pet(client, auth_headers, tutor["id"], size="Grande")
    professional = _create_professional(client, auth_headers)

    resp = client.post(
        "/api/v1/agendamentos",
        json={
            "pet_id": pet["id"],
            "profissional_id": professional["id"],
            "service": "Banho",
            "date": "2026-09-01",
            "start_time": "09:00:00",
            "status": "Pendente",
        },
        headers=auth_headers,
    )

    assert resp.status_code == 201
    body = resp.json()
    # Banho = 60min base; porte Grande dobra (RN-01) => 120min
    assert body["durationMinutes"] == 120


def test_overlapping_appointment_is_rejected_with_409(client, auth_headers):
    tutor = _create_tutor(client, auth_headers)
    pet_pequeno = _create_pet(client, auth_headers, tutor["id"], size="Pequeno")
    professional = _create_professional(client, auth_headers)

    first = client.post(
        "/api/v1/agendamentos",
        json={
            "pet_id": pet_pequeno["id"],
            "profissional_id": professional["id"],
            "service": "Banho",  # 60min, porte Pequeno não dobra
            "date": "2026-09-01",
            "start_time": "09:00:00",
            "status": "Pendente",
        },
        headers=auth_headers,
    )
    assert first.status_code == 201  # ocupa 09:00-10:00

    second = client.post(
        "/api/v1/agendamentos",
        json={
            "pet_id": pet_pequeno["id"],
            "profissional_id": professional["id"],
            "service": "Tosa higiênica",
            "date": "2026-09-01",
            "start_time": "09:30:00",  # sobrepõe o agendamento anterior
            "status": "Pendente",
        },
        headers=auth_headers,
    )
    assert second.status_code == 409


def test_appointment_requires_authentication(client):
    resp = client.get("/api/v1/agendamentos")
    assert resp.status_code == 401
