import { render, screen } from '@testing-library/react';
import { User } from 'next-auth';
import { Session, useSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import { SignInButton } from '.';

jest.mock('next-auth/client');

describe('SignInButton component', () => {
  it('renders correctly when user is not authenticated', () => {
    const useSessionMocked = mocked(useSession);

    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<SignInButton />);

    expect(screen.getByText('Sign in with Github')).toBeInTheDocument();
  });

  it('renders correctly when user is authenticated', () => {
    const useSessionMocked = mocked(useSession);

    const user: User = {
      name: 'John Doe',
      email: 'john.doe@example.com',
    };

    const session: Session = {
      user,
      expires: 'fake-expires',
    };

    useSessionMocked.mockReturnValueOnce([session, false]);

    render(<SignInButton />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
