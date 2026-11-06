import { nanoid } from "nanoid";

interface ExternalEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  endDate?: Date;
  location: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  category: string;
  price?: string;
  currency: string;
  imageUrl?: string;
  websiteUrl?: string;
  ticketUrl?: string;
  source: string;
  sourceId: string;
}

export class EventAggregator {

  // Enhanced mock events with more variety and better categorization
  private getMockEvents(city: string, state: string): ExternalEvent[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return [
      {
        id: `mock_eventbrite_${nanoid()}`,
        title: `${city} Tech Meetup`,
        description: `Join fellow tech enthusiasts in ${city} for networking, discussions on the latest trends, and hands-on workshops. Great opportunity to connect with local developers and entrepreneurs.`,
        eventDate: tomorrow,
        location: `${city} Convention Center`,
        address: `123 Main St, ${city}, ${state}`,
        city,
        state,
        zipCode: '12345',
        category: 'Technology',
        price: 'Free',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
        websiteUrl: `https://meetup.com/${city.toLowerCase()}-tech`,
        ticketUrl: `https://eventbrite.com/${city.toLowerCase()}-tech-meetup`,
        source: 'Eventbrite',
        sourceId: `eb_${nanoid()}`
      },
      {
        id: `mock_linkedin_${nanoid()}`,
        title: `${city} Business Innovation Summit`,
        description: `Leading entrepreneurs, investors, and business leaders gather in ${city} to discuss innovation, networking opportunities, and industry trends. Includes keynote presentations and panel discussions.`,
        eventDate: nextWeek,
        location: `${city} Business Center`,
        address: `456 Business Ave, ${city}, ${state}`,
        city,
        state,
        category: 'Professional & Networking',
        price: '$45',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
        websiteUrl: `https://linkedin.com/events/${city.toLowerCase()}-innovation-summit`,
        source: 'LinkedIn',
        sourceId: `li_${nanoid()}`
      },
      {
        id: `mock_meetup_${nanoid()}`,
        title: `${city} Art Walk`,
        description: `Monthly art walk featuring local galleries, street artists, and live performances. Explore the vibrant arts scene in downtown ${city}.`,
        eventDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: `Downtown ${city}`,
        address: `Downtown District, ${city}, ${state}`,
        city,
        state,
        category: 'Arts & Culture',
        price: 'Free',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        websiteUrl: `https://meetup.com/${city.toLowerCase()}-art-walk`,
        source: 'Meetup',
        sourceId: `mu_${nanoid()}`
      },
      {
        id: `mock_news_${nanoid()}`,
        title: `${city} Business Conference 2024`,
        description: `Annual business conference bringing together industry leaders, entrepreneurs, and professionals. Keynote speakers, networking opportunities, and workshops on business growth.`,
        eventDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        location: `${city} Business Center`,
        address: `789 Business Blvd, ${city}, ${state}`,
        city,
        state,
        category: 'Business & Professional',
        price: '$50',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
        websiteUrl: `https://businessconference${city.toLowerCase()}.com`,
        source: 'Business News',
        sourceId: `news_${nanoid()}`
      },
      {
        id: `mock_sports_${nanoid()}`,
        title: `${city} Marathon`,
        description: `Annual marathon event through the scenic routes of ${city}. Full marathon, half marathon, and 5K options available. Registration includes t-shirt and medal.`,
        eventDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        location: `${city} Stadium`,
        address: `321 Sports Dr, ${city}, ${state}`,
        city,
        state,
        category: 'Sports & Recreation',
        price: '$30-75',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400',
        websiteUrl: `https://${city.toLowerCase()}marathon.org`,
        source: 'Sports News',
        sourceId: `sports_${nanoid()}`
      },
      {
        id: `mock_linkedin_${nanoid()}`,
        title: `${city} Professional Networking Event`,
        description: `Connect with industry professionals in ${city}. Panel discussions on career growth, industry trends, and professional development opportunities.`,
        eventDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        location: `${city} Chamber of Commerce`,
        address: `555 Business Ave, ${city}, ${state}`,
        city,
        state,
        category: 'Networking',
        price: '$15',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400',
        websiteUrl: `https://linkedin.com/events/${city.toLowerCase()}-networking`,
        source: 'LinkedIn Events',
        sourceId: `li_${nanoid()}`
      },
      {
        id: `mock_community_${nanoid()}`,
        title: `${city} Community Cleanup Day`,
        description: `Join neighbors for a community beautification project. Help clean local parks, plant trees, and make ${city} a better place to live.`,
        eventDate: new Date(today.getTime() + 8 * 24 * 60 * 60 * 1000),
        location: `${city} Community Center`,
        address: `789 Community Dr, ${city}, ${state}`,
        city,
        state,
        category: 'Community',
        price: 'Free',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400',
        websiteUrl: `https://nextdoor.com/${city.toLowerCase()}-cleanup`,
        source: 'Community Board',
        sourceId: `comm_${nanoid()}`
      },
      {
        id: `mock_wellness_${nanoid()}`,
        title: `${city} Wellness Workshop`,
        description: `Mindfulness meditation, yoga session, and wellness tips from local health experts. Perfect for stress relief and mental health awareness.`,
        eventDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        location: `${city} Wellness Center`,
        address: `321 Health St, ${city}, ${state}`,
        city,
        state,
        category: 'Health & Wellness',
        price: '$25',
        currency: 'USD',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68e71?w=400',
        websiteUrl: `https://wellnesscenter${city.toLowerCase()}.com`,
        source: 'Wellness Platform',
        sourceId: `well_${nanoid()}`
      }
    ];
  }
  
  // Eventbrite API integration (requires API key)
  async fetchEventbriteEvents(city: string, state: string, radius = 25): Promise<ExternalEvent[]> {
    const apiKey = process.env.EVENTBRITE_API_KEY;
    if (!apiKey) {
      console.log("Eventbrite API key not configured");
      return [];
    }

    try {
      const location = `${city}, ${state}`;
      const url = `https://www.eventbriteapi.com/v3/events/search/?location.address=${encodeURIComponent(location)}&location.within=${radius}mi&expand=venue,category&sort_by=date`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Eventbrite API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.events?.slice(0, 10).map((event: any) => ({
        id: `eventbrite_${event.id}`,
        title: event.name?.text || 'Untitled Event',
        description: event.description?.text || event.summary || '',
        eventDate: new Date(event.start.utc),
        endDate: event.end ? new Date(event.end.utc) : undefined,
        location: event.venue?.name || 'TBD',
        address: event.venue?.address?.localized_address_display || '',
        city: city,
        state: state,
        zipCode: event.venue?.address?.postal_code,
        category: event.category?.name || 'General',
        price: event.is_free ? 'Free' : 'Paid',
        currency: 'USD',
        imageUrl: event.logo?.url,
        websiteUrl: event.url,
        ticketUrl: event.url,
        source: 'Eventbrite',
        sourceId: event.id
      })) || [];

    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      return [];
    }
  }

  // Meetup API integration with enhanced location filtering
  async fetchMeetupEvents(city: string, state: string, radius = 25): Promise<ExternalEvent[]> {
    const apiKey = process.env.MEETUP_API_KEY;
    if (!apiKey) {
      console.log("Meetup API key not configured");
      return [];
    }

    try {
      // Enhanced Meetup API with better location parameters
      const searchParams = new URLSearchParams({
        'city': city,
        'state': state,
        'radius': radius.toString(),
        'page': '15', // Fetch more to account for filtering
        'status': 'upcoming',
        'only': 'id,name,description,time,duration,venue,group,featured_photo,link',
        'desc': 'true' // Include full descriptions for better categorization
      });
      
      const url = `https://api.meetup.com/find/upcoming_events?${searchParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Meetup API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.events?.filter((event: any) => {
        // Additional server-side location validation
        if (event.venue) {
          const venueCity = event.venue.city?.toLowerCase() || '';
          const venueState = event.venue.state?.toLowerCase() || '';
          const stateMatch = venueState === state.toLowerCase() || 
                           venueState === this.getStateAbbreviation(state).toLowerCase();
          const cityMatch = venueCity === city.toLowerCase();
          
          return cityMatch && stateMatch;
        }
        return true; // Keep events without venue info (online events)
      }).slice(0, 10).map((event: any) => ({
        id: `meetup_${event.id}`,
        title: event.name || 'Untitled Meetup',
        description: event.description || '',
        eventDate: new Date(event.time),
        endDate: event.duration ? new Date(event.time + event.duration) : undefined,
        location: event.venue?.name || event.group?.name || 'Online Event',
        address: event.venue ? `${event.venue.address_1 || ''} ${event.venue.city || ''}` : '',
        city: event.venue?.city || city,
        state: event.venue?.state || state,
        zipCode: event.venue?.zip,
        category: event.group?.category?.name || 'Social',
        price: 'Free',
        currency: 'USD',
        imageUrl: event.featured_photo?.photo_link,
        websiteUrl: event.link,
        ticketUrl: event.link,
        source: 'Meetup',
        sourceId: event.id
      })) || [];

    } catch (error) {
      console.error('Error fetching Meetup events:', error);
      return [];
    }
  }

  // LinkedIn Events API integration with server-side location filtering
  async fetchLinkedInEvents(city: string, state: string, radius = 25): Promise<ExternalEvent[]> {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!accessToken) {
      console.log("LinkedIn API access token not configured");
      return [];
    }

    try {
      // Enhanced LinkedIn Events API with location filters
      const location = `${city}, ${state}`;
      const searchParams = new URLSearchParams({
        'location': location,
        'radius': radius.toString(),
        'eventType': 'NETWORKING,CONFERENCE,WORKSHOP,PROFESSIONAL_DEVELOPMENT',
        'timeRange.start': new Date().toISOString(),
        'count': '10'
      });
      
      const url = `https://api.linkedin.com/v2/events?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`);
      }

      const data = await response.json();
      
      const mappedEvents = data.elements?.map((event: any): ExternalEvent | null => {
        // Additional server-side validation for location accuracy
        const eventLocation = event.location?.description || '';
        const locationMatch = this.validateLocationMatch(eventLocation, city, state);
        
        if (!locationMatch) {
          return null; // Filter out non-matching locations
        }
        
        return {
          id: `linkedin_${event.id}`,
          title: event.name || 'Untitled Event',
          description: event.description || '',
          eventDate: new Date(event.startDate),
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          location: event.location?.description || 'TBD',
          address: event.location?.address || '',
          city: city,
          state: state,
          category: 'Professional & Networking',
          price: event.ticketType === 'FREE' ? 'Free' : 'Paid',
          currency: 'USD',
          imageUrl: event.primaryImage?.url,
          websiteUrl: `https://linkedin.com/events/${event.id}`,
          ticketUrl: event.registrationUrl,
          source: 'LinkedIn',
          sourceId: event.id
        };
      }) || [];
      
      return mappedEvents.filter((event: ExternalEvent | null): event is ExternalEvent => event !== null);

    } catch (error) {
      console.error('Error fetching LinkedIn events:', error);
      return [];
    }
  }

  // News-based events with enhanced server-side location filtering
  async fetchNewsBasedEvents(city: string, state: string): Promise<ExternalEvent[]> {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      console.log("News API key not configured");
      return [];
    }

    try {
      // Enhanced location-specific query with multiple location variants
      const locationTerms = [
        `"${city}, ${state}"`,
        `"${city}" AND "${state}"`,
        `"${city}" AND "${this.getStateAbbreviation(state)}"`
      ].join(' OR ');
      
      const eventTerms = '("event" OR "festival" OR "concert" OR "conference" OR "meetup" OR "gathering" OR "exhibition" OR "workshop" OR "seminar")';
      const query = `(${locationTerms}) AND ${eventTerms}`;
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.articles?.filter((article: any) => {
        // Server-side filtering for better location relevance
        const content = (article.title + ' ' + article.description + ' ' + (article.content || '')).toLowerCase();
        const hasEventKeywords = this.isEventRelated(content);
        const hasLocationMatch = this.validateLocationMatch(content, city, state);
        
        return hasEventKeywords && hasLocationMatch;
      }).slice(0, 10).map((article: any) => ({
        id: `news_${nanoid()}`,
        title: this.extractEventTitle(article.title),
        description: article.description || article.content?.substring(0, 200) + '...' || '',
        eventDate: this.extractEventDate(article.content) || new Date(article.publishedAt),
        location: city,
        address: '',
        city: city,
        state: state,
        category: this.categorizeNewsEvent(article.title + ' ' + article.description),
        price: 'TBD',
        currency: 'USD',
        imageUrl: article.urlToImage,
        websiteUrl: article.url,
        source: 'News',
        sourceId: article.url
      })) || [];

    } catch (error) {
      console.error('Error fetching news-based events:', error);
      return [];
    }
  }

  // Enhanced aggregate with filtering and categorization
  async aggregateEvents(city: string, state: string, category?: string, priceRange?: string): Promise<ExternalEvent[]> {
    // Check if any API keys are configured
    const hasApiKeys = process.env.EVENTBRITE_API_KEY || 
                      process.env.MEETUP_API_KEY || 
                      process.env.LINKEDIN_ACCESS_TOKEN || 
                      process.env.NEWS_API_KEY;

    if (!hasApiKeys) {
      console.log("No external API keys configured, returning filtered mock events for demonstration");
      let events = this.getMockEvents(city, state);
      
      // Apply category filter if specified
      if (category && category !== 'all') {
        events = events.filter(event => 
          event.category.toLowerCase().includes(category.toLowerCase()) ||
          category.toLowerCase().includes(event.category.toLowerCase())
        );
      }
      
      // Apply price filter if specified
      if (priceRange) {
        events = this.filterByPrice(events, priceRange);
      }
      
      return events;
    }

    const [eventbriteEvents, meetupEvents, linkedinEvents, newsEvents] = await Promise.allSettled([
      this.fetchEventbriteEvents(city, state),
      this.fetchMeetupEvents(city, state),
      this.fetchLinkedInEvents(city, state),
      this.fetchNewsBasedEvents(city, state)
    ]);

    const allEvents: ExternalEvent[] = [];

    if (eventbriteEvents.status === 'fulfilled') {
      allEvents.push(...eventbriteEvents.value);
    }
    if (meetupEvents.status === 'fulfilled') {
      allEvents.push(...meetupEvents.value);
    }
    if (linkedinEvents.status === 'fulfilled') {
      allEvents.push(...linkedinEvents.value);
    }
    if (newsEvents.status === 'fulfilled') {
      allEvents.push(...newsEvents.value);
    }

    // If no events from APIs, fall back to filtered mock events
    if (allEvents.length === 0) {
      console.log("No events from external APIs, falling back to filtered mock events");
      let events = this.getMockEvents(city, state);
      
      if (category && category !== 'all') {
        events = events.filter(event => 
          event.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      if (priceRange) {
        events = this.filterByPrice(events, priceRange);
      }
      
      return events;
    }

    // Apply filters to real events
    let filteredEvents = allEvents;
    
    if (category && category !== 'all') {
      filteredEvents = filteredEvents.filter(event => 
        event.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (priceRange) {
      filteredEvents = this.filterByPrice(filteredEvents, priceRange);
    }

    // Sort by date and remove duplicates
    return this.deduplicateEvents(filteredEvents)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
      .slice(0, 20); // Limit to 20 events
  }

  // Location utility methods for server-side filtering
  private validateLocationMatch(locationText: string, city: string, state: string): boolean {
    if (!locationText) return false;
    
    const text = locationText.toLowerCase();
    const cityLower = city.toLowerCase();
    const stateLower = state.toLowerCase();
    const stateAbbr = this.getStateAbbreviation(state).toLowerCase();
    
    // Check for city match
    const hasCityMatch = text.includes(cityLower);
    
    // Check for state match (full name or abbreviation)
    const hasStateMatch = text.includes(stateLower) || text.includes(stateAbbr);
    
    // Require both city and state for strong match, or just city for weaker match
    return (hasCityMatch && hasStateMatch) || hasCityMatch;
  }

  private getStateAbbreviation(state: string): string {
    const stateMap: { [key: string]: string } = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };
    
    const normalized = state.toLowerCase();
    return stateMap[normalized] || state.toUpperCase().slice(0, 2);
  }

  // Helper methods
  private isEventRelated(text: string): boolean {
    const eventKeywords = [
      'festival', 'concert', 'conference', 'meetup', 'workshop', 'seminar',
      'exhibition', 'fair', 'market', 'celebration', 'gathering', 'show',
      'performance', 'competition', 'tournament', 'convention'
    ];
    
    const lowerText = text.toLowerCase();
    return eventKeywords.some(keyword => lowerText.includes(keyword));
  }

  private extractEventTitle(title: string): string {
    // Clean up news titles to focus on event name
    return title
      .replace(/^.*?:\s*/, '') // Remove news source prefix
      .replace(/\s*-\s*.*$/, '') // Remove trailing source info
      .trim();
  }

  private extractEventDate(content: string): Date | null {
    if (!content) return null;
    
    // Look for date patterns in content
    const datePatterns = [
      /(\w+\s+\d{1,2},?\s+\d{4})/g, // January 15, 2024
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,  // 1/15/2024
      /(\d{4}-\d{2}-\d{2})/g         // 2024-01-15
    ];

    for (const pattern of datePatterns) {
      const match = content.match(pattern);
      if (match) {
        const date = new Date(match[0]);
        if (!isNaN(date.getTime()) && date > new Date()) {
          return date;
        }
      }
    }

    return null;
  }

  private categorizeNewsEvent(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('music') || lowerText.includes('concert') || lowerText.includes('festival')) {
      return 'Music & Entertainment';
    }
    if (lowerText.includes('business') || lowerText.includes('conference') || lowerText.includes('networking')) {
      return 'Business & Professional';
    }
    if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('culinary')) {
      return 'Food & Drink';
    }
    if (lowerText.includes('art') || lowerText.includes('gallery') || lowerText.includes('exhibition')) {
      return 'Arts & Culture';
    }
    if (lowerText.includes('sport') || lowerText.includes('game') || lowerText.includes('tournament')) {
      return 'Sports & Recreation';
    }
    
    return 'Community';
  }

  private deduplicateEvents(events: ExternalEvent[]): ExternalEvent[] {
    const seen = new Set();
    return events.filter(event => {
      const key = `${event.title.toLowerCase()}_${event.eventDate.toDateString()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  
  private filterByPrice(events: ExternalEvent[], priceRange: string): ExternalEvent[] {
    return events.filter(event => {
      const price = event.price?.toLowerCase() || '';
      
      switch (priceRange) {
        case 'free':
          return price === 'free' || price === '$0' || price === '0';
        case 'under-25':
          if (price === 'free') return true;
          const match25 = price.match(/\$?(\d+)/);
          return match25 && parseInt(match25[1]) < 25;
        case 'under-50':
          if (price === 'free') return true;
          const match50 = price.match(/\$?(\d+)/);
          return match50 && parseInt(match50[1]) < 50;
        case 'over-50':
          const matchOver = price.match(/\$?(\d+)/);
          return matchOver && parseInt(matchOver[1]) >= 50;
        default:
          return true;
      }
    });
  }
  
  // Enhanced event search with multiple criteria
  async searchEvents(
    city: string, 
    state: string, 
    query?: string, 
    category?: string, 
    priceRange?: string,
    dateRange?: string
  ): Promise<ExternalEvent[]> {
    let events = await this.aggregateEvents(city, state, category, priceRange);
    
    // Apply text search if query provided
    if (query && query.trim()) {
      const searchTerm = query.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply date range filter
    if (dateRange) {
      const now = new Date();
      events = events.filter(event => {
        switch (dateRange) {
          case 'today':
            return event.eventDate.toDateString() === now.toDateString();
          case 'this-week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return event.eventDate >= now && event.eventDate <= weekFromNow;
          case 'this-month':
            const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return event.eventDate >= now && event.eventDate <= monthFromNow;
          default:
            return true;
        }
      });
    }
    
    return events;
  }
}