import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const searchProfiles = createAsyncThunk(
  "search/profiles",
  async (searchParams, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/search/profiles`, {
        params: searchParams,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Search failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const getSearchFilters = createAsyncThunk(
  "search/filters",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/search/filters`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get filters",
      );
    }
  },
);

export const getRecentlyViewed = createAsyncThunk(
  "search/recentlyViewed",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/search/recently-viewed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get recently viewed",
      );
    }
  },
);

const initialState = {
  results: [],
  filters: {},
  recentlyViewed: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
  isLoading: false,
  error: null,
  searchParams: {},
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
      };
    },
    setSearchParams: (state, action) => {
      state.searchParams = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Profiles
      .addCase(searchProfiles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload.profiles;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get Filters
      .addCase(getSearchFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      // Get Recently Viewed
      .addCase(getRecentlyViewed.fulfilled, (state, action) => {
        state.recentlyViewed = action.payload.profiles;
      });
  },
});

export const { clearResults, setSearchParams, clearError } =
  searchSlice.actions;
export default searchSlice.reducer;
