// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminSignals } from './AdminSignals';

const apiGet = vi.fn();
const apiPost = vi.fn();
const apiPut = vi.fn();
const apiDelete = vi.fn();

vi.mock('../../services/api', () => ({
  api: {
    get: (...args: unknown[]) => apiGet(...args),
    post: (...args: unknown[]) => apiPost(...args),
    put: (...args: unknown[]) => apiPut(...args),
    delete: (...args: unknown[]) => apiDelete(...args),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ token: 'admin-session-token' }),
}));

const signal = {
  id: 'signal-1',
  pair: 'ETH/USDT',
  type: 'LONG',
  category: 'SWING',
  entry: '2000',
  stopLoss: '1900',
  targets: ['2200'],
  status: 'ACTIVE',
};

describe('AdminSignals mutation states', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
    apiPut.mockReset();
    apiDelete.mockReset();
    apiGet.mockResolvedValue({ data: [signal] });
    vi.stubGlobal('confirm', vi.fn(() => true));
  });

  it('disables signal controls while a status request is pending', async () => {
    let resolveUpdate!: (value: unknown) => void;
    apiPut.mockImplementation(() => new Promise((resolve) => { resolveUpdate = resolve; }));
    render(<AdminSignals />);

    const targetHit = await screen.findByRole('button', { name: 'Target Hit' });
    const stopHit = screen.getByRole('button', { name: 'Stop Hit' });
    const deleteSignal = screen.getByRole('button', { name: 'Delete ETH/USDT signal' });
    fireEvent.click(targetHit);

    await waitFor(() => expect(apiPut).toHaveBeenCalledTimes(1));
    expect(apiPut).toHaveBeenCalledWith('/api/admin/signals/signal-1', { status: 'HIT' });
    expect((targetHit as HTMLButtonElement).disabled).toBe(true);
    expect((stopHit as HTMLButtonElement).disabled).toBe(true);
    expect((deleteSignal as HTMLButtonElement).disabled).toBe(true);

    resolveUpdate({ data: { success: true } });
    await waitFor(() => expect(apiGet).toHaveBeenCalledTimes(2));
  });
});