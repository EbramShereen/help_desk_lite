import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppButton } from './AppButton';

describe('AppButton', () => {
  it('renders children and fires onClick', async () => {
    const onClick = vi.fn();
    render(<AppButton onClick={onClick}>Submit</AppButton>);
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled while loading', () => {
    render(<AppButton isLoading>Save</AppButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
