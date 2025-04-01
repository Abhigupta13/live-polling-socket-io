import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  role: "", // "teacher" or "student"
  name: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
  },
});

export const { setRole, setName } = userSlice.actions;
export default userSlice.reducer;
