import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AvatarStack } from './AvatarStack';

const people = [
  { id: '1', name: 'Ada Lovelace' },
  { id: '2', name: 'Alan Turing' },
  { id: '3', name: 'Grace Hopper' },
  { id: '4', name: 'Edsger Dijkstra' },
  { id: '5', name: 'Linus Torvalds' },
];

describe('AvatarStack', () => {
  it('renders initials for people up to the max', () => {
    render(<AvatarStack people={people} max={3} />);
    expect(screen.getByText('AL')).toBeInTheDocument(); // Ada Lovelace
    expect(screen.getByText('AT')).toBeInTheDocument(); // Alan Turing
  });

  it('shows a +N overflow chip beyond the max', () => {
    render(<AvatarStack people={people} max={3} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders no overflow chip when within max', () => {
    render(<AvatarStack people={people.slice(0, 2)} max={4} />);
    expect(screen.queryByText(/^\+/)).not.toBeInTheDocument();
  });
});
