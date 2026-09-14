export const isPublicCatalogueEligible = (movieOrSource: { availabilityStatus: string }) => {
    return movieOrSource.availabilityStatus !== 'UNAVAILABLE';
};

export const getAvailableFilter = () => {
    return { NOT: { availabilityStatus: 'UNAVAILABLE' } };
};
