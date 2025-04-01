import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import pollReducer from "./slices/pollSlice";
import chatReducer from "./slices/chatSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    poll: pollReducer,
    chat: chatReducer,
  },
});

export default store;
