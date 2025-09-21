import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export const signup = async (email: string, password: string) => {
  return await createUserWithEmailAndPassword(auth, email, password);
};

export const login = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const checkAccess = async (email: string) => {
  const docRef = doc(db, "allowedUsers", email);
  const docSnap = await getDoc(docRef);

  return docSnap.exists();
};
