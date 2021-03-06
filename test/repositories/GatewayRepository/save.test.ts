import BigNumber from 'bignumber.js';

import Gateway from '../../../src/models/Gateway';
import { GatewayType } from '../../../src/repositories/GatewayRepository';
import Repositories from '../../../src/repositories/Repositories';
import Util from './util';

interface TestConfigInterface {
  repos: Repositories;
}

let config: TestConfigInterface;

describe('GatewayRepository::save', (): void => {
  let gatewayAddress: string;
  let chain: string;
  let gatewayType: string;
  let remoteGatewayAddress: string;
  let tokenAddress: string;
  let anchorAddress: string;
  let bounty: BigNumber;
  let activation: boolean;
  let lastRemoteGatewayProvenBlockHeight: BigNumber;
  let createdAt: Date;
  let updatedAt: Date;

  beforeEach(async (): Promise<void> => {
    config = {
      repos: await Repositories.create(),
    };
    gatewayAddress = '0x0000000000000000000000000000000000000001';
    chain = '1';
    gatewayType = GatewayType.Auxiliary;
    remoteGatewayAddress = '0x0000000000000000000000000000000000000002';
    tokenAddress = '0x0000000000000000000000000000000000000003';
    anchorAddress = '0x0000000000000000000000000000000000000004';
    bounty = new BigNumber(100);
    activation = true;
    lastRemoteGatewayProvenBlockHeight = new BigNumber(1000);
    createdAt = new Date();
    updatedAt = new Date();
  });

  it('should pass when creating Gateway model.', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      remoteGatewayAddress,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );
    const createdGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(createdGateway, gateway);
  });

  it('should pass when updating Gateway model', async (): Promise<void> => {
    const gateway = new Gateway(
      gatewayAddress,
      chain,
      gatewayType,
      remoteGatewayAddress,
      tokenAddress,
      anchorAddress,
      bounty,
      activation,
      lastRemoteGatewayProvenBlockHeight,
      createdAt,
      updatedAt,
    );

    await config.repos.gatewayRepository.save(
      gateway,
    );

    gateway.lastRemoteGatewayProvenBlockHeight = new BigNumber(1001);

    const updatedGateway = await config.repos.gatewayRepository.save(
      gateway,
    );

    Util.assertGatewayAttributes(updatedGateway, gateway);
  });
});
