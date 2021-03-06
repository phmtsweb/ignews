import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import { mocked } from 'ts-jest/utils';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { getPrismicClient } from '../../services/prismic';

jest.mock('next-auth/client');
jest.mock('../../services/prismic');

const post = {
  slug: 'my-new-post',
  title: 'My new post',
  content: '<p>Post excerpt</p>',
  updatedAt: '10th March',
};

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('My new post')).toBeInTheDocument();
    expect(screen.getByText('Post excerpt')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      req: {
        cookies: {},
      },
      params: {
        slug: 'fake-slug',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/',
        }),
      })
    );
  });

  it('loads intial data', async () => {
    const getSessionMocked = mocked(getSession);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active',
    } as any);

    const getPrismicClientMocked = mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'My new post is very nice' }],
        },
        last_publication_date: '04-01-2021',
      }),
    } as any);

    const response = await getServerSideProps({
      params: {
        slug: 'fake-slug',
      },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'fake-slug',
            title: 'My new post',
            content: '<p>My new post is very nice</p>',
            updatedAt: '01 de abril de 2021',
          },
        },
      })
    );
  });
});
