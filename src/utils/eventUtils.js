// Helper function to create a generic event when the requested one is not found
export function createGenericEvent(eventId) {
  return {
    _id: eventId,
    id: eventId,
    title: `Event ${eventId}`,
    description: 'This event could not be loaded. This is a placeholder event with sample data.',
    image: 'https://source.unsplash.com/random/800x600/?event',
    date: new Date().toISOString(),
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    location: 'Location not specified',
    venue: {
      name: 'Venue not specified',
      address: 'Address not available',
      city: 'City not specified'
    },
    category: 'other',
    price: 4999, // Default price for the event in INR
    minPrice: 1999,
    maxPrice: 19999,
    hasMultiplePrices: true,
    capacity: 100,
    registered: 0,
    isFree: true,
    rating: 0,
    organizer: {
      id: 'sample-organizer',
      name: 'Event Organizer',
      email: 'organizer@example.com'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    availableTickets: 100,
    soldTickets: 0,
    __isFallback: true
  };
}
