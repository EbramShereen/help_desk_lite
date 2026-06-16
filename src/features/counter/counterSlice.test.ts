import { describe, expect, it } from 'vitest';
import reducer, { increment, decrement, incrementByAmount } from './counterSlice';

describe('counterSlice', () => {
  it('returns the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({ value: 0 });
  });

  it('increments and decrements', () => {
    let state = reducer({ value: 0 }, increment());
    expect(state.value).toBe(1);
    state = reducer(state, decrement());
    expect(state.value).toBe(0);
  });

  it('increments by amount', () => {
    expect(reducer({ value: 2 }, incrementByAmount(5)).value).toBe(7);
  });
});
