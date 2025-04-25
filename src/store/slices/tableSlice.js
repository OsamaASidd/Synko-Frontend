import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const tableSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    updateItemPosition: (state, action) => {
      const { id, x, y } = action.payload;

      const index = state?.items?.findIndex((item) => item.id === id);

      if (index !== -1) {
        state.items[index].x = x;
        state.items[index].y = y;
      }
    },
  },
});

export const { setItems, updateItemPosition } = tableSlice.actions;

export default tableSlice.reducer;
