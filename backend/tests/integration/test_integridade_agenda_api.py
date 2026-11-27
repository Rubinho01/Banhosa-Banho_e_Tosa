"""
@file Integração API: Integridade da agenda (Etapa 1 da planilha de evolução)
@description Cobre as políticas de integridade PI-01 a PI-04.

@type {Teste de Integração / API}

@notes
- PI-01: todo agendamento nasce Pendente; o "status" enviado na criação é ignorado.
- PI-02: DELETE /agendamentos/{id} não apaga: cancela (idempotente) e preserva o histórico.
- PI-03: o porte do pet não muda enquanto houver reserva Pendente/Confirmado.
- PI-04: horários são normalizados para minuto inteiro (segundos são descartados).
"""

from datetime import date, timedelta

FUTURE_DATE = (date.today() + timedelta(days=30)).isoformat()

# ==============================================================================
# UTILS
# ==============================================================================


def _create_tutor(client, headers):
    resp = client.post(
        "/api/v1/tutores",
        json={"name": "Maria Silva", "phone": "47999990000", "email": "maria@example.com"},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _create_pet(client, headers, tutor_id, size="Pequeno"):
    resp = client.post(
        "/api/v1/pets",
        json={"name": "Thor", "species": "Cão", "breed": "SRD", "size": size, "tutor_id": tutor_id},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _create_professional(client, headers, name="Ana Tosadora", role="Tosador", active=True):
    resp = client.post(
        "/api/v1/profissionais",
        json={"name": name, "role": role, "specialty": "Geral", "active": active},
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _booking_payload(pet_id, professional_id, **overrides):
    return {
        "pet_id": pet_id,
        "profissional_id": professional_id,
        "service": "Banho",
        "date": FUTURE_DATE,
        "start_time": "09:00:00",
        **overrides,
    }


def _create_appointment(client, headers, pet_id, professional_id, **overrides):
    return client.post(
        "/api/v1/agendamentos", json=_booking_payload(pet_id, professional_id, **overrides), headers=headers
    )


def _set_status(client, headers, appointment_id, status):
    return client.patch(
        f"/api/v1/agendamentos/{appointment_id}/status", json={"status": status}, headers=headers
    )


def _scenario(client, headers, size="Pequeno"):
    tutor = _create_tutor(client, headers)
    pet = _create_pet(client, headers, tutor["id"], size=size)
    professional = _create_professional(client, headers)
    return pet, professional


# ==============================================================================
# PI-01 — STATUS INICIAL SEMPRE PENDENTE
# ==============================================================================


def test_appointment_is_always_created_as_pending_even_if_client_sends_status(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)

    for index, requested in enumerate(("Confirmado", "Concluído", "Cancelado")):
        response = _create_appointment(
            client,
            auth_headers,
            pet["id"],
            professional["id"],
            start_time=f"{9 + index:02d}:00:00",
            status=requested,
        )

        assert response.status_code == 201
        assert response.json()["status"] == "Pendente"


# ==============================================================================
# PI-02 — SEM DELETE FÍSICO: DELETE CANCELA
# ==============================================================================


def test_delete_cancels_the_appointment_keeps_history_and_frees_the_slot(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)
    appointment = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()

    response = client.delete(f"/api/v1/agendamentos/{appointment['id']}", headers=auth_headers)
    listed = client.get("/api/v1/agendamentos", headers=auth_headers).json()
    same_slot = _create_appointment(client, auth_headers, pet["id"], professional["id"])

    assert response.status_code == 204
    assert [(item["id"], item["status"]) for item in listed] == [(appointment["id"], "Cancelado")]
    assert same_slot.status_code == 201  # horário liberado


def test_delete_is_idempotent_for_an_already_cancelled_appointment(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)
    appointment = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()

    first = client.delete(f"/api/v1/agendamentos/{appointment['id']}", headers=auth_headers)
    second = client.delete(f"/api/v1/agendamentos/{appointment['id']}", headers=auth_headers)

    assert first.status_code == 204
    assert second.status_code == 204


def test_delete_of_a_concluded_appointment_is_rejected_and_keeps_it(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)
    appointment = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()
    assert _set_status(client, auth_headers, appointment["id"], "Concluído").status_code == 200

    response = client.delete(f"/api/v1/agendamentos/{appointment['id']}", headers=auth_headers)

    assert response.status_code == 422
    assert "histórico" in response.json()["detail"]
    listed = client.get("/api/v1/agendamentos", headers=auth_headers).json()
    assert [item["status"] for item in listed] == ["Concluído"]


# ==============================================================================
# PI-03 — PORTE DO PET COM RESERVA ATIVA
# ==============================================================================


def _update_pet(client, headers, pet, **overrides):
    tutor_id = client.get("/api/v1/tutores", headers=headers).json()[0]["id"]
    payload = {
        "name": pet["name"],
        "species": pet["species"],
        "breed": pet["breed"],
        "size": pet["size"],
        "tutor_id": tutor_id,
        **overrides,
    }
    return client.put(f"/api/v1/pets/{pet['id']}", json=payload, headers=headers)


def test_pet_size_cannot_change_while_pending_or_confirmed_appointments_exist(client, auth_headers):
    pet, professional = _scenario(client, auth_headers, size="Pequeno")
    appointment = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()

    pending = _update_pet(client, auth_headers, pet, size="Grande")
    assert _set_status(client, auth_headers, appointment["id"], "Confirmado").status_code == 200
    confirmed = _update_pet(client, auth_headers, pet, size="Grande")

    assert pending.status_code == 409
    assert "porte" in pending.json()["detail"]
    assert confirmed.status_code == 409
    # O porte não foi alterado e a duração gravada continua coerente com ele.
    assert client.get("/api/v1/pets", headers=auth_headers).json()[0]["size"] == "Pequeno"
    assert client.get("/api/v1/agendamentos", headers=auth_headers).json()[0]["durationMinutes"] == 60


def test_pet_size_can_change_after_appointments_are_cancelled_or_concluded(client, auth_headers):
    pet, professional = _scenario(client, auth_headers, size="Pequeno")
    first = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()
    second = _create_appointment(
        client, auth_headers, pet["id"], professional["id"], start_time="11:00:00"
    ).json()
    assert _set_status(client, auth_headers, first["id"], "Cancelado").status_code == 200
    assert _set_status(client, auth_headers, second["id"], "Concluído").status_code == 200

    response = _update_pet(client, auth_headers, pet, size="Gigante")

    assert response.status_code == 200
    assert response.json()["size"] == "Gigante"


def test_pet_other_fields_can_change_with_active_appointments_when_size_is_kept(client, auth_headers):
    pet, professional = _scenario(client, auth_headers, size="Pequeno")
    _create_appointment(client, auth_headers, pet["id"], professional["id"])

    response = _update_pet(client, auth_headers, pet, name="Thor II", breed="Poodle")

    assert response.status_code == 200
    assert response.json()["name"] == "Thor II"


# ==============================================================================
# PI-04 — HORÁRIOS EM MINUTO INTEIRO
# ==============================================================================


def test_start_time_with_seconds_is_normalized_to_the_whole_minute(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)

    response = _create_appointment(client, auth_headers, pet["id"], professional["id"], start_time="09:00:45")

    assert response.status_code == 201
    assert response.json()["startTime"] == "09:00:00"


def test_seconds_do_not_let_a_booking_slip_into_the_next_minute_of_another_one(client, auth_headers):
    # Banho (60 min) às 09:00 ocupa [09:00, 10:00). Um pedido às 09:59:59 vira 09:59 e conflita.
    # Sem a normalização, a regra em memória (minutos) e o banco (segundos) divergiriam.
    pet, professional = _scenario(client, auth_headers)
    assert _create_appointment(client, auth_headers, pet["id"], professional["id"]).status_code == 201

    overlapping = _create_appointment(
        client, auth_headers, pet["id"], professional["id"], start_time="09:59:59"
    )
    adjacent = _create_appointment(client, auth_headers, pet["id"], professional["id"], start_time="10:00:30")

    assert overlapping.status_code == 409
    assert adjacent.status_code == 201
    assert adjacent.json()["startTime"] == "10:00:00"


def test_reschedule_payload_is_also_normalized(client, auth_headers):
    pet, professional = _scenario(client, auth_headers)
    appointment = _create_appointment(client, auth_headers, pet["id"], professional["id"]).json()

    response = client.put(
        f"/api/v1/agendamentos/{appointment['id']}",
        json=_booking_payload(pet["id"], professional["id"], start_time="14:30:59"),
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["startTime"] == "14:30:00"
