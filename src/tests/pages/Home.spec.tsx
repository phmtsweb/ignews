import { render, screen } from '@testing-library/react';
import { mocked } from 'ts-jest/utils';
import Home, { getStaticProps } from '../../pages';
import { stripe } from '../../services/stripe';

jest.mock('next/router');
jest.mock('next-auth/client', () => {
  return {
    useSession() {
      return [null, false];
    },
  };
});

jest.mock('../../services/stripe');

describe('Home page', () => {
  it('renders correctly', () => {
    render(<Home product={{ priceId: 'fake-price-id', amount: 'R$100,00' }} />);

    expect(screen.getByText('for R$100,00 month')).toBeInTheDocument();
  });

  it('loads intial data', async () => {
    const retrieveMocked = mocked(stripe.prices.retrieve);

    retrieveMocked.mockResolvedValueOnce({
      id: 'fake-price-id',
      unit_amount: 10000,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            priceId: 'fake-price-id',
            amount: '$100.00',
          },
        },
      })
    );
  });
});
