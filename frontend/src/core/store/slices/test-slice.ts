import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const testSlice = createSlice({
  name: 'test',
  initialState: {
    value: 0
  },
  reducers: {
    setValue: (state, action: PayloadAction<number>) => {
      state.value = action.payload
    }
  }
})

export const { setValue } = testSlice.actions
export default testSlice.reducer
