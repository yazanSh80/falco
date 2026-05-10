"""
Recommendation v1 regression tests.
"""
from datetime import date, timedelta

from app.extensions import db
from app.models.engineer_profile import EngineerProfile, SubscriptionStatus
from app.models.request import Request, RequestStatus, RequestType
from app.models.user import User, UserRole, UserStatus

TEST_PASSWORD = 'TestPass123'


def _auth_headers(client, email='customer@test.com'):
    response = client.post('/api/auth/login', json={
        'email': email,
        'password': TEST_PASSWORD
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}


def _create_engineer(
    name,
    email,
    phone,
    area='City Center',
    domain='electrical',
    rating_avg=4.5,
    rating_count=10
):
    user = User(
        name=name,
        email=email,
        phone=phone,
        role=UserRole.ENGINEER.value,
        status=UserStatus.ACTIVE.value,
        city='Hebron',
        area=area
    )
    user.set_password(TEST_PASSWORD)
    db.session.add(user)
    db.session.flush()

    profile = EngineerProfile(
        user_id=user.id,
        specialization='Electrical work',
        domain=domain,
        years_exp=5,
        rating_avg=rating_avg,
        rating_count=rating_count,
        subscription_status=SubscriptionStatus.ACTIVE.value,
        subscription_expiry=date.today() + timedelta(days=30)
    )
    db.session.add(profile)
    db.session.commit()
    return user


def _create_active_job(customer_id, engineer_id, request_number, status):
    request_row = Request(
        request_number=request_number,
        customer_id=customer_id,
        engineer_id=engineer_id,
        type=RequestType.QUICK.value,
        status=status,
        description='Active recommendation availability check',
        location_text='City Center'
    )
    db.session.add(request_row)


def test_recommendations_rank_by_area_domain_rating_and_availability(client, customer_user):
    local_engineer = _create_engineer(
        'Local Electrical',
        'local-electrical@test.com',
        '0599444001',
        area='City Center',
        domain='electrical',
        rating_avg=4.8
    )
    _create_engineer(
        'Remote Electrical',
        'remote-electrical@test.com',
        '0599444002',
        area='North',
        domain='electrical',
        rating_avg=5.0
    )
    _create_engineer(
        'Local AC',
        'local-ac@test.com',
        '0599444003',
        area='City Center',
        domain='ac',
        rating_avg=5.0
    )

    headers = _auth_headers(client)
    response = client.get(
        '/api/recommendations/engineers?area=City Center&domain=electrical',
        headers=headers
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data['recommendation_version'] == 'v1'
    assert data['engineers'][0]['id'] == local_engineer.id
    assert all(item['domain'] == 'electrical' for item in data['engineers'])
    assert set(data['engineers'][0]['score_breakdown']) == {
        'area',
        'domain',
        'rating',
        'availability'
    }
    assert 'jobs_completed' not in data['engineers'][0]
    assert data['filters'] == {'area': 'City Center', 'domain': 'electrical'}


def test_recommendations_validate_domain(client, customer_user):
    headers = _auth_headers(client)
    response = client.get(
        '/api/recommendations/engineers?domain=plumbing',
        headers=headers
    )

    data = response.get_json()

    assert response.status_code == 400
    assert data['error'] == 'Invalid domain'


def test_recommendations_availability_reduces_score(client, customer_user):
    busy_engineer = _create_engineer(
        'Busy Electrical',
        'busy-electrical@test.com',
        '0599444004',
        rating_avg=5.0
    )
    available_engineer = _create_engineer(
        'Available Electrical',
        'available-electrical@test.com',
        '0599444005',
        rating_avg=5.0
    )
    statuses = [
        RequestStatus.ROUTED.value,
        RequestStatus.ACCEPTED.value,
        RequestStatus.IN_PROGRESS.value
    ]
    for index, status in enumerate(statuses, start=1):
        _create_active_job(
            customer_user.id,
            busy_engineer.id,
            f'R-AVAIL-{index}',
            status
        )
    db.session.commit()

    headers = _auth_headers(client)
    response = client.get(
        '/api/recommendations/engineers?area=City Center&domain=electrical',
        headers=headers
    )

    data = response.get_json()
    ids = [item['id'] for item in data['engineers']]

    assert response.status_code == 200
    assert ids.index(available_engineer.id) < ids.index(busy_engineer.id)
    busy_row = next(item for item in data['engineers'] if item['id'] == busy_engineer.id)
    assert busy_row['is_available'] is False
    assert busy_row['score_breakdown']['availability']['weighted'] == 0


def test_suggestions_endpoint_has_no_classifier(client, customer_user):
    headers = _auth_headers(client)
    response = client.post(
        '/api/recommendations/suggestions',
        json={'description': 'Electrical outlet is sparking'},
        headers=headers
    )

    data = response.get_json()

    assert response.status_code == 410
    assert data['error'] == 'not_available'
