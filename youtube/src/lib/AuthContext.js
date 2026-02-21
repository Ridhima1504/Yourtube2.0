import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { provider, auth } from "./firebase";
import axiosInstance from "./axiosinstance";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOGIN ================= */
  const login = (userdata) => {
    setUser(userdata);
    localStorage.setItem("user", JSON.stringify(userdata));
  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem("user");
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  /* ================= OTP (SAFE) ================= */
  const triggerOTP = async (isSouthIndia, user) => {
    try {
      if (!user) return;

      // Only call if backend route exists
      if (isSouthIndia) {
        await axiosInstance.post("/otp/email", { email: user.email });
        console.log("OTP sent to email:", user.email);
      } else {
        await axiosInstance.post("/otp/mobile", { phone: user.phone });
        console.log("OTP sent to mobile:", user.phone);
      }
    } catch (err) {
      // Prevent 404 from breaking the app
      console.warn("OTP not sent (route missing or error):", err.message);
    }
  };

  const detectLocationAndSendOTP = (user) => {
    if (!navigator.geolocation || !user) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const isSouthIndia =
          latitude >= 8 &&
          latitude <= 20 &&
          longitude >= 74 &&
          longitude <= 85;

        triggerOTP(isSouthIndia, user);
      },
      () => {
        console.warn("Location permission denied. OTP skipped.");
      }
    );
  };

  /* ================= GOOGLE SIGN-IN ================= */
  const handlegooglesignin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseuser = result.user;

      if (!firebaseuser) return;

      const payload = {
        email: firebaseuser.email,
        name: firebaseuser.displayName,
        image: firebaseuser.photoURL,
      };

      // ✅ Correct login route
      const response = await axiosInstance.post("/user/login", payload);

      // Save user and send OTP safely
      login(response.data.result);
      detectLocationAndSendOTP(response.data.result);
    } catch (err) {
      console.error("Google sign-in failed or cancelled:", err.message);
    }
  };

  /* ================= SESSION RESTORE ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseuser) => {
      if (!firebaseuser) {
        setLoading(false);
        return;
      }

      // Restore user from localStorage if exists
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Prevent app from rendering before user is loaded
  if (loading) return null;

  return (
    <UserContext.Provider
      value={{ user, login, logout, handlegooglesignin }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
