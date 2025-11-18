import React, { useState } from "react";
import { CloseIcon } from "./IconComponents";

type Props = { open: boolean; onClose: () => void; };

const SAMPLE_BUDDIES = [
  { id: "1", name: "Ana" },
  { id: "2", name: "Lucas" },
  { id: "3", name: "Marta" }
];

export default function InviteBuddiesModal({ open, onClose }: Props): JSX.Element | null {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  if (!open) return null;

  function toggle(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Invite Buddies</h3>
          <button onClick={onClose}><CloseIcon /></button>
        </div>

        <ul className="space-y-2">
          {SAMPLE_BUDDIES.map((b) => (
            <li key={b.id} className="flex items-center justify-between">
              <span>{b.name}</span>
              <button onClick={() => toggle(b.id)} className={`px-2 py-1 rounded ${selected[b.id] ? "bg-cyan-600 text-white" : "bg-gray-100"}`}> 
                {selected[b.id] ? "Selected" : "Invite"}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="px-3 py-1">Close</button>
        </div>
      </div>
    </div>
  );
}