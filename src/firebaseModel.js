// Firebase core
import { initializeApp } from "firebase/app";

// Firestore
import {
    getFirestore,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    arrayUnion,
    arrayRemove,
    increment
} from "firebase/firestore";

// Auth
import { 
    getAuth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    signOut, 
    signInWithPopup, 
    GoogleAuthProvider 
} from "firebase/auth";

// Firebase config
import { firebaseConfig } from "./firebaseConfig";

// initialize Firebase app
const app = initializeApp(firebaseConfig);

// initialize Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// OPTIONAL: useful during development
window.db = db;
window.collection = collection;
window.doc = doc;
window.getDoc = getDoc;
window.setDoc = setDoc;
window.addDoc = addDoc;


// ==========================================
// PERSISTENCE LAYER API
// ==========================================

// ---- AUTHENTICATION ----
export function subsAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function loginEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function registerEmail(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function updateAuthProfile(user, data) {
  return updateProfile(user, data);
}

export function loginGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export function logout() {
  return signOut(auth);
}

// ---- USER OPERATIONS ----
export function subsUser(uid, callback) {
  return onSnapshot(doc(db, 'users', uid), callback);
}

export function getUser(uid) {
  return getDoc(doc(db, 'users', uid));
}

export function updateUser(uid, data, options = {}) {
  return setDoc(doc(db, 'users', uid), data, options);
}

export function updateUserData(uid, data) {
  return updateDoc(doc(db, 'users', uid), data);
}

export function incrementRoomsHosted(uid) {
  return updateDoc(doc(db, 'users', uid), { roomsHosted: increment(1) });
}

export function addMatchToUser(uid, matchHistoryItem) {
  if (matchHistoryItem) {
    return updateDoc(doc(db, 'users', uid), { 
      matchesFound: increment(1),
      history: arrayUnion(matchHistoryItem)
    });
  } else {
    return updateDoc(doc(db, 'users', uid), { 
      matchesFound: increment(1)
    });
  }
}

// ---- ROOM OPERATIONS ----
export function createRoom(code, data) {
  return setDoc(doc(db, 'rooms', code), data);
}

export function getRoom(code) {
  return getDoc(doc(db, 'rooms', code));
}

export function subsRoom(code, callback) {
  return onSnapshot(doc(db, 'rooms', code), callback);
}

export function updateRoomData(code, data) {
  return updateDoc(doc(db, 'rooms', code), data);
}

export function deleteRoom(code) {
  return deleteDoc(doc(db, 'rooms', code));
}

export function addRoomMember(code, member) {
  return updateDoc(doc(db, 'rooms', code), { members: arrayUnion(member) });
}

export function removeRoomMember(code, member) {
  return updateDoc(doc(db, 'rooms', code), { members: arrayRemove(member) });
}

export function addVoteToRoom(code, restaurantId, userId) {
  return updateDoc(doc(db, 'rooms', code), { [`votes.${restaurantId}`]: arrayUnion(userId) });
}

// Remove a user's votes from all restaurants in the room
export async function removeVotesForUser(code, userId) {
  const snap = await getDoc(doc(db, 'rooms', code));
  if (!snap.exists()) return;
  const data = snap.data();
  const votes = data.votes || {};
  const updates = {};
  for (const [restaurantId, voterArray] of Object.entries(votes)) {
    if (Array.isArray(voterArray) && voterArray.includes(userId)) {
      updates[`votes.${restaurantId}`] = voterArray.filter(uid => uid !== userId);
    }
  }
  if (Object.keys(updates).length > 0) {
    await updateDoc(doc(db, 'rooms', code), updates);
  }
}

// ---- ACTIVE ROOM TRACKING ----
export function setActiveRoom(uid, roomId) {
  return updateDoc(doc(db, 'users', uid), {
    activeRoom: { roomId, joinedAt: new Date() }
  });
}

export function clearActiveRoom(uid) {
  return updateDoc(doc(db, 'users', uid), { activeRoom: null });
}