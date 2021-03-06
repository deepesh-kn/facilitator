
import BigNumber from 'bignumber.js';
import sinon from 'sinon';

import AnchorHandler from '../../../src/handlers/AnchorHandler';
import AuxiliaryChainRepository from '../../../src/repositories/AuxiliaryChainRepository';
import assert from '../../test_utils/assert';
import SpyAssert from '../../test_utils/SpyAssert';
import StubData from '../../test_utils/StubData';

describe('AnchorHandler.persist()', () => {
  const auxiliaryChainId = 123;
  const anchorAddress = '0x0000000000000000000000000000000000000003';
  const someOtherAnchor = '0x0000000000000000000000000000000000000004';
  const blockHeight = new BigNumber(10);
  const transactions = [{
    contractAddress: someOtherAnchor,
    _blockHeight: blockHeight.toString(10),
  }];

  it('should save latest block height of interested anchor', async () => {
    const save = sinon.stub();
    const transactionsWithInterestedAnchor = [{
      contractAddress: anchorAddress,
      _blockHeight: blockHeight.toString(10),
    }];

    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.sub(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactionsWithInterestedAnchor);

    const expectedModel = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight,
    );
    assert.equal(models.length, transactionsWithInterestedAnchor.length, 'Number of models must be equal to transactions');
    assert.deepStrictEqual(models[0], expectedModel);
    SpyAssert.assert(save, 1, [[expectedModel]]);
  });

  it('should not save latest block height for non interested anchor', async () => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.sub(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, 0, 'Number of saved models must be equal to zero');
    SpyAssert.assert(save, 0, [[]]);
  });

  it('should not save latest block height for interested anchor with lower block height', async () => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight.plus(1),
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, 0, 'Number of saved models must be equal to zero');
    SpyAssert.assert(save, 0, [[]]);
  });

  it('should not save latest block height for interested anchor with equal block height', async () => {
    const save = sinon.stub();
    const auxiliaryChainRecord = StubData.getAuxiliaryChainRecord(
      anchorAddress,
      blockHeight,
    );
    const sinonMock = sinon.createStubInstance(AuxiliaryChainRepository,
      {
        save: save as any,
        get: Promise.resolve(auxiliaryChainRecord),
      });
    const handler = new AnchorHandler(sinonMock as any, auxiliaryChainId);

    const models = await handler.persist(transactions);

    assert.equal(models.length, 0, 'Number of saved models must be equal to zero');
    SpyAssert.assert(save, 0, [[]]);
  });
});
