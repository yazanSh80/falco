"""
Debug JWT Token Issue
"""
from app import create_app
from app.extensions import db
from app.models.user import User, UserRole, UserStatus

# Create app with TESTING config already set
app = create_app()
app.config.update({
    'TESTING': True,
    # 'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
})

print('JWT Secret:', app.config['JWT_SECRET_KEY'])

with app.app_context():
    db.create_all()
    
    # Create user
    user = User(
        name='Test',
        email='test@test.com',
        role=UserRole.CUSTOMER.value,
        status=UserStatus.ACTIVE.value
    )
    user.set_password('TestPass123')
    db.session.add(user)
    db.session.commit()
    
    client = app.test_client()
    
    # Login
    resp = client.post('/api/auth/login', json={
        'email': 'test@test.com',
        'password': 'TestPass123'
    })
    print('Login status:', resp.status_code)
    data = resp.get_json()
    print('Login response keys:', data.keys() if data else 'None')
    
    if 'access_token' in data:
        token = data['access_token']
        print('Token:', token[:50] + '...')
        
        # Decode the token manually
        import jwt
        try:
            decoded = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            print('Decoded token:', decoded)
        except Exception as e:
            print('Decode error:', e)
        
        # Try to get /me
        me_resp = client.get('/api/auth/me', headers={
            'Authorization': f'Bearer {token}'
        })
        print('Me status:', me_resp.status_code)
        print('Me response:', me_resp.get_json())
