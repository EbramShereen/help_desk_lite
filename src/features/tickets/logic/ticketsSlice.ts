import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TicketStatus, TicketPriority } from '../models/Ticket';

interface TicketsUIState {
  search: string;
  statusFilter: TicketStatus | null;
  priorityFilter: TicketPriority | null;
}

const initialState: TicketsUIState = {
  search: '',
  statusFilter: null,
  priorityFilter: null,
};

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<TicketStatus | null>) {
      state.statusFilter = action.payload;
    },
    setPriorityFilter(state, action: PayloadAction<TicketPriority | null>) {
      state.priorityFilter = action.payload;
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setSearch, setStatusFilter, setPriorityFilter, resetFilters } = ticketsSlice.actions;
export default ticketsSlice.reducer;
