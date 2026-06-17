import { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  signInAnonymously,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.isAnonymous) {
          setUser(null);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", firebaseUser.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          const isEmailAdmin =
            firebaseUser.email?.toLowerCase() === "admin@stitchaura.com";
          const defaultUserData = {
            name: isEmailAdmin
              ? "Admin"
              : firebaseUser.displayName || firebaseUser.email.split("@")[0],
            email: firebaseUser.email,
            role: isEmailAdmin ? "admin" : "user",
          };
          await setDoc(userRef, defaultUserData);
          snap = await getDoc(userRef);
        }

        setUser({
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          ...snap.data(),
        });
      } else {
        setUser(null);
        signInAnonymously(auth).catch((err) => {
          console.error("Anonymous authentication failed:", err);
        });
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signup({ name, email, phone, password }) {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      const newUser = {
        name,
        email,
        phone,
        role: email.toLowerCase() === "admin@stitchaura.com" ? "admin" : "user",
      };

      await setDoc(doc(db, "users", credential.user.uid), newUser);

      setUser({
        uid: credential.user.uid,
        id: credential.user.uid,
        ...newUser,
      });

      return { ok: true };
    } catch (err) {
      let message = "Login failed.";

      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          message = "Incorrect email or password.";
          break;

        case "auth/user-not-found":
          message = "No account found with this email.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          message = "Too many login attempts. Please try again later.";
          break;

        default:
          message = "Something went wrong. Please try again.";
      }

      return {
        ok: false,
        message,
      };
    }
  }

  async function login({ email, password }) {
    try {
      let credential;
      try {
        credential = await signInWithEmailAndPassword(auth, email, password);
      } catch (authErr) {
        // Auto-create/register admin account locally if it doesn't exist in Firebase auth yet
        const isDefaultAdmin =
          email.toLowerCase() === "admin@stitchaura.com" &&
          password === "admin123";
        if (
          isDefaultAdmin &&
          (authErr.code === "auth/user-not-found" ||
            authErr.code === "auth/invalid-credential" ||
            authErr.code === "auth/wrong-password")
        ) {
          credential = await createUserWithEmailAndPassword(
            auth,
            email,
            password,
          );
        } else {
          throw authErr;
        }
      }

      const userRef = doc(db, "users", credential.user.uid);
      let snap = await getDoc(userRef);

      if (!snap.exists()) {
        const isEmailAdmin = email.toLowerCase() === "admin@stitchaura.com";
        const defaultUserData = {
          name: isEmailAdmin
            ? "Admin"
            : credential.user.displayName || email.split("@")[0],
          email: email,
          role: isEmailAdmin ? "admin" : "user",
        };
        await setDoc(userRef, defaultUserData);
        snap = await getDoc(userRef);
      }

      const loggedInUser = {
        uid: credential.user.uid,
        id: credential.user.uid,
        ...snap.data(),
      };
      setUser(loggedInUser);

      return { ok: true, user: loggedInUser };
    } catch (err) {
      return {
        ok: false,
        message: err.message,
      };
    }
  }

  async function updateUserProfile({ name, email, phone }) {
    if (!user?.uid) throw new Error("User not logged in");
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { name, email, phone });
    setUser((prev) => ({ ...prev, name, email, phone }));
  }

  async function changeUserPassword(oldPassword, newPassword) {
    if (!auth.currentUser) throw new Error("No user is currently logged in.");
    const email = auth.currentUser.email;
    const credential = EmailAuthProvider.credential(email, oldPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  //reset password function
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);

      return {
        ok: true,
        message: "Password reset email sent. Check your inbox.",
      };
    } catch (err) {
      let message = "Failed to send password reset email.";

      switch (err.code) {
        case "auth/user-not-found":
          message = "No account exists with this email address.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          message = "Too many attempts. Please try again after some time.";
          break;

        default:
          message = "Something went wrong. Please try again.";
      }

      return {
        ok: false,
        message,
      };
    }
  }

  const value = useMemo(
    () => ({
      user,
      signup,
      login,
      logout,
      resetPassword,
      updateUserProfile,
      changeUserPassword,
    }),
    [user],
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
