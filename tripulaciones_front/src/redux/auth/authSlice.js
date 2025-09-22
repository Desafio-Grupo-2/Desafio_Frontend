// src/redux/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk para login
export const login = createAsyncThunk(
  "auth/login",
  async (form, thunkAPI) => {
    try {
      // Simulación: podrías hacer fetch a tu API real
      const { email, password } = form;
      if (email === "test@demo.com" && password === "123456") {
        return { id: 1, email }; // usuario mock
      }
      throw new Error("Credenciales inválidas");
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
    logout: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Error en el login";
      });
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
