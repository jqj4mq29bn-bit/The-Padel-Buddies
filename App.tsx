import React, { useState, useEffect, useCallback } from 'react';
import { Meeting, PlayerStatus, PlayerPool, User, Notification, Availability } from './types';
import CreateMeetingModal from './components/CreateMeetingModal';
import { PlusIcon } from './components/IconComponents';
import CreatePoolModal from './components/CreatePoolModal';
import AuthScreen from './screens/AuthScreen';
import NotificationBell from './components/NotificationBell';
import BottomNav from './components/BottomNav';
import BuddiesScreen from './screens/BuddiesScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import GameDetailsModal from './components/GameDetailsModal';
import AddBuddyModal from './components/AddBuddyModal';

// --- DATA INITIALIZATION ---
// This function initializes the app with some fake data if it's the first time running.
const initializeData = () => {
  const initialUsers: User[] = [
    { name: 'Alex', password: 'password', buddies: ['Ben', 'Carla'], availability: [{id: '1', day: 'Wednesday', startTime: '18:00', endTime: '22:00'}]},
    { name: 'Ben', password: 'password', buddies: ['Alex', 'Diana'], availability: [{id: '2', day: 'Wednesday', startTime: '19:00', endTime: '21:00'}]},
    { name: 'Carla', password: 'password', buddies: ['Alex', 'Diana', 'Eric'], availability: [{id: '3', day: 'Tuesday', startTime: '18:00', endTime: '20:00'}]},
    { name: 'Diana', password: 'password', buddies: ['Ben', 'Carla'], availability: [{id: '4', day: 'Thursday', startTime: '20:00', endTime: '22:00'}]},
    { name: 'Eric', password: 'password', buddies: ['Carla'], availability: []},
  ];

  // Helper to get today + X days in YYYY-MM-DD format
  const getDate = (offset: number) => {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return date.toISOString().split('T')[0];
  };

  const initialMeetings: Meeting[] = [
    // Game 1: Joined, Full, Court Booked, Game On!
    { id: 'm1', date: getDate(1), time: '19:00', location: 'TC De Mol', creator: 'Alex', courtReservedBy: 'Ben', entryCode: '1234#',
      players: [
        { name: 'Alex', status: PlayerStatus.Confirmed },
        { name: 'Ben', status: PlayerStatus.Confirmed },
        { name: 'Carla', status: PlayerStatus.Confirmed },
        { name: 'Diana', status: PlayerStatus.Confirmed },
      ],
      invitedPlayers: [],
      all_involved_users: ['Alex', 'Ben', 'Carla', 'Diana'],
    },
    // Game 2: Joined, Not Full, waiting for buddies
    { id: 'm2', date: getDate(2), time: '20:00', location: 'TC Iris', creator: 'Alex',
      players: [
        { name: 'Alex', status: PlayerStatus.Confirmed },
        { name: 'Carla', status: PlayerStatus.Confirmed },
      ],
      invitedPlayers: ['Ben'],
      all_involved_users: ['Alex', 'Carla', 'Ben'],
    },
    // Game 3: New Game, waiting for players
    { id: 'm3', date: getDate(2), time: '20:00', location: 'TC Iris', creator: 'Diana',
      players: [
        { name: 'Diana', status: PlayerStatus.Confirmed },
      ],
      invitedPlayers: ['Alex', 'Ben'],
      all_involved_users: ['Diana', 'Alex', 'Ben'],
    },
     // Game 4: Game Full, needs court booking
    { id: 'm4', date: getDate(4), time: '20:30', location: 'TC Iris', creator: 'Ben',
      players: [
        { name: 'Ben', status: PlayerStatus.Confirmed },
        { name: 'Alex', status: PlayerStatus.Confirmed },
        { name: 'Carla', status: PlayerStatus.Confirmed },
        { name: 'Diana', status: PlayerStatus.Confirmed },
      ],
      invitedPlayers: [],
      all_involved_users: ['Ben', 'Alex', 'Carla', 'Diana'],
    },
     // Game 5: Urgent Vacancy
    { id: 'm5', date: getDate(5), time: '18:30', location: 'TC De Mol', creator: 'Eric', courtReservedBy: 'Eric',
      players: [
        { name: 'Eric', status: PlayerStatus.Confirmed },
        { name: 'Carla', status: PlayerStatus.Confirmed },
        { name: 'Diana', status: PlayerStatus.Confirmed },
      ],
      invitedPlayers: ['Alex', 'Ben'],
      all_involved_users: ['Eric', 'Carla', 'Diana', 'Alex', 'Ben'],
    },
  ];

  const initialPlayerPools: PlayerPool[] = [
    { id: 'p1', name: 'Weekend Warriors', members: ['Alex', 'Ben', 'Carla'] },
    { id: 'p2', name: 'Local Legends', members: ['Diana', 'Eric'] },
  ];

  return { initialUsers, initialMeetings, initialPlayerPools };
};

// --- Custom Hooks for localStorage Persistence ---
const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
};


const App: React.FC = () => {
  const { initialUsers, initialMeetings, initialPlayerPools } = initializeData();
  
  // App State - All data is persisted in localStorage
  const [users, setUsers] = useLocalStorage<User[]>('padel_users', initialUsers);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('padel_currentUser', null);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('padel_meetings', initialMeetings);
  const [playerPools, setPlayerPools] = useLocalStorage<PlayerPool[]>('padel_playerPools', initialPlayerPools);
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('padel_notifications', []);
  
  // App view state
  const [view, setView] = useState<'home' | 'buddies' | 'profile'>('home');
  
  // Modal states
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isPoolModalOpen, setIsPoolModalOpen] = useState(false);
  const [isAddBuddyModalOpen, setIsAddBuddyModalOpen] = useState(false);
  const [activePoolForMeeting, setActivePoolForMeeting] = useState<PlayerPool | null>(null);
  const [gameToEdit, setGameToEdit] = useState<Meeting | null>(null);
  const [detailsModalMeeting, setDetailsModalMeeting] = useState<Meeting | null>(null);
  
  // Interaction state
  const [highlightedMeetingId, setHighlightedMeetingId] = useState<string | null>(null);

  // Function to add a new notification
  const createAndAddNotification = useCallback((recipient: string, message: string) => {
    const newNotification: Notification = {
        id: `notif-${Date.now()}-${Math.random()}`,
        recipient,
        message,
        read: false,
        timestamp: Date.now(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [setNotifications]);

  // Handle buddy invites from URL on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviterName = urlParams.get('invite_from');
    if (inviterName && currentUser && !currentUser.buddies.includes(inviterName)) {
      const inviterExists = users.some(u => u.name === inviterName);
      if (inviterExists) {
        // Add buddy to current user
        const updatedUser = { ...currentUser, buddies: [...currentUser.buddies, inviterName] };
        setCurrentUser(updatedUser);
        setUsers(prevUsers => prevUsers.map(u => u.name === currentUser.name ? updatedUser : u));

        // Add current user to inviter's buddy list
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.name === inviterName) {
            return { ...u, buddies: [...u.buddies, currentUser.name] };
          }
          return u;
        }));

        createAndAddNotification(currentUser.name, `You are now buddies with ${inviterName}!`);
        createAndAddNotification(inviterName, `${currentUser.name} accepted your buddy invite!`);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [currentUser, users, setCurrentUser, setUsers, createAndAddNotification]);
  
  // --- AUTHENTICATION ---
  const handleLogin = (name: string, pass: string): { success: boolean, message: string } => {
    const existingUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());
    
    if (existingUser && existingUser.password === pass) {
        setCurrentUser(existingUser);
        createAndAddNotification(existingUser.name, `Welcome back!`);
        return { success: true, message: "Logged in successfully." };
    } else {
        return { success: false, message: "Incorrect username or password." };
    }
  };

  const handleSignUp = (name: string, pass: string): { success: boolean, message: string } => {
    const isTaken = users.some(u => u.name.toLowerCase() === name.toLowerCase());
    if (isTaken) {
      return { success: false, message: "Username is already taken." };
    }
    const newUser: User = { name, password: pass, buddies: [], availability: [] };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    createAndAddNotification(newUser.name, "Welcome to Padel Buddies!");
    return { success: true, message: "Account created successfully." };
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
  };

  // --- CORE APP LOGIC ---
  const handleUpdatePlayerStatus = (meetingId: string, playerName: string, newStatus: PlayerStatus) => {
    setMeetings(prevMeetings => {
      const newMeetings = prevMeetings.map(m => {
        if (m.id === meetingId) {
          let player = m.players.find(p => p.name === playerName);
          let newPlayers = [...m.players];
          let newInvited = [...m.invitedPlayers];

          if (player) {
            // Player has responded before, just update status
            newPlayers = newPlayers.map(p => p.name === playerName ? { ...p, status: newStatus } : p);
          } else {
            // First time responding, move from invited to players list
            newInvited = newInvited.filter(name => name !== playerName);
            newPlayers.push({ name: playerName, status: newStatus });
          }
          
          const updatedMeeting = { ...m, players: newPlayers, invitedPlayers: newInvited };

          // Notifications
          if (newStatus === PlayerStatus.Confirmed) {
            createAndAddNotification(m.creator, `${playerName} has joined your game on ${m.date}!`);
          } else if (newStatus === PlayerStatus.Declined) {
             createAndAddNotification(m.creator, `${playerName} has declined your game on ${m.date}.`);
          }
          
          return updatedMeeting;
        }
        return m;
      });

      // After status update, check if the game should be deleted
      const targetMeeting = newMeetings.find(m => m.id === meetingId);
      if (targetMeeting) {
          const confirmedPlayers = targetMeeting.players.filter(p => p.status === PlayerStatus.Confirmed).length;
          // Delete if last confirmed player leaves and no one else is invited
          if (confirmedPlayers === 0 && targetMeeting.invitedPlayers.length === 0) {
              // Notify remaining declined players that the game was cancelled
              targetMeeting.players.forEach(p => {
                  if (p.status === PlayerStatus.Declined) {
                      createAndAddNotification(p.name, `The game at ${targetMeeting.location} on ${targetMeeting.date} was cancelled because all players left.`);
                  }
              });
              return newMeetings.filter(m => m.id !== meetingId);
          }
      }

      return newMeetings;
    });
  };

  const handleSetCourtReserved = (meetingId: string, userName: string | null, entryCode?: string) => {
    setMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        if (userName) {
          createAndAddNotification(m.creator, `The court for your game on ${m.date} has been booked by ${userName}!`);
        }
        return { ...m, courtReservedBy: userName || undefined, entryCode: entryCode || undefined };
      }
      return m;
    }));
  };
  
  const handleAddMeeting = (newMeetingData: Omit<Meeting, 'id' | 'all_involved_users'>) => {
    const allInvolved = [...new Set([newMeetingData.creator, ...newMeetingData.invitedPlayers])];
    const newMeeting: Meeting = {
        ...newMeetingData,
        id: `m-${Date.now()}`,
        all_involved_users: allInvolved
    };
    
    setMeetings(prev => [newMeeting, ...prev]);
    // Notify invited players
    newMeeting.invitedPlayers.forEach(playerName => {
        createAndAddNotification(playerName, `${newMeeting.creator} invited you to a game on ${newMeeting.date} at ${newMeeting.location}.`);
    });
  };

  const handleUpdateMeeting = (updatedMeeting: Meeting) => {
    const allInvolved = [...new Set([updatedMeeting.creator, ...updatedMeeting.invitedPlayers, ...updatedMeeting.players.map(p => p.name)])];
    const meetingWithInvolved = { ...updatedMeeting, all_involved_users: allInvolved };
    
    setMeetings(prev => prev.map(m => m.id === meetingWithInvolved.id ? meetingWithInvolved : m));
  };
  
  const handleInviteBuddies = (meetingId: string, buddiesToInvite: string[]) => {
    setMeetings(prev => prev.map(m => {
        if (m.id === meetingId) {
            const newInvited = [...new Set([...m.invitedPlayers, ...buddiesToInvite])];
            buddiesToInvite.forEach(buddy => {
                createAndAddNotification(buddy, `${currentUser!.name} invited you to the game at ${m.location} on ${m.date}.`);
            });
            return { ...m, invitedPlayers: newInvited, all_involved_users: [...new Set([...m.all_involved_users, ...buddiesToInvite])] };
        }
        return m;
    }));
  };

  const handleAddPool = (name: string, members: string[]) => {
    const newPool: PlayerPool = {
      id: `p-${Date.now()}`,
      name,
      members: [...new Set([currentUser!.name, ...members])]
    };
    setPlayerPools(prev => [newPool, ...prev]);
  };
  
  const handleAddPlayerToPool = (poolId: string, playerName: string) => {
    setPlayerPools(prev => prev.map(p => {
        if (p.id === poolId) {
            const newMembers = [...new Set([...p.members, playerName])];
            createAndAddNotification(playerName, `${currentUser!.name} added you to the "${p.name}" player pool!`);
            return { ...p, members: newMembers };
        }
        return p;
    }));
  };

  const handleProposePoolGame = (pool: PlayerPool) => {
    setActivePoolForMeeting(pool);
    setIsMeetingModalOpen(true);
  };

  const handleUpdateAvailability = (newAvailability: Availability[]) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, availability: newAvailability };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.name === currentUser.name ? updatedUser : u));
    }
  };

  const handleMarkAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const handleMarkAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const handleEditGame = (meeting: Meeting) => {
    setGameToEdit(meeting);
    setIsMeetingModalOpen(true);
  };
  
  const handleShowDetails = (meeting: Meeting) => {
    setDetailsModalMeeting(meeting);
  };

  const closeMeetingModal = () => {
      setIsMeetingModalOpen(false);
      setActivePoolForMeeting(null);
      setGameToEdit(null);
  }
  
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onSignUp={handleSignUp} />;
  }
  
  const myPools = playerPools.filter(pool => pool.members.includes(currentUser.name));
  const myNotifications = notifications.filter(n => n.recipient === currentUser.name);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 font-sans">
      <div className="container mx-auto p-4 md:p-8 pb-24 relative">
        <div className="absolute top-4 right-4 md:top-8 md-right-8 z-10">
            <NotificationBell 
                notifications={myNotifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
            />
        </div>

        {view === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            meetings={meetings.filter(m => m.all_involved_users.includes(currentUser.name))}
            myPools={myPools}
            onUpdatePlayerStatus={handleUpdatePlayerStatus}
            onSetCourtReserved={handleSetCourtReserved}
            onProposeGame={() => setIsMeetingModalOpen(true)}
            onAddBuddy={() => setIsAddBuddyModalOpen(true)}
            onEditGame={handleEditGame}
            onShowDetails={handleShowDetails}
            onInviteBuddies={handleInviteBuddies}
            highlightedMeetingId={highlightedMeetingId}
          />
        )}

        {view === 'buddies' && (
          <BuddiesScreen 
            currentUser={currentUser}
            myPools={myPools}
            onAddPlayerToPool={handleAddPlayerToPool}
            onProposePoolGame={handleProposePoolGame}
            onSetIsPoolModalOpen={setIsPoolModalOpen}
          />
        )}

        {view === 'profile' && (
          <ProfileScreen 
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateAvailability={handleUpdateAvailability}
          />
        )}

      </div>
      
      <CreateMeetingModal 
        isOpen={isMeetingModalOpen} 
        onClose={closeMeetingModal} 
        onAddMeeting={handleAddMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        currentUser={currentUser}
        poolForMeeting={activePoolForMeeting}
        gameToEdit={gameToEdit}
        myPools={myPools}
        allUsers={users}
        allMeetings={meetings}
      />

      <CreatePoolModal
          isOpen={isPoolModalOpen}
          onClose={() => setIsPoolModalOpen(false)}
          onAddPool={handleAddPool}
          currentUser={currentUser}
      />
      
      <GameDetailsModal
        isOpen={!!detailsModalMeeting}
        onClose={() => setDetailsModalMeeting(null)}
        meeting={detailsModalMeeting}
        onEdit={() => {
          if (detailsModalMeeting) {
            handleEditGame(detailsModalMeeting);
            setDetailsModalMeeting(null);
          }
        }}
      />
      
      <AddBuddyModal
        isOpen={isAddBuddyModalOpen}
        onClose={() => setIsAddBuddyModalOpen(false)}
        currentUser={currentUser}
      />

      <BottomNav activeView={view} setActiveView={setView} />
    </div>
  );
};

export default App;