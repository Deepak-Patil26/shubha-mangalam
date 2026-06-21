import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const sendInterest = createAsyncThunk(
  "interest/send",
  async (interestData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/interests/send`,
        interestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Interest sent successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send interest";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const acceptInterest = createAsyncThunk(
  "interest/accept",
  async (interestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/interests/${interestId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Interest accepted");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to accept interest";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const rejectInterest = createAsyncThunk(
  "interest/reject",
  async (interestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/interests/${interestId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.info("Interest rejected");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reject interest";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const cancelInterest = createAsyncThunk(
  "interest/cancel",
  async (interestId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.delete(
        `${API_URL}/interests/${interestId}/cancel`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.info("Interest cancelled");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel interest";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const getReceivedInterests = createAsyncThunk(
  "interest/received",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/interests/received`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get interests",
      );
    }
  },
);

export const getSentInterests = createAsyncThunk(
  "interest/sent",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/interests/sent`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get interests",
      );
    }
  },
);

export const getNotificationsCount = createAsyncThunk(
  "interest/notifications",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(
        `${API_URL}/interests/notifications/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get notifications",
      );
    }
  },
);

const initialState = {
  receivedInterests: [],
  sentInterests: [],
  pendingInterests: 0,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

const interestSlice = createSlice({
  name: "interest",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearInterests: (state) => {
      state.receivedInterests = [];
      state.sentInterests = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Interest
      .addCase(sendInterest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendInterest.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendInterest.rejected, (state) => {
        state.isLoading = false;
      })
      // Accept Interest
      .addCase(acceptInterest.fulfilled, (state, action) => {
        const index = state.receivedInterests.findIndex(
          (i) => i._id === action.payload.interest._id,
        );
        if (index > -1) {
          state.receivedInterests[index] = action.payload.interest;
        }
        state.pendingInterests = Math.max(0, state.pendingInterests - 1);
      })
      // Reject Interest
      .addCase(rejectInterest.fulfilled, (state, action) => {
        const index = state.receivedInterests.findIndex(
          (i) => i._id === action.payload.interest._id,
        );
        if (index > -1) {
          state.receivedInterests[index] = action.payload.interest;
        }
        state.pendingInterests = Math.max(0, state.pendingInterests - 1);
      })
      // Get Received Interests
      .addCase(getReceivedInterests.fulfilled, (state, action) => {
        state.receivedInterests = action.payload.interests;
        state.pagination = action.payload.pagination;
      })
      // Get Sent Interests
      .addCase(getSentInterests.fulfilled, (state, action) => {
        state.sentInterests = action.payload.interests;
        state.pagination = action.payload.pagination;
      })
      // Get Notifications Count
      .addCase(getNotificationsCount.fulfilled, (state, action) => {
        state.pendingInterests = action.payload.pendingInterests;
      });
  },
});

export const { clearError, clearInterests } = interestSlice.actions;
export default interestSlice.reducer;
