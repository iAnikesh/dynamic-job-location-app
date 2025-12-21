export const INDUSTRIES = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Education', label: 'Education' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Media', label: 'Media' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Consulting', label: 'Consulting' },
    { value: 'Other', label: 'Other' }
];

export const getIndustryLabel = (value) => {
    const industry = INDUSTRIES.find(ind => ind.value === value);
    return industry ? industry.label : value;
};
