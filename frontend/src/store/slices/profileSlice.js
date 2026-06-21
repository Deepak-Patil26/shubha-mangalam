import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const createOrUpdateProfile = createAsyncThunk(
  "profile/createOrUpdate",
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/profiles/save`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Profile saved successfully");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save profile";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const getMyProfile = createAsyncThunk(
  "profile/getMyProfile",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/profiles/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get profile",
      );
    }
  },
);

export const getProfileById = createAsyncThunk(
  "profile/getById",
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/profiles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to get profile",
      );
    }
  },
);

export const uploadPhotos = createAsyncThunk(
  "profile/uploadPhotos",
  async (photos, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/profiles/photos`,
        { photos },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Photos uploaded successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to upload photos";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const setProfilePicture = createAsyncThunk(
  "profile/setProfilePicture",
  async (photoId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.put(
        `${API_URL}/profiles/photos/profile-picture`,
        { photoId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Profile picture updated");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update profile picture";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const deletePhoto = createAsyncThunk(
  "profile/deletePhoto",
  async (photoId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.delete(
        `${API_URL}/profiles/photos/${photoId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      toast.success("Photo deleted");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete photo";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

export const saveProfile = createAsyncThunk(
  "profile/saveProfile",
  async (profileId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.post(
        `${API_URL}/profiles/save`,
        { profileId },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save profile";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

// ADD THIS - Get Saved Profiles
export const getSavedProfiles = createAsyncThunk(
  "profile/getSavedProfiles",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await axios.get(`${API_URL}/profiles/saved/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to get saved profiles";
      toast.error(message);
      return rejectWithValue(message);
    }
  },
);

const initialState = {
  currentProfile: null,
  viewingProfile: null,
  savedProfiles: [],
  isLoading: false,
  error: null,
  completionPercentage: 0,
  isPublic: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearViewingProfile: (state) => {
      state.viewingProfile = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create/Update Profile
      .addCase(createOrUpdateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrUpdateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload.profile;
        state.completionPercentage = action.payload.completionPercentage;
        state.isPublic = action.payload.isPublic;
      })
      .addCase(createOrUpdateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get My Profile
      .addCase(getMyProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProfile = action.payload.profile;
        state.completionPercentage = action.payload.completionPercentage;
        state.isPublic = action.payload.isPublic;
      })
      .addCase(getMyProfile.rejected, (state) => {
        state.isLoading = false;
      })
      // Get Profile By ID
      .addCase(getProfileById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProfileById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.viewingProfile = action.payload;
      })
      .addCase(getProfileById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload Photos
      .addCase(uploadPhotos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(uploadPhotos.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentProfile) {
          state.currentProfile.photos = action.payload.photos;
        }
      })
      .addCase(uploadPhotos.rejected, (state) => {
        state.isLoading = false;
      })
      // Delete Photo
      .addCase(deletePhoto.fulfilled, (state, action) => {
        if (state.currentProfile) {
          state.currentProfile.photos = action.payload.photos;
        }
      })
      // Save Profile
      .addCase(saveProfile.fulfilled, (state, action) => {
        if (action.payload.saved) {
          toast.success("Profile saved to favorites");
        } else {
          toast.info("Profile removed from favorites");
        }
      })
      // ADD THIS - Get Saved Profiles
      .addCase(getSavedProfiles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSavedProfiles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedProfiles = action.payload.profiles || [];
      })
      .addCase(getSavedProfiles.rejected, (state) => {
        state.isLoading = false;
        state.savedProfiles = [];
      });
  },
});

export const { clearError, clearViewingProfile } = profileSlice.actions;
export default profileSlice.reducer;
