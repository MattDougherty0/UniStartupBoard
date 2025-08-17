const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, getDocs } = require('firebase/firestore');

// Production Firebase config - you'll need to add your actual config here
const firebaseConfig = {
  // Add your production Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project-id",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "your-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// New schools data
const newSchools = [
  {
    id: 26,
    name: "San Jose State University",
    emailDomain: "sjsu.edu",
    lat: 37.3352,
    lng: -121.8811,
    city: "San Francisco"
  },
  {
    id: 27,
    name: "Santa Clara University",
    emailDomain: "scu.edu",
    lat: 37.3496,
    lng: -121.9390,
    city: "San Francisco"
  }
];

// New users data
const newUsers = [
  {
    id: 42,
    email: "jessicawong@sjsu.edu",
    university: "San Jose State University",
    lat: 37.3352,
    lng: -121.8811,
    profile: {
      firstName: "Jessica",
      lastName: "Wong",
      bio: "Computer Engineering major working on smart home automation and energy efficiency solutions.",
      picture: "https://images.unsplash.com/photo-1534361967620-2249b4a87a49",
      graduationYear: "2025",
      hasIdea: "yes",
      isWorkingOnIdea: "yes",
      social: {}
    }
  },
  {
    id: 43,
    email: "carlosrodriguez@sjsu.edu",
    university: "San Jose State University",
    lat: 37.3352,
    lng: -121.8811,
    profile: {
      firstName: "Carlos",
      lastName: "Rodriguez",
      bio: "Business major developing fintech solutions for small businesses and startups.",
      picture: "https://images.unsplash.com/photo-1519338381761-c7523edc1f46",
      graduationYear: "2026",
      hasIdea: "yes",
      isWorkingOnIdea: "yes",
      social: {}
    }
  },
  {
    id: 44,
    email: "sophiagarcia@scu.edu",
    university: "Santa Clara University",
    lat: 37.3496,
    lng: -121.9390,
    profile: {
      firstName: "Sophia",
      lastName: "Garcia",
      bio: "Environmental Science major working on sustainable agriculture and food waste reduction.",
      picture: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
      graduationYear: "2025",
      hasIdea: "yes",
      isWorkingOnIdea: "yes",
      social: {}
    }
  },
  {
    id: 45,
    email: "kevinchen@scu.edu",
    university: "Santa Clara University",
    lat: 37.3496,
    lng: -121.9390,
    profile: {
      firstName: "Kevin",
      lastName: "Chen",
      bio: "Computer Science major developing AI-powered educational tools for underserved communities.",
      picture: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7",
      graduationYear: "2026",
      hasIdea: "yes",
      isWorkingOnIdea: "yes",
      social: {}
    }
  }
];

// New posts data
const newPosts = [
  {
    id: 38,
    userId: 42,
    university: "San Jose State University",
    title: "Silicon Valley Smart Home",
    summary: "AI-powered smart home automation system that learns user preferences and optimizes energy usage. Integrates with existing smart devices and provides real-time energy consumption analytics.",
    lookingFor: "IoT developers, machine learning engineers, and UX designers. Experience with smart home protocols and energy management systems preferred.",
    category: "Tech",
    projectLink: "",
    stage: "development",
    createdAt: "2025-08-16",
    comments: []
  },
  {
    id: 39,
    userId: 43,
    university: "San Jose State University",
    title: "FinTech for Small Business",
    summary: "Digital banking platform designed specifically for small businesses and startups. Features include automated bookkeeping, expense tracking, and financial forecasting tools.",
    lookingFor: "Full-stack developers, financial analysts, and compliance experts. Knowledge of banking regulations and fintech security required.",
    category: "Finance",
    projectLink: "",
    stage: "planning",
    createdAt: "2025-08-16",
    comments: []
  },
  {
    id: 40,
    userId: 44,
    university: "Santa Clara University",
    title: "Sustainable Agriculture Network",
    summary: "Platform connecting local farmers with consumers and restaurants to reduce food waste and promote sustainable farming practices. Includes real-time inventory management and delivery optimization.",
    lookingFor: "Agricultural experts, supply chain specialists, and mobile app developers. Experience with sustainable farming and logistics preferred.",
    category: "Sustainability",
    projectLink: "",
    stage: "idea",
    createdAt: "2025-08-16",
    comments: []
  },
  {
    id: 41,
    userId: 45,
    university: "Santa Clara University",
    title: "AI Education Platform",
    summary: "Personalized learning platform that uses artificial intelligence to adapt to individual student needs. Provides targeted tutoring, progress tracking, and adaptive assessments for underserved communities.",
    lookingFor: "AI engineers, educational psychologists, and frontend developers. Experience with machine learning and educational technology required.",
    category: "Education",
    projectLink: "",
    stage: "planning",
    createdAt: "2025-08-16",
    comments: []
  }
];

// Function to seed universities
async function seedUniversities() {
  try {
    console.log('Seeding universities...');
    for (const school of newSchools) {
      await setDoc(doc(db, 'app', 'universities'), { 
        data: [school], 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      console.log(`✅ Added ${school.name}`);
    }
  } catch (error) {
    console.error('Error seeding universities:', error);
  }
}

// Function to seed users
async function seedUsers() {
  try {
    console.log('Seeding users...');
    for (const user of newUsers) {
      await setDoc(doc(db, 'app', 'users'), { 
        data: [user], 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      console.log(`✅ Added user ${user.profile.firstName} ${user.profile.lastName}`);
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Function to seed posts
async function seedPosts() {
  try {
    console.log('Seeding posts...');
    for (const post of newPosts) {
      await setDoc(doc(db, 'app', 'posts'), { 
        data: [post], 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      console.log(`✅ Added post: ${post.title}`);
    }
  } catch (error) {
    console.error('Error seeding posts:', error);
  }
}

// Main seeding function
async function seedProductionData() {
  console.log('🚀 Starting production data seeding...');
  
  await seedUniversities();
  await seedUsers();
  await seedPosts();
  
  console.log('✅ Production data seeding completed!');
  process.exit(0);
}

// Run the seeding
seedProductionData().catch(console.error);
