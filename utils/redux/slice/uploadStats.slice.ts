// uploadStats.slice.ts
import { createSlice } from '@reduxjs/toolkit';

interface UploadStatsState {
  firestoreSuccess: number;
  firestoreFail: number;
  fcmSuccess: number;
  fcmFail: number;
}

const initialState: UploadStatsState = {
  firestoreSuccess: 0,
  firestoreFail: 0,
  fcmSuccess: 0,
  fcmFail: 0,
};

const uploadStatsSlice = createSlice({
  name: 'uploadStats',
  initialState,
  reducers: {
    incrementFirestoreSuccess: (state) => {
      state.firestoreSuccess += 1;
    },
    incrementFirestoreFail: (state) => {
      state.firestoreFail += 1;
    },
    incrementFCMSuccess: (state) => {
      state.fcmSuccess += 1;
    },
    incrementFCMFail: (state) => {
      state.fcmFail += 1;
    },
    resetStats: (state) => {
      state.firestoreSuccess = 0;
      state.firestoreFail = 0;
      state.fcmSuccess = 0;
      state.fcmFail = 0;
    },
  },
});

export const {
  incrementFirestoreSuccess,
  incrementFirestoreFail,
  incrementFCMSuccess,
  incrementFCMFail,
  resetStats,
} = uploadStatsSlice.actions;

export default uploadStatsSlice.reducer;