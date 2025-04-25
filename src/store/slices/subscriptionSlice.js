import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getRequest } from "@/utils/apiFunctions"; // Adjust the import path

// Define the async thunk using getRequest
export const fetchSubscriptionDetails = createAsyncThunk(
  "subscription/fetchSubscriptionDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRequest("/get-my-subscription");
      return response.data.subscription.subscription_items;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);

// Initial state
const initialState = {
  data: null,
  loading: false,
  error: null,
};

// Create the slice
const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubscriptionDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSubscriptionError } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;
