import React, { useState } from 'react';
import { User, Availability } from '../types';
import { PlusIcon, XIcon } from '../components/IconComponents';

interface ProfileScreenProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateAvailability: (newAvailability: Availability[]) => void;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ProfileScreen: React.FC<ProfileScreenProps> = ({ currentUser, onLogout, onUpdateAvailability }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [day, setDay] = useState('Monday');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleAddAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime || startTime >= endTime) {
      // Basic validation
      return;
    }

    const newAvailabilityEntry: Availability = {
      id: `avail-${Date.now()}`,
      day,
      startTime,
      endTime,
    };

    const updatedAvailabilities = [...(currentUser.availability || []), newAvailabilityEntry];
    onUpdateAvailability(updatedAvailabilities);

    // Reset form
    setIsAdding(false);
    setDay('Monday');
    setStartTime('');
    setEndTime('');
  };

  const handleRemoveAvailability = (idToRemove: string) => {
    const updatedAvailabilities = (currentUser.availability || []).filter(a => a.id !== idToRemove);
    onUpdateAvailability(updatedAvailabilities);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Profile</h1>
      
      <div className="bg-padel-blue/10 backdrop-blur-md border border-padel-blue/20 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Logged in as</p>
            <p className="text-white font-bold text-2xl">{currentUser.name}</p>
          </div>
          <button
            onClick={onLogout}
            className="border border-red-500/80 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold py-2 px-4 rounded-md transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="bg-padel-blue/10 backdrop-blur-md border border-padel-blue/20 rounded-2xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-white mb-4">My Availabilities</h2>
        <div className="space-y-3">
          {(currentUser.availability || []).length > 0 ? (
            currentUser.availability!.map(avail => (
              <div key={avail.id} className="flex items-center justify-between bg-padel-blue/5 p-3 rounded-lg">
                <div>
                  <p className="font-semibold text-white">{avail.day}</p>
                  <p className="text-sm text-slate-300">{avail.startTime} - {avail.endTime}</p>
                </div>
                <button onClick={() => handleRemoveAvailability(avail.id)} className="text-slate-400 hover:text-red-400">
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic py-4">You have not added any availabilities yet.</p>
          )}
        </div>

        {isAdding ? (
          <form onSubmit={handleAddAvailability} className="mt-6 p-4 bg-padel-blue/5 rounded-lg space-y-4">
            <h3 className="font-semibold text-white">Add new time slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-slate-300 mb-1">Day</label>
                <select id="day" value={day} onChange={e => setDay(e.target.value)} className="w-full bg-padel-blue/10 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue">
                  {WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-slate-300 mb-1">From</label>
                <input type="time" id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-padel-blue/10 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" required />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-slate-300 mb-1">To</label>
                <input type="time" id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-padel-blue/10 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" required />
              </div>
            </div>
             <div className="flex gap-4 pt-2">
                <button type="submit" className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-2 px-4 rounded-md transition-colors">
                  Save
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="w-full border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors">
                  Cancel
                </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-padel-blue/30 hover:border-padel-blue hover:text-padel-blue text-slate-400 font-semibold py-2 px-4 rounded-lg transition-colors mt-6"
          >
            <PlusIcon className="w-4 h-4" />
            Add Availability
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;