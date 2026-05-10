import { useEffect, useMemo, useState } from 'react';
import { Card, CardTitle } from '../../components/ui/card';
import { DollarSign, List } from 'lucide-react';
import * as Icons from 'lucide-react';
import AppShell from '../../layouts/AppShell';
import { WowKPICard } from '../../components/ui';
import { useData } from '../../state/DataContext';
import { servicesApi } from '../../api/client';
import { DEMO_MODE } from '../../config/appMode';
import { getPricingDisplay } from '../../utils/pricingDisplay';

interface PriceListItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  featureId: string;
  featureName: string;
  featureIcon?: string;
  domain?: string;
  serviceKind?: string;
  pricingMode?: string;
  complexity?: string;
  requiresVisit?: boolean;
  isCore?: boolean;
}

export default function CustomerPriceList() {
  const { features, services, loading, isApiAvailable } = useData();
  const [priceList, setPriceList] = useState<PriceListItem[]>([]);
  const [priceListLoading, setPriceListLoading] = useState(false);
  const [priceListFailed, setPriceListFailed] = useState(false);

  const fallbackPriceList = useMemo<PriceListItem[]>(() => services.map(service => {
    const feature = features.find(f => f.id === service.featureId);
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      featureId: service.featureId,
      featureName: feature?.name || 'General',
      featureIcon: feature?.icon,
      domain: service.domain,
      serviceKind: service.serviceKind,
      pricingMode: service.pricingMode,
      complexity: service.complexity,
      requiresVisit: service.requiresVisit,
      isCore: service.isCore,
    };
  }), [features, services]);

  useEffect(() => {
    if (loading.catalog) return;

    if (DEMO_MODE || !isApiAvailable) {
      setPriceList(fallbackPriceList);
      setPriceListFailed(false);
      setPriceListLoading(false);
      return;
    }

    let cancelled = false;
    setPriceListLoading(true);
    setPriceListFailed(false);

    servicesApi.getPriceList()
      .then(({ price_list }) => {
        if (cancelled) return;
        const mapped = (price_list || []).flatMap((group: any) => {
          const feature = group.feature || {};
          return (group.services || []).map((service: any) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: Number(service.price ?? service.base_price ?? 0),
            featureId: feature.id || service.feature_id || '',
            featureName: feature.name || 'General',
            featureIcon: feature.icon,
            domain: service.domain,
            serviceKind: service.service_kind || service.serviceKind,
            pricingMode: service.pricing_mode || service.pricingMode,
            complexity: service.complexity,
            requiresVisit: service.requires_visit ?? service.requiresVisit,
            isCore: service.is_core ?? service.isCore,
          }));
        });
        setPriceList(mapped);
      })
      .catch((err) => {
        console.error('Failed to load price list from API; using catalog fallback:', err);
        if (!cancelled) {
          setPriceList(fallbackPriceList);
          setPriceListFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPriceListLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackPriceList, isApiAvailable, loading.catalog]);

  const visiblePriceList = priceList.length > 0 || (!loading.catalog && !priceListLoading)
    ? priceList
    : fallbackPriceList;

  const avgPrice = visiblePriceList.length
    ? Math.round(visiblePriceList.reduce((sum, service) => sum + service.price, 0) / visiblePriceList.length)
    : 0;

  const getIcon = (iconName?: string) => {
    return (Icons as any)[iconName || 'Zap'] || Icons.List;
  };

  return (
    <AppShell title="Price List" subtitle="Standardized prices defined with the Engineers Syndicate">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <WowKPICard
            title="Services"
            value={visiblePriceList.length}
            subtitle="Available"
            icon={<List className="w-5 h-5" />}
            accentColor="#136F94"
          />
          <WowKPICard
            title="Avg Price"
            value={`₪${avgPrice}`}
            subtitle="Per service"
            icon={<DollarSign className="w-5 h-5" />}
            accentColor="#7C3AED"
          />
        </div>

        {/* Price Cards */}
        {loading.catalog || priceListLoading ? (
          <Card className="p-8 text-center">
            <p className="text-text-secondary">Loading price list...</p>
          </Card>
        ) : visiblePriceList.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-text-secondary">No prices are available right now.</p>
          </Card>
        ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {visiblePriceList.map(service => {
            const IconComponent = getIcon(service.featureIcon);
            const pricing = getPricingDisplay(service.pricingMode, service.price);
            return (
              <Card key={service.id} className="p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <p className="text-sm text-text-muted mt-1">Category: {service.featureName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand">{pricing.value}</p>
                    <p className="text-xs text-text-muted">{pricing.label}</p>
                    <span className="mt-2 inline-flex rounded-full bg-brand/10 px-2 py-0.5 text-[11px] font-semibold text-brand">
                      {pricing.modeLabel}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        )}

        {/* Info Note */}
        <Card className="p-4 bg-brand/5 border-brand/20">
          <p className="text-sm text-text-secondary">
            <strong>Note:</strong> These prices are regulated standards. Actual costs may vary based on complexity, parts needed, and location.
            {priceListFailed ? ' Showing fallback prices because the backend price list could not be loaded.' : ''}
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
