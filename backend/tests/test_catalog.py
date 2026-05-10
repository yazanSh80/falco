"""
Catalog consistency tests for backend-first service reads.
"""
from app.extensions import db
from app.models.service import Feature, Service


class TestCatalogConsistency:
    """Verify service catalog endpoints agree on IDs, grouping, and defaults."""

    def test_list_detail_and_price_list_use_same_service_identity(self, client, sample_services):
        response = client.get('/api/services')
        assert response.status_code == 200

        services = response.get_json()['services']
        assert len(services) == 1
        assert services[0]['id'] == 'S1'
        assert services[0]['feature_id'] == 'F1'
        assert services[0]['base_price'] == 120
        assert services[0]['domain'] == 'electrical'
        assert services[0]['service_kind'] == 'standard_service'
        assert services[0]['pricing_mode'] == 'fixed'
        assert services[0]['complexity'] == 'standard'
        assert services[0]['requires_visit'] is True
        assert services[0]['is_core'] is True
        assert services[0]['feature']['id'] == 'F1'

        detail_response = client.get('/api/services/S1')
        assert detail_response.status_code == 200
        detail = detail_response.get_json()['service']
        assert detail['id'] == services[0]['id']
        assert detail['feature_id'] == services[0]['feature_id']
        assert detail['base_price'] == services[0]['base_price']
        assert detail['complexity'] == services[0]['complexity']
        assert detail['requires_visit'] == services[0]['requires_visit']

        price_response = client.get('/api/services/price-list')
        assert price_response.status_code == 200
        price_list = price_response.get_json()['price_list']
        listed_services = [
            service
            for group in price_list
            for service in group['services']
        ]
        assert [service['id'] for service in listed_services] == ['S1']
        assert listed_services[0]['price'] == services[0]['base_price']
        assert listed_services[0]['pricing_mode'] == services[0]['pricing_mode']
        assert listed_services[0]['complexity'] == services[0]['complexity']
        assert listed_services[0]['requires_visit'] == services[0]['requires_visit']

    def test_default_catalog_filters_only_public_core_services(self, client, sample_services):
        hidden = Service(
            id='S2',
            feature_id='F1',
            name='Hidden Service',
            description='Hidden from public catalog',
            base_price=150,
            is_visible=False
        )
        inactive = Service(
            id='S3',
            feature_id='F1',
            name='Inactive Service',
            description='Inactive service',
            base_price=160,
            active=False
        )
        non_core = Service(
            id='S4',
            feature_id='F1',
            name='Non-core Service',
            description='Non-core service',
            base_price=170,
            is_core=False
        )
        db.session.add_all([hidden, inactive, non_core])
        db.session.commit()

        response = client.get('/api/services')
        assert response.status_code == 200
        assert [service['id'] for service in response.get_json()['services']] == ['S1']

        feature_response = client.get('/api/services/features?include_services=true')
        assert feature_response.status_code == 200
        feature_services = feature_response.get_json()['features'][0]['services']
        assert [service['id'] for service in feature_services] == ['S1']

        price_response = client.get('/api/services/price-list')
        assert price_response.status_code == 200
        listed_ids = [
            service['id']
            for group in price_response.get_json()['price_list']
            for service in group['services']
        ]
        assert listed_ids == ['S1']

    def test_services_keep_valid_feature_references(self, client, sample_services):
        extra_feature = Feature(
            id='F2',
            name='AC',
            icon='Snowflake',
            description='AC services'
        )
        extra_service = Service(
            id='S5',
            feature_id='F2',
            name='AC Basic Check',
            description='Basic AC check',
            base_price=180
        )
        db.session.add_all([extra_feature, extra_service])
        db.session.commit()

        features_response = client.get('/api/services/features')
        services_response = client.get('/api/services')

        assert features_response.status_code == 200
        assert services_response.status_code == 200

        feature_ids = {feature['id'] for feature in features_response.get_json()['features']}
        for service in services_response.get_json()['services']:
            assert service['feature_id'] in feature_ids
            assert service['feature']['id'] == service['feature_id']

    def test_baseline_seed_metadata_mapping_uses_allowed_values(self):
        from seed_baseline import BASE_SERVICES

        for service in BASE_SERVICES:
            assert service['domain'] in Service.ALLOWED_DOMAINS
            assert service['service_kind'] in Service.ALLOWED_SERVICE_KINDS
            assert service['pricing_mode'] in Service.ALLOWED_PRICING_MODES
            assert service['complexity'] in Service.ALLOWED_COMPLEXITIES
            assert isinstance(service['requires_visit'], bool)
            assert isinstance(service['is_core'], bool)

    def test_core_catalog_v1_default_api_contains_only_core_services(self, client, app):
        from seed_baseline import BASE_FEATURES, BASE_SERVICES

        for feature in BASE_FEATURES:
            db.session.add(Feature(**feature))
        for service in BASE_SERVICES:
            db.session.add(Service(**service))
        db.session.commit()

        response = client.get('/api/services')
        assert response.status_code == 200
        core_ids = {service['id'] for service in response.get_json()['services']}
        assert core_ids == {'EL001', 'AC001', 'LC001'}

        price_response = client.get('/api/services/price-list')
        assert price_response.status_code == 200
        price_ids = {
            service['id']
            for group in price_response.get_json()['price_list']
            for service in group['services']
        }
        assert price_ids == core_ids

        all_public_response = client.get('/api/services?core=false')
        assert all_public_response.status_code == 200
        all_public_ids = {service['id'] for service in all_public_response.get_json()['services']}
        assert {'FB001', 'SM001', 'SO001'}.issubset(all_public_ids)
        assert 'SP001' not in all_public_ids
