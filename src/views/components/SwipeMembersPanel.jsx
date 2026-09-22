export function SwipeMembersPanel({ members, isAdmin, user, roomId, handleKickMember, leaveSwipe }) {

  function leaveSwipingACB() {
    leaveSwipe?.();
  }


  return (
    <div className="swipe-members-panel">
      <h3 className="swipe-members-header">Members</h3>
      <ul className="swipe-members-list">
        {members?.map((member) => (
          <li key={member.uid} className="swipe-member-item">
            <img
              className="swipe-member-avatar"
              src={member.photo || `https://api.dicebear.com/7.x/thumbs/svg?seed=${member.name}`}
              alt={member.name}
            />
            <span className="swipe-member-name">{member.name || 'Anonymous'}</span>
            {isAdmin && member.uid !== user?.uid && (
              <button
                className="kick-btn"
                onClick={() => handleKickMember(roomId, member.uid)}
              >
                x
              </button>
            )}
            <span className={`swipe-member-status ${member.doneSwiping ? 'done' : 'swiping'}`}>
              {member.doneSwiping ? 'Done' : 'Swiping'}
            </span>

          </li>
        ))}
      </ul>
      <button className="toolbar-btn" onClick={leaveSwipingACB}>
        Leave
      </button>
    </div>
  );
}


/*<button className="toolbar-btn" onClick={leaveSwipingACB}>
            Leave
          </button>*/ 