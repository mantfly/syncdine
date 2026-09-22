import { useEffect } from 'react';

export function SwipeWaitingView({ members, onLeave }) {
  const doneCount = members?.filter((m) => m.doneSwiping).length || 0;
  const totalCount = members?.length || 0;

  return (
    <div className="swipe-waiting-page">
      <div className="swipe-waiting-card">
        <div className="swipe-waiting-spinner"></div>
        <h2>You're all done!</h2>
        <p>Waiting for everyone else to finish swiping...</p>

        <div className="swipe-waiting-progress">
          <span>{doneCount} / {totalCount} members done</span>
          <div className="swipe-waiting-bar-track">
            <div
              className="swipe-waiting-bar-fill"
              style={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <ul className="swipe-waiting-members">
          {members?.map((member) => (
            <li key={member.uid} className="swipe-waiting-member">
              <span className="swipe-waiting-member-name">{member.name || 'Anonymous'}</span>
              <span className={`swipe-waiting-status ${member.doneSwiping ? 'done' : 'swiping'}`}>
                {member.doneSwiping ? 'Done' : 'Still swiping...'}
              </span>
            </li>
          ))}
        </ul>

        <button className="swipe-waiting-leave-btn" onClick={onLeave}>
          Leave Room
        </button>
      </div>
    </div>
  );
}
