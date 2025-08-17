const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const User = require('../models/User');

// Load env vars
dotenv.config();

// Sample events data
const sampleEvents = [
  {
    title: "Tech Conference 2024",
    description: "Join industry leaders and tech enthusiasts for a full day of inspiring talks, networking, and hands-on workshops. Discover the latest trends in AI, web development, and digital transformation.",
    category: "Technology",
    startDate: new Date('2025-12-15T09:00:00Z'),
    endDate: new Date('2025-12-15T18:00:00Z'),
    startTime: "09:00",
    endTime: "18:00",
    venue: {
      name: "Convention Center Downtown",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "Early Bird",
        price: 75,
        quantity: 100,
        description: "Limited early bird tickets with special perks"
      },
      {
        name: "Regular",
        price: 100,
        quantity: 200,
        description: "Standard conference access"
      },
      {
        name: "VIP",
        price: 200,
        quantity: 50,
        description: "VIP access with exclusive networking session"
      }
    ],
    status: "published"
  },
  {
    title: "Summer Music Festival",
    description: "Experience an unforgettable weekend of live music featuring top artists from around the world. Food trucks, artisan vendors, and family-friendly activities included.",
    category: "Music",
    startDate: new Date('2025-09-20'),
    endDate: new Date('2025-09-22'),
    startTime: "12:00",
    endTime: "23:00",
    venue: {
      name: "Central Park Bandshell",
      address: "Central Park West & 72nd St",
      city: "New York",
      state: "NY",
      zipCode: "10023",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "General Admission",
        price: 45,
        quantity: 1000,
        description: "General festival access for one day"
      },
      {
        name: "Weekend Pass",
        price: 120,
        quantity: 500,
        description: "Full weekend access to all performances"
      },
      {
        name: "VIP Weekend",
        price: 250,
        quantity: 100,
        description: "VIP area access with premium amenities"
      }
    ],
    status: "published"
  },
  {
    title: "Business Innovation Summit",
    description: "Connect with entrepreneurs, investors, and business leaders to explore the future of business innovation. Featuring keynote speakers, panel discussions, and networking opportunities.",
    category: "Business",
    startDate: new Date('2025-10-10T08:30:00Z'),
    endDate: new Date('2025-10-10T17:30:00Z'),
    startTime: "08:30",
    endTime: "17:30",
    venue: {
      name: "Grand Hotel Conference Center",
      address: "456 Business Blvd",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "Professional",
        price: 150,
        quantity: 200,
        description: "Full day access with lunch included"
      },
      {
        name: "Executive",
        price: 300,
        quantity: 75,
        description: "Premium seating and exclusive networking dinner"
      }
    ],
    status: "published"
  },
  {
    title: "Art Gallery Opening",
    description: "Celebrate the opening of our new contemporary art exhibition featuring works by emerging local artists. Complimentary wine and hors d'oeuvres will be served.",
    category: "Arts",
    startDate: new Date('2025-09-05T18:00:00Z'),
    endDate: new Date('2025-09-05T22:00:00Z'),
    startTime: "18:00",
    endTime: "22:00",
    venue: {
      name: "Modern Art Gallery",
      address: "789 Art District Ave",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90028",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "General Admission",
        price: 25,
        quantity: 150,
        description: "Gallery access with complimentary refreshments"
      }
    ],
    status: "published"
  },
  {
    title: "Food & Wine Festival",
    description: "Indulge in a culinary journey featuring the city's best restaurants, wineries, and craft breweries. Live cooking demonstrations and tasting sessions throughout the day.",
    category: "Food",
    startDate: new Date('2025-11-12'),
    endDate: new Date('2025-11-13'),
    startTime: "11:00",
    endTime: "20:00",
    venue: {
      name: "Waterfront Park",
      address: "100 Harbor Drive",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "Tasting Pass",
        price: 65,
        quantity: 300,
        description: "Includes 10 tasting tickets and souvenir glass"
      },
      {
        name: "Premium Pass",
        price: 120,
        quantity: 150,
        description: "Unlimited tastings plus VIP lounge access"
      }
    ],
    status: "published"
  },
  {
    title: "Marathon Championship",
    description: "Join thousands of runners in our annual marathon championship. Routes for all skill levels including 5K, 10K, half marathon, and full marathon options.",
    category: "Sports",
    startDate: new Date('2025-11-03T07:00:00Z'),
    endDate: new Date('2025-11-03T15:00:00Z'),
    startTime: "07:00",
    endTime: "15:00",
    venue: {
      name: "City Sports Complex",
      address: "200 Athletic Way",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA"
    },
    ticketTypes: [
      {
        name: "5K Registration",
        price: 35,
        quantity: 500,
        description: "5K run registration with participant kit"
      },
      {
        name: "10K Registration",
        price: 45,
        quantity: 400,
        description: "10K run registration with participant kit"
      },
      {
        name: "Half Marathon",
        price: 65,
        quantity: 300,
        description: "Half marathon registration with premium kit"
      },
      {
        name: "Full Marathon",
        price: 85,
        quantity: 200,
        description: "Full marathon registration with finisher medal"
      }
    ],
    status: "published"
  }
];

const seedEvents = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB...');

    // Find or create a default organizer user
    let organizer = await User.findOne({ role: 'organizer' });
    
    if (!organizer) {
      // Create a default organizer if none exists
      organizer = await User.create({
        name: 'Event Organizer',
        email: 'organizer@example.com',
        password: 'password123', // This will be hashed automatically by the User model
        role: 'organizer',
        phone: '555-0123',
        isEmailVerified: true
      });
      console.log('Created default organizer user');
    }

    // Clear existing events (optional)
    await Event.deleteMany({});
    console.log('Cleared existing events...');

    // Add organizer ID to each event
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: organizer._id
    }));

    // Create sample events
    const createdEvents = await Event.create(eventsWithOrganizer);
    console.log(`Created ${createdEvents.length} sample events`);

    console.log('Sample events created successfully!');
    console.log('Events:');
    createdEvents.forEach(event => {
      console.log(`- ${event.title} (${event.category})`);
    });

  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seeding function
seedEvents();
