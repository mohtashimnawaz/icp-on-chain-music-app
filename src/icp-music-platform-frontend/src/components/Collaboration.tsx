import React, { useState } from 'react';

const Collaboration: React.FC = () => {
  const [collaborators, setCollaborators] = useState<string[]>(["alice@icp", "bob@icp"]);
  const [invite, setInvite] = useState("");

  const handleInvite = () => {
    if (invite && !collaborators.includes(invite)) {
      setCollaborators([...collaborators, invite]);
      setInvite("");
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Collaboration</h2>
      <div>
        <input
          type="text"
          placeholder="Enter collaborator's username or principal"
          value={invite}
          onChange={e => setInvite(e.target.value)}
        />
        <button onClick={handleInvite} disabled={!invite} style={{ marginLeft: 8 }}>
          Invite
        </button>
      </div>
      <h3 style={{ marginTop: '2rem' }}>Collaborators</h3>
      <ul>
        {collaborators.map((c, idx) => (
          <li key={idx}>{c}</li>
        ))}
      </ul>
    </div>
  );
};

export default Collaboration; 