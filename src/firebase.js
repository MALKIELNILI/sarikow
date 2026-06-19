import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCtTCUNeYzRMlSLe2VJs_ols818QI1ZuTA",
  authDomain: "sarikow-3342b.firebaseapp.com",
  databaseURL: "https://sarikow-3342b-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sarikow-3342b",
  storageBucket: "sarikow-3342b.firebasestorage.app",
  messagingSenderId: "95850039076",
  appId: "1:95850039076:web:4149b5724c52fbdaa315b1"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export function fbSet(path, val) {
  set(ref(db, path), val);
}

export function fbListen(path, cb) {
  const r = ref(db, path);
  onValue(r, snap => cb(snap.val()));
  return () => off(r, "value");
}
