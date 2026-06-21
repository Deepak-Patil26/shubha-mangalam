import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Dashboard Stats
export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to get stats";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get All Users
export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to get users";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Suspend User
export const suspendUser = createAsyncThunk(
  "admin/suspendUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/suspend`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("User suspended successfully");
      return { userId, data: response.data };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to suspend user";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Unsuspend User
export const unsuspendUser = createAsyncThunk(
  "admin/unsuspendUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/users/${userId}/unsuspend`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("User unsuspended successfully");
      return { userId, data: response.data };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to unsuspend user";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Delete User
export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      return userId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get All Callbacks
export const getAllCallbacks = createAsyncThunk(
  "admin/getAllCallbacks",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/admin/callbacks`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to get callbacks";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Update Callback Status
export const updateCallbackStatus = createAsyncThunk(
  "admin/updateCallbackStatus",
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/callbacks/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Callback updated successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update callback";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get All Complaints
export const getAllComplaints = createAsyncThunk(
  "admin/getAllComplaints",
  async (params, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/admin/complaints`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to get complaints";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Update Complaint Status
export const updateComplaintStatus = createAsyncThunk(
  "admin/updateComplaintStatus",
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/complaints/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Complaint updated successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update complaint";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Get All Success Stories
export const getAllSuccessStories = createAsyncThunk(
  "admin/getAllSuccessStories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/admin/success-stories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to get success stories";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Create Success Story
export const createSuccessStory = createAsyncThunk(
  "admin/createSuccessStory",
  async (storyData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/admin/success-stories`,
        storyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Success story created successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create success story";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Approve Success Story
export const approveSuccessStory = createAsyncThunk(
  "admin/approveSuccessStory",
  async (storyId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/admin/success-stories/${storyId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Success story approved");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to approve story";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// Delete Success Story
export const deleteSuccessStory = createAsyncThunk(
  "admin/deleteSuccessStory",
  async (storyId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await axios.delete(`${API_URL}/admin/success-stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Success story deleted");
      return storyId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete story";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const initialState = {
  stats: null,
  users: [],
  callbacks: [],
  complaints: [],
  successStories: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state) => {
        state.isLoading = false;
      })
      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.isLoading = false;
        state.users = [];
      })
      // Suspend User
      .addCase(suspendUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u._id === action.payload.userId);
        if (user) {
          user.isSuspended = true;
          user.isActive = false;
        }
      })
      // Unsuspend User
      .addCase(unsuspendUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u._id === action.payload.userId);
        if (user) {
          user.isSuspended = false;
          user.isActive = true;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      // Get All Callbacks
      .addCase(getAllCallbacks.fulfilled, (state, action) => {
        state.callbacks = action.payload.callbacks || [];
      })
      // Update Callback
      .addCase(updateCallbackStatus.fulfilled, (state, action) => {
        const index = state.callbacks.findIndex(
          (c) => c._id === action.payload.callback._id,
        );
        if (index > -1) {
          state.callbacks[index] = action.payload.callback;
        }
      })
      // Get All Complaints
      .addCase(getAllComplaints.fulfilled, (state, action) => {
        state.complaints = action.payload.complaints || [];
      })
      // Update Complaint
      .addCase(updateComplaintStatus.fulfilled, (state, action) => {
        const index = state.complaints.findIndex(
          (c) => c._id === action.payload.complaint._id,
        );
        if (index > -1) {
          state.complaints[index] = action.payload.complaint;
        }
      })
      // Success Stories
      .addCase(getAllSuccessStories.fulfilled, (state, action) => {
        state.successStories = action.payload.stories || [];
      })
      .addCase(createSuccessStory.fulfilled, (state, action) => {
        state.successStories.unshift(action.payload.successStory);
      })
      .addCase(approveSuccessStory.fulfilled, (state, action) => {
        const index = state.successStories.findIndex(
          (s) => s._id === action.payload.story._id,
        );
        if (index > -1) {
          state.successStories[index] = action.payload.story;
        }
      })
      .addCase(deleteSuccessStory.fulfilled, (state, action) => {
        state.successStories = state.successStories.filter(
          (s) => s._id !== action.payload,
        );
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
