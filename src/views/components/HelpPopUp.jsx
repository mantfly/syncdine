
import { useState } from "react";

export function HelpButtonPopUp() {


    const [isOpen, setIsOpen] = useState(false);

    function closeHelp() {
        setIsOpen(false);
    }

    function toggleHelp() {
        setIsOpen(prev => !prev);
    }
    return (

        <div className="help-button-container">
            {isOpen && <div className="help-popup-overlay" onClick={closeHelp} />}
            <div className={`help-popup ${isOpen ? "open" : ""}`} >


                <button
                    className="help-popup-close"
                    onClick={closeHelp}
                >
                    ✕
                </button>

                <div className="help-popup-content">
                    <h3>Welcome to SyncDine</h3>
                    <p className="help-popup-subtitle">
                        Invite friends, swipe on nearby restaurants, and instantly find the perfect match -
                        no more endless group chat debates.
                    </p>

                    <hr />

                    <h4>What is SyncDine?</h4>
                    <p>
                        SyncDine helps groups agree on a restaurant - fast. Everyone joins a shared room,
                        swipes on the same nearby options, and when the whole group likes the same place, it's a match!
                    </p>

                    <h4>How to Get Started</h4>
                    <ol>
                        <li>Click <b>Create Room</b> on the home page</li>
                        <li>Set your room name, location, and filters</li>
                        <li>Share the unique room code or link with your friends</li>
                        <li>Swipe <b>right</b> to like, <b>left</b> to pass</li>
                        <li>Get notified when the group matches on a restaurant!</li>
                    </ol>

                    <h4>Features</h4>
                    <ul>
                        <li>Tinder-style swipe interface</li>
                        <li>Website and directions provided on match</li>
                        <li>Personal profile with your match history</li>
                        <li>Mobile and touch friendly</li>
                    </ul>

                    <h4>FAQ</h4>
                    <div className="help-faq">
                        <div className="help-faq-item">
                            <p className="help-faq-q">How does location work?</p>
                            <p className="help-faq-a">
                                When creating a room, you set the location - either using your current location
                                or by searching for an address. All members then see restaurants near that spot.
                            </p>
                        </div>
                        <div className="help-faq-item">
                            <p className="help-faq-q">What if the group can't agree?</p>
                            <p className="help-faq-a">
                                No worries! You'll see the closest matches ranked from most to least liked,
                                so you can still make a decision together.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                className="help-button"
                onClick={toggleHelp}
            >
                ?
            </button>
        </div>
    );
}