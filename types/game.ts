// Core Game Types
export interface Artist {
  id: string;
  name: string;
  stageName: string;
  genre: string;
  level: number;
  experience: number;
  energy: number;
  maxEnergy: number;
  prestige: number;
  money: number;
  reputation: number;
  createdAt: number;
}

export interface Team {
  manager: TeamMember | null;
  engineer: TeamMember | null;
  publicist: TeamMember | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'manager' | 'engineer' | 'publicist';
  skill: number;
  salary: number;
  hiredDate: number;
}

export interface Studio {
  quality: number;
  equipment: Equipment[];
  upgrades: StudioUpgrade[];
}

export interface Equipment {
  id: string;
  name: string;
  type: 'microphone' | 'mixer' | 'monitors' | 'instruments';
  quality: number;
  cost: number;
}

export interface StudioUpgrade {
  id: string;
  name: string;
  level: number;
  cost: number;
  benefit: string;
}

export interface Song {
  id: string;
  title: string;
  type: 'single' | 'ep' | 'album';
  genre: string;
  quality: number;
  streams: number;
  earnings: number;
  releaseDate: number;
  chartPosition: number;
  lyrics?: string;
  coverArt?: string;
}

export interface Fanbase {
  total: number;
  hardcore: number;
  casual: number;
  haters: number;
  demographics: Demographics;
  engagement: number;
}

export interface Demographics {
  regions: {
    [key: string]: number;
  };
  ageGroups: {
    '13-17': number;
    '18-24': number;
    '25-34': number;
    '35-44': number;
    '45+': number;
  };
}

export interface SocialMedia {
  starGram: {
    followers: number;
    posts: Post[];
  };
  twittArt: {
    followers: number;
    tweets: Tweet[];
  };
}

export interface Post {
  id: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: number;
  isViral: boolean;
}

export interface Tweet {
  id: string;
  content: string;
  retweets: number;
  likes: number;
  timestamp: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface Relationship {
  id: string;
  name: string;
  type: 'collaboration' | 'rivalry' | 'romance';
  affinity: number;
  interactions: number;
}

export interface LuxuryItem {
  id: string;
  name: string;
  category: 'car' | 'jet' | 'villa' | 'penthouse';
  prestige: number;
  cost: number;
  owned: boolean;
  image?: string;
}

export interface Merchandise {
  id: string;
  name: string;
  type: 'clothing' | 'vinyl' | 'cd' | 'poster';
  price: number;
  unitsSold: number;
  revenue: number;
}

export interface Tour {
  id: string;
  name: string;
  venues: Venue[];
  currentVenue: number;
  totalRevenue: number;
  status: 'planning' | 'active' | 'completed';
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  type: 'club' | 'theater' | 'arena' | 'stadium';
  baseRevenue: number;
  played: boolean;
}

export interface MediaEvent {
  id: string;
  type: 'radio' | 'tv' | 'press';
  name: string;
  impact: number;
  timestamp: number;
  description: string;
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  won: boolean;
}

export interface GameState {
  artist: Artist;
  team: Team;
  studio: Studio;
  songs: Song[];
  fanbase: Fanbase;
  socialMedia: SocialMedia;
  relationships: Relationship[];
  luxuryItems: LuxuryItem[];
  merchandise: Merchandise[];
  tours: Tour[];
  mediaEvents: MediaEvent[];
  awards: Award[];
  lastSaved: number;
}
