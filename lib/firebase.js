"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

/** Same Storage bucket as admin-dashboard — upload from CMS UIs. */
const firebaseConfig = {
  apiKey: "AIzaSyAGA9pxuzJKLpgEYUoijLG9JY529wzZROc",
  authDomain: "globalrealty-1327f.firebaseapp.com",
  projectId: "globalrealty-1327f",
  storageBucket: "globalrealty-1327f.firebasestorage.app",
  messagingSenderId: "696568612998",
  appId: "1:696568612998:web:f6639765ad0c48f7ec2907",
  measurementId: "G-SY6QG4S4LN",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

export { app, storage };
