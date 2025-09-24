// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,       // datos del usuario logueado
  token: null,      // token JWT u otro
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
  },
});

export default authSlice.reducer;