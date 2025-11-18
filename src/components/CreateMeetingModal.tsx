import React, { useState } from "react";
import { CloseIcon } from "./IconComponents";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateMeetingModal({ open, onClose }: Props): JSX.Element | null {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Create Meeting</h2>
          <button onClick={onClose} aria-label="Close"><CloseIcon /></button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Replace with real submit logic
            console.log("Create:", { title, date });
            onClose();
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full border rounded px-2 py-1" />
          </div>

          <div>
            <label className="block text-sm font-medium">Date & Time</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" className="mt-1 w-full border rounded px-2 py-1" />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-3 py-1 mr-2">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-cyan-600 text-white rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}