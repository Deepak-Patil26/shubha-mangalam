import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get user",
      );
    }
  },
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Password changed successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Check auth
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { getState, dispatch }) => {
    const { token, user } = getState().auth;
    if (token && !user) {
      await dispatch(getCurrentUser());
    }
  },
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresProfileCompletion: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requiresProfileCompletion = false;
      localStorage.removeItem("token");
      toast.info("Logged out successfully");
    },
    clearError: (state) => {
      state.error = null;
    },
    setProfileComplete: (state) => {
      state.requiresProfileCompletion = false;
      if (state.user) {
        state.user.isProfileComplete = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.requiresProfileCompletion = true;
        localStorage.setItem("token", action.payload.token);
        toast.success("Registration successful! Please complete your profile.");
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.requiresProfileCompletion =
          action.payload.requiresProfileCompletion;
        localStorage.setItem("token", action.payload.token);
        toast.success("Welcome back!");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.requiresProfileCompletion = !action.payload.isProfileComplete;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem("token");
      })
      // Change password
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, setProfileComplete } = authSlice.actions;
export default authSlice.reducer;
