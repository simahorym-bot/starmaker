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
  creativeDirector: TeamMember | null;
  digitalStrategist: TeamMember | null;
  pressAttache: TeamMember | null;
  tourManager: TeamMember | null;
  bodyguards: TeamMember | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'manager' | 'engineer' | 'publicist' | 'creative-director' | 'digital-strategist' | 'press-attache' | 'tour-manager' | 'bodyguards';
  skill: number;
  salary: number;
  hiredDate: number;
  boost?: {
    type: 'visuals' | 'virality' | 'press' | 'tour-efficiency' | 'security';
    value: number;
  };
}

export interface Studio {
  quality: number;
  equipment: Equipment[];
  upgrades: StudioUpgrade[];
  rooms: StudioRoom[];
  soundFidelity: number;
}

export interface StudioRoom {
  id: string;
  name: string;
  type: 'vocal-booth' | 'live-room' | 'writing-room';
  level: number;
  boost: number;
  owned: boolean;
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
  releaseStrategy?: 'lead-single' | 'album' | 'deluxe';
  physicalSales?: PhysicalSales;
  musicVideo?: MusicVideo;
}

export interface PhysicalSales {
  vinyl: number;
  cd: number;
  vinylRevenue: number;
  cdRevenue: number;
}

export interface MusicVideo {
  id: string;
  director: string;
  budget: number;
  views: number;
  quality: number;
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
  type: 'collaboration' | 'rivalry' | 'romance' | 'entourage';
  affinity: number;
  interactions: number;
  aiGenerated?: boolean;
  impactOnCareer?: 'positive' | 'negative' | 'neutral';
}

export interface LuxuryItem {
  id: string;
  name: string;
  category: 'car' | 'jet' | 'yacht' | 'villa' | 'penthouse' | 'mansion';
  prestige: number;
  cost: number;
  owned: boolean;
  image?: string;
  canHostParty?: boolean;
}

export interface BusinessInvestment {
  id: string;
  name: string;
  type: 'stocks' | 'real-estate' | 'crypto' | 'business';
  invested: number;
  currentValue: number;
  returns: number;
}

export interface BrandDeal {
  id: string;
  brand: string;
  type: 'watches' | 'cosmetics' | 'fashion' | 'tech';
  value: number;
  duration: number;
  prestige: number;
  active: boolean;
}

export interface Merchandise {
  id: string;
  name: string;
  type: 'clothing' | 'vinyl' | 'cd' | 'poster';
  price: number;
  unitsSold: number;
  revenue: number;
  design?: string;
}

export interface FashionLine {
  id: string;
  name: string;
  pieces: FashionPiece[];
  launched: boolean;
  revenue: number;
}

export interface FashionPiece {
  id: string;
  name: string;
  type: 'tshirt' | 'hoodie' | 'jacket' | 'pants' | 'shoes' | 'accessories';
  price: number;
  design: string;
}

export interface PopupStore {
  id: string;
  city: 'Paris' | 'Tokyo' | 'NYC' | 'London' | 'Milan';
  opened: boolean;
  revenue: number;
  duration: number;
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
  type: 'radio' | 'tv' | 'press' | 'late-show' | 'press-conference';
  name: string;
  impact: number;
  timestamp: number;
  description: string;
  aiGenerated?: boolean;
}

export interface PressConference {
  id: string;
  questions: PressQuestion[];
  answers: string[];
  impact: number;
  timestamp: number;
}

export interface PressQuestion {
  id: string;
  journalist: string;
  question: string;
  category: 'career' | 'personal' | 'controversy' | 'future';
}

export interface Award {
  id: string;
  name: string;
  category: string;
  year: number;
  won: boolean;
}

export interface Contract {
  id: string;
  type: 'distribution' | 'licensing' | 'publishing' | 'sync';
  partner: string;
  royaltyRate: number;
  value: number;
  duration: number;
  signed: boolean;
  earnings: number;
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
  contracts: Contract[];
  businessInvestments: BusinessInvestment[];
  brandDeals: BrandDeal[];
  fashionLines: FashionLine[];
  popupStores: PopupStore[];
  pressConferences: PressConference[];
  retirementProgress: number;
  lastSaved: number;
}
