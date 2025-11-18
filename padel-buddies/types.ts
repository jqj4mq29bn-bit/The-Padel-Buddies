export enum PlayerStatus {
  Pending = 'PENDING',
  Confirmed = 'CONFIRMED',
  Declined = 'DECLINED',
}

export interface Player {
  name: string;
  status: PlayerStatus;
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  location: string;
  players: Player[]; // Players who have responded (Confirmed or Declined)
  invitedPlayers: string[]; // Players who are invited but have not responded
  creator: string;
  poolId?: string;
  courtReservedBy?: string; // Changed from isCourtReserved
  entryCode?: string; // To store the court entry code for TC De Mol
  all_involved_users: string[]; // For efficient querying
}

export interface PlayerPool {
  id: string;
  name: string;
  members: string[];
}

export interface Availability {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface User {
  name: string;
  password?: string; // Password is optional for initial setup/data structure, but required for new accounts
  buddies: string[]; // Names of other users
  availability?: Availability[];
}

export interface Notification {
  id: string;
  recipient: string; // The user who should see this
  message: string;
  read: boolean;
  timestamp: number;
}