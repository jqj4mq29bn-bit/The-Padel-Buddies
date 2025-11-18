import React from 'react';
import { Notification } from '../types';
import { XIcon } from './IconComponents';

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onMarkAsRead, onMarkAllAsRead, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute top-16 right-0 w-80 bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-lg shadow-2xl z-50 text-white">
      <div className="flex justify-between items-center p-3 border-b border-padel-blue/20">
        <h3 className="font-bold">Notifications</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      {notifications.length > 0 ? (
        <>
          {unreadCount > 0 && (
            <div className="p-2 border-b border-padel-blue/20">
              <button onClick={onMarkAllAsRead} className="text-sm text-padel-blue hover:underline w-full text-right">
                Mark all as read
              </button>
            </div>
          )}
          <ul className="max-h-96 overflow-y-auto">
            {notifications.slice().sort((a, b) => b.timestamp - a.timestamp).map(notification => (
              <li
                key={notification.id}
                className={`p-3 border-b border-padel-blue/10 flex gap-3 ${!notification.read ? 'bg-padel-blue/10' : ''}`}
              >
                <div className="flex-shrink-0 mt-1.5">
                  {!notification.read && <div className="w-2 h-2 bg-padel-blue rounded-full"></div>}
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-slate-200">{notification.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                  {!notification.read && (
                    <button onClick={() => onMarkAsRead(notification.id)} className="text-xs text-padel-blue hover:underline mt-1 font-semibold">
                      Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="p-4 text-center text-sm text-slate-400">You have no new notifications.</p>
      )}
    </div>
  );
};

export default NotificationPanel;