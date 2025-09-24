// src/redux/auth/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService";

// Thunk para login
export const login = createAsyncThunk(
  "auth/login",
  async (form, thunkAPI) => {
    try {
      const result = await authService.login(form);
      return result.user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Thunk para logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await authService.logout();
      return null;
    } catch (err) {
      // Incluso si falla el logout en el servidor, limpiar el estado local
      return null;
    }
  }
);

// Thunk para obtener perfil
export const getProfile = createAsyncThunk(
  "auth/getProfile",
  async (_, thunkAPI) => {
    try {
      const user = await authService.getProfile();
      return user;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// Estado inicial - intentar cargar usuario del localStorage
const initialState = {
  user: authService.getCurrentUser(),
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: "",
  isAuthenticated: authService.isAuthenticated(),
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
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = "";
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.message = "Login exitoso";
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
        state.user = null;
        state.isAuthenticated = false;
        state.message = action.payload || "Error en el login";
      })
      // Logout cases
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      // Get profile cases
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Error al obtener perfil";
        // Si falla obtener el perfil, limpiar autenticación
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { reset, clearAuth } = authSlice.actions;
export default authSlice.reducer;
