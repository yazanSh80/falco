"""
Payment lite tests for manual finance operations.
"""
from app.models.payment_record import PaymentMethod, PaymentPurpose, PaymentStatus
from app.models.request import RequestIntent


TEST_PASSWORD = 'TestPass123'


def _login(client, email):
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': TEST_PASSWORD
    })
    return {'Authorization': f"Bearer {response.get_json()['access_token']}"}


def _create_service_request(client, headers):
    response = client.post('/api/requests', json={
        'service_id': 'S1',
        'type': 'late',
        'description': 'Need lighting repair',
        'location_text': 'Hebron'
    }, headers=headers)
    assert response.status_code == 201
    return response.get_json()['request']


def _create_inspection_request(client, headers):
    response = client.post('/api/requests', json={
        'type': 'quick',
        'request_intent': RequestIntent.INSPECTION.value,
        'category': 'electrical',
        'description': 'Need inspection',
        'location_text': 'Hebron'
    }, headers=headers)
    assert response.status_code == 201
    return response.get_json()['request']


def _create_project_request(client, headers):
    response = client.post('/api/requests', json={
        'type': 'late',
        'request_intent': RequestIntent.PROJECT_SPECIAL.value,
        'domain': 'solar',
        'description': 'Solar project inquiry',
        'location_text': 'Hebron'
    }, headers=headers)
    assert response.status_code == 201
    return response.get_json()['request']


class TestPaymentLite:
    """Test payment lite records without online gateway behavior."""

    def test_customer_creates_cash_service_payment_from_request_price(
        self, client, customer_user, sample_services, app
    ):
        customer_headers = _login(client, 'customer@test.com')
        service_request = _create_service_request(client, customer_headers)

        response = client.post('/api/finance/payments', json={
            'request_id': service_request['id'],
            'method': PaymentMethod.CASH.value
        }, headers=customer_headers)

        assert response.status_code == 201
        payment = response.get_json()['payment']
        assert payment['method'] == PaymentMethod.CASH.value
        assert payment['purpose'] == PaymentPurpose.SERVICE.value
        assert payment['status'] == PaymentStatus.PENDING.value
        assert payment['amount'] == 120

    def test_bank_or_wallet_proof_is_marked_proof_submitted(
        self, client, customer_user, sample_services, app
    ):
        customer_headers = _login(client, 'customer@test.com')
        service_request = _create_service_request(client, customer_headers)

        response = client.post('/api/finance/payments', json={
            'request_id': service_request['id'],
            'method': PaymentMethod.WALLET.value,
            'proof_reference': 'wallet-proof-001'
        }, headers=customer_headers)

        assert response.status_code == 201
        payment = response.get_json()['payment']
        assert payment['method'] == PaymentMethod.WALLET.value
        assert payment['status'] == PaymentStatus.PROOF_SUBMITTED.value
        assert payment['proof_reference'] == 'wallet-proof-001'

    def test_inspection_fee_payment_can_use_manual_amount(
        self, client, customer_user, app
    ):
        customer_headers = _login(client, 'customer@test.com')
        inspection_request = _create_inspection_request(client, customer_headers)

        response = client.post('/api/finance/payments', json={
            'request_id': inspection_request['id'],
            'method': PaymentMethod.CASH.value,
            'purpose': PaymentPurpose.INSPECTION.value,
            'amount': 50
        }, headers=customer_headers)

        assert response.status_code == 201
        payment = response.get_json()['payment']
        assert payment['purpose'] == PaymentPurpose.INSPECTION.value
        assert payment['amount'] == 50

    def test_project_payment_direction_defaults_to_zero_manual_followup(
        self, client, customer_user, app
    ):
        customer_headers = _login(client, 'customer@test.com')
        project_request = _create_project_request(client, customer_headers)

        response = client.post('/api/finance/payments', json={
            'request_id': project_request['id'],
            'method': PaymentMethod.CASH.value
        }, headers=customer_headers)

        assert response.status_code == 201
        payment = response.get_json()['payment']
        assert payment['purpose'] == PaymentPurpose.PROJECT_DIRECTION.value
        assert payment['amount'] == 0
        assert payment['payout_settlement_scope'] == 'later_scope'

    def test_admin_confirms_payment_and_records_commission(
        self, client, customer_user, admin_user, sample_services, app
    ):
        customer_headers = _login(client, 'customer@test.com')
        admin_headers = _login(client, 'admin@test.com')
        service_request = _create_service_request(client, customer_headers)

        create_response = client.post('/api/finance/payments', json={
            'request_id': service_request['id'],
            'method': PaymentMethod.BANK_TRANSFER.value,
            'amount': 1000,
            'proof_reference': 'bank-proof-001'
        }, headers=customer_headers)
        payment_id = create_response.get_json()['payment']['id']

        response = client.patch(f'/api/finance/admin/payments/{payment_id}', json={
            'status': PaymentStatus.CONFIRMED.value
        }, headers=admin_headers)

        assert response.status_code == 200
        payment = response.get_json()['payment']
        assert payment['status'] == PaymentStatus.CONFIRMED.value
        assert payment['commission_rate'] == 0.05
        assert payment['commission_amount'] == 50
        assert payment['net_amount'] == 950
