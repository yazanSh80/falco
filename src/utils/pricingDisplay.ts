export function getPricingDisplay(pricingMode?: string, price?: number) {
  const amount = typeof price === 'number' && Number.isFinite(price) ? price : 0;

  switch (pricingMode) {
    case 'after_visit':
      return {
        value: 'After visit',
        label: 'Priced after inspection',
        modeLabel: 'After visit',
      };
    case 'inspection_fee':
      return {
        value: amount > 0 ? `₪${amount}` : 'Inspection fee',
        label: 'Inspection fee',
        modeLabel: 'Inspection fee',
      };
    case 'project_quote':
      return {
        value: 'Project quote',
        label: 'Reviewed by operations',
        modeLabel: 'Project quote',
      };
    case 'not_applicable':
      return {
        value: 'Not listed',
        label: 'No public price',
        modeLabel: 'Not listed',
      };
    case 'fixed':
    default:
      return {
        value: `₪${amount}`,
        label: 'Fixed rate',
        modeLabel: 'Fixed',
      };
  }
}
