import React, { useState } from "react";
import { CloseIcon } from "./IconComponents";

type Props = { open: boolean; onClose: () => void; };

export default function SuggestMatchModal({ open, onClose }: Props): JSX.Element | null {
  const [notes, setNotes] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Suggest a Match</h3>
          <button onClick={onClose}><CloseIcon /></button>
        </div>

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full border rounded p-2" rows={5} placeholder="Add your suggestion..." />

        <div className="flex justify-end mt-3">
          <button onClick={onClose} className="px-3 py-1 mr-2">Cancel</button>
          <button onClick={() => { console.log("Suggest:", notes); onClose(); }} className="px-3 py-1 bg-emerald-600 text-white rounded">Send</button>
        </div>
      </div>
    </div>
  );
}