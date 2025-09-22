// src/redux/auth/authSlice.js

import { createSlice } from '@reduxjs/toolkit';

// Estado inicial (puedes modificarlo según tu lógica de autenticación)
const initialState = {
  user: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  // Puedes agregar extraReducers aquí para manejar createAsyncThunk cuando los tengas
});

export const { reset } = authSlice.actions;

// Exportar el reducer por defecto
export default authSlice.reducer;
