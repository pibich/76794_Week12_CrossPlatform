// counter.slice.ts
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

interface CounterState {
  count: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CounterState = {
  count: 0,
  status: 'idle',
  error: null,
};

export const fetchPostsCount = createAsyncThunk(
  'counter/fetchPostsCount',
  async () => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data.length;
  }
);

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.count += 1;
    },
    decrement: (state) => {
      state.count -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostsCount.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPostsCount.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = 'idle';
        state.count = action.payload;
      })
      .addCase(fetchPostsCount.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch posts';
      });
  },
});

export const { increment, decrement } = counterSlice.actions;
export default counterSlice.reducer;