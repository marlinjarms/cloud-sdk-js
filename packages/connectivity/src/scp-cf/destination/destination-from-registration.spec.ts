import { createLogger } from '@sap-cloud-sdk/util';
import { JwtHeader, JwtPayload } from 'jsonwebtoken';
import base64url from 'base64url';
import {
  mockServiceBindings,
  providerServiceToken,
  subscriberServiceToken,
  subscriberUserJwt,
  unmockDestinationsEnv
} from '../../../../../test-resources/test/test-util';
import {
  DestinationWithName,
  registerDestination,
  registerDestinationCache,
  searchRegisteredDestination
} from './destination-from-registration';
import { getDestination } from './destination-accessor';
import { IsolationStrategy } from './destination-cache';

const testDestination: DestinationWithName = {
  name: 'RegisteredDestination',
  url: 'https://example.com'
};

const destinationWithForwarding: DestinationWithName = {
  forwardAuthToken: true,
  url: 'https://mys4hana.com',
  name: 'FORWARD-TOKEN-DESTINATION'
};

describe('register-destination', () => {
  beforeAll(() => {
    mockServiceBindings();
  });

  afterEach(() => {
    registerDestinationCache.clear();
    unmockDestinationsEnv();
  });

  it('registers destination and retrieves it', async () => {
    registerDestination(testDestination);
    const actual = await getDestination({
      destinationName: testDestination.name
    });
    expect(actual).toEqual(testDestination);
  });

  it('registers destination and retrieves it with JWT', async () => {
    registerDestination(testDestination, { jwt: providerServiceToken });
    const actual = await getDestination({
      destinationName: testDestination.name,
      jwt: providerServiceToken
    });
    expect(actual).toEqual(testDestination);
  });

  it('returns undefined if destination key is not found', async () => {
    const actual = searchRegisteredDestination({
      destinationName: 'Non-existing-destination'
    });
    expect(actual).toBeNull();
  });

  it('caches with tenant-isolation if no JWT is given', () => {
    registerDestination(testDestination);
    expect(
      registerDestinationCache
        .getCacheInstance()
        .hasKey('provider::RegisteredDestination')
    ).toBe(true);
  });

  it('caches with tenant isolation if JWT does not contain user-id', () => {
    registerDestination(testDestination, { jwt: subscriberServiceToken });
    expect(
      registerDestinationCache
        .getCacheInstance()
        .hasKey('subscriber::RegisteredDestination')
    ).toBe(true);
  });

  it('caches with tenant-user-isolation if JWT is given', () => {
    registerDestination(testDestination, { jwt: subscriberUserJwt });
    expect(
      registerDestinationCache
        .getCacheInstance()
        .hasKey('user-sub:subscriber:RegisteredDestination')
    ).toBe(true);
  });

  it('cache if tenant if you want', async () => {
    registerDestination(testDestination, {
      jwt: subscriberUserJwt,
      isolationStrategy: IsolationStrategy.Tenant
    });
    expect(
      registerDestinationCache
        .getCacheInstance()
        .hasKey('subscriber::RegisteredDestination')
    ).toBe(true);
  });

  it('caches with unlimited time', async () => {
    registerDestination(testDestination);
    const minutesToExpire = 9999;
    // Shift time to expire the set item
    jest.advanceTimersByTime(60000 * minutesToExpire);
    const actual = await getDestination({
      destinationName: testDestination.name
    });
    expect(actual).toEqual(testDestination);
  });

  it('adds proxy to registered destination', async () => {
    process.env['https_proxy'] = 'some.http.com';
    registerDestination(testDestination);
    const actual = await getDestination({
      destinationName: testDestination.name
    });
    expect(actual?.proxyConfiguration?.host).toEqual('some.http.com');
    delete process.env['https_proxy'];
  });

  it('adds the auth token if forwardAuthToken is enabled', async () => {
    registerDestination(destinationWithForwarding);
    const jwtPayload: JwtPayload = { exp: 1234, zid: 'provider' };
    const jwtHeader: JwtHeader = { alg: 'HS256' };

    const payloadEncoded = base64url(JSON.stringify(jwtPayload));
    const headerEncoded = base64url(JSON.stringify(jwtHeader));

    const fullToken = `${headerEncoded}.${payloadEncoded}.SomeHash`;
    const actual = await getDestination({
      destinationName: 'FORWARD-TOKEN-DESTINATION',
      jwt: fullToken,
      isolationStrategy: IsolationStrategy.Tenant
    });
    expect(actual?.authTokens![0].expiresIn).toEqual('1234');
    expect(actual?.authTokens![0].value).toEqual(fullToken);
    expect(actual?.authTokens![0].http_header.value).toEqual(
      `Bearer ${fullToken}`
    );
  });

  it('warns if forwardAuthToken is enabled but no token provided.', async () => {
    registerDestination(destinationWithForwarding);

    const logger = createLogger('register-destination');
    const warnSpy = jest.spyOn(logger, 'warn');
    await getDestination({ destinationName: 'FORWARD-TOKEN-DESTINATION' });
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /Option 'forwardAuthToken' was set on destination but no token was provided to forward./
      )
    );
  });

  it('infos if registered destination is retrieved.', async () => {
    registerDestination(testDestination);

    const logger = createLogger('register-destination');
    const infoSpy = jest.spyOn(logger, 'info');
    await getDestination({ destinationName: testDestination.name });
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringMatching(
        /Successfully retrieved destination '\w+' from registered destinations./
      )
    );
  });
});

describe('register-destination without xsuaa binding', () => {
  beforeAll(() => {
    mockServiceBindings(undefined, false);
  });

  afterEach(() => {
    registerDestinationCache.clear();
    unmockDestinationsEnv();
  });

  it('registers destination and retrieves it with JWT', async () => {
    registerDestination(testDestination, { jwt: providerServiceToken });
    const actual = await getDestination({
      destinationName: testDestination.name,
      jwt: providerServiceToken
    });
    expect(actual).toEqual(testDestination);
  });

  it('throws an error when no JWT is provided', async () => {
    expect(() =>
      registerDestination(testDestination)
    ).toThrowErrorMatchingSnapshot();
  });
});
