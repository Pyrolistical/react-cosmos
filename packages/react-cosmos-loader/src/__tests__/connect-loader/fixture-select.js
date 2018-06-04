// @flow

import { getMock } from 'react-cosmos-flow/jest';
import { createContext } from '../../create-context';
import { connectLoader } from '../../connect-loader';
import {
  renderer,
  proxies,
  fixtures,
  fixtureFoo,
  subscribeToWindowMessages,
  getLastWindowMessage,
  untilEvent,
  postWindowMessage
} from './_shared';

const mockMount = jest.fn();

jest.mock('../../create-context', () => ({
  createContext: jest.fn(() => ({ mount: mockMount }))
}));

subscribeToWindowMessages();

const mockDismissRuntimeErrors = jest.fn();

let destroy;

beforeEach(async () => {
  jest.clearAllMocks();

  destroy = await connectLoader({
    renderer,
    proxies,
    fixtures,
    dismissRuntimeErrors: mockDismissRuntimeErrors
  });

  await untilEvent('loaderReady');

  postWindowMessage({
    type: 'fixtureSelect',
    component: 'Foo',
    fixture: 'foo'
  });

  await untilEvent('fixtureSelect');
});

// Ensure state doesn't leak between tests
afterEach(() => destroy());

it('creates context with fixture "Foo/foo"', () => {
  expect(getMock(createContext).calls[0][0]).toMatchObject({
    renderer,
    proxies,
    fixture: fixtureFoo
  });
});

it('mounts context', () => {
  expect(mockMount).toHaveBeenCalled();
});

it('sends fixtureLoad event to parent with serializable fixture body', async () => {
  await untilEvent('fixtureLoad');

  expect(getLastWindowMessage()).toEqual({
    type: 'fixtureLoad',
    // Note: fixture.fooFn is unserializable so it's omitted
    fixtureBody: {
      foo: true
    }
  });
});

test('calls dismissRuntimeErrors', () => {
  expect(mockDismissRuntimeErrors).toHaveBeenCalled();
});
