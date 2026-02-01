import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const result = await signInWithPopup(auth, googleProvider);
  const email = result.user.email;

  if (!email || !email.endsWith("@ucsd.edu")) {
    await signOut(auth);
    throw new Error("Only @ucsd.edu accounts are allowed.");
  }

  return result.user;
}

export async function logOut() {
  await signOut(getFirebaseAuth());
}
