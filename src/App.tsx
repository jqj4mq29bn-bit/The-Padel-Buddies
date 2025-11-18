import React, { useState } from "react";
import CreateMeetingModal from "./components/CreateMeetingModal";
import InviteBuddiesModal from "./components/InviteBuddiesModal";
import SuggestMatchModal from "./components/SuggestMatchModal";

export default function App(): JSX.Element {
  const [openCreate, setOpenCreate] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const [openSuggest, setOpenSuggest] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center p-6">
      <header className="w-full max-w-4xl flex items-center justify-between py-4">
        <h1 className="text-2xl font-semibold">The Padel Buddies</h1>
        <div className="space-x-2">
          <button onClick={() => setOpenCreate(true)} className="px-3 py-2 bg-cyan-600 text-white rounded">Create</button>
          <button onClick={() => setOpenInvite(true)} className="px-3 py-2 bg-slate-600 text-white rounded">Invite</button>
          <button onClick={() => setOpenSuggest(true)} className="px-3 py-2 bg-emerald-600 text-white rounded">Suggest Match</button>
        </div>
      </header>

      <main className="w-full max-w-4xl mt-6">
        <p className="text-sm text-slate-600">Welcome — click the buttons to open sample modal UIs.</p>
      </main>

      <CreateMeetingModal open={openCreate} onClose={() => setOpenCreate(false)} />
      <InviteBuddiesModal open={openInvite} onClose={() => setOpenInvite(false)} />
      <SuggestMatchModal open={openSuggest} onClose={() => setOpenSuggest(false)} />
    </div>
  );
}