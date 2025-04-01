import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePoll: null,
  pastPolls: [],
};

const pollSlice = createSlice({
  name: "poll",
  initialState,
  reducers: {
    setActivePoll: (state, action) => {
      state.activePoll = action.payload;
    },
    endPoll: (state) => {
      if (state.activePoll) {
        state.pastPolls.push(state.activePoll);
        state.activePoll = null;
      }
    },
  },
});

export const { setActivePoll, endPoll } = pollSlice.actions;
export default pollSlice.reducer;
