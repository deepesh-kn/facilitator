import assert from 'assert';
import Web3 from 'web3';

import { interacts } from '@openst/mosaic-contracts';

import { AUXILIARY_GAS_PRICE, ORIGIN_GAS_PRICE } from '../Constants';
import Logger from '../Logger';
import Gateway from '../models/Gateway';
import Message from '../models/Message';
import GatewayRepository from '../repositories/GatewayRepository';
import { MessageStatus } from '../repositories/MessageRepository';
import Utils from '../Utils';

/**
 * It facilitates progress staking and minting.
 */
export default class ProgressService {
  private originWeb3: Web3;

  private auxiliaryWeb3: Web3;

  private gatewayAddress: string;

  private originWorkerAddress: string;

  private auxWorkerAddress: string;

  private gatewayRepository: GatewayRepository;

  /**
   * @param gatewayRepository Instance of GatewayRepository.
   * @param originWeb3 Origin chain web3 object.
   * @param auxiliaryWeb3 Auxiliary chain web3 object.
   * @param gatewayAddress Address of gateway contract.
   * @param originWorkerAddress Origin chain worker address.
   * @param auxWorkerAddress Auxiliary chain worker address.
   */
  public constructor(
    gatewayRepository: GatewayRepository,
    originWeb3: Web3,
    auxiliaryWeb3: Web3,
    gatewayAddress: string,
    originWorkerAddress: string,
    auxWorkerAddress: string,
  ) {
    this.gatewayRepository = gatewayRepository;
    this.originWeb3 = originWeb3;
    this.auxiliaryWeb3 = auxiliaryWeb3;
    this.gatewayAddress = gatewayAddress;
    this.originWorkerAddress = originWorkerAddress;
    this.auxWorkerAddress = auxWorkerAddress;
  }

  /**
   * This method react on changes in Message model.
   * @param messages List of Message models.
   */
  public async update(messages: Message[]): Promise<void> {
    Logger.debug('Progress service invoked');

    const progressPromises = messages
      .filter(message => message.isValidSecret())
      .map(async (message) => {
        Logger.debug(`Progressing message hash ${message.messageHash}`);
        if (message.sourceStatus === MessageStatus.Declared
        && message.targetStatus === MessageStatus.Declared
        ) {
          Logger.debug(`Performing progress stake and progress mint for message hash ${message.messageHash}`);
          return Promise.all([this.progressStake(message), this.progressMint(message)]);
        }

        if (message.sourceStatus === MessageStatus.Declared) {
          Logger.debug(`Performing progress stake for message hash ${message.messageHash}`);
          return this.progressStake(message);
        }

        if (message.targetStatus === MessageStatus.Declared) {
          Logger.debug(`Performing progress mint for message hash ${message.messageHash}`);
          return this.progressMint(message);
        }
        return Promise.resolve();
      });

    await Promise.all(progressPromises);
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressStake transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressStake(message: Message): Promise<string> {
    Logger.debug(`Sending progress stake transaction for message ${message.messageHash}`);
    const eip20Gateway = interacts.getEIP20Gateway(
      this.originWeb3,
      this.gatewayAddress,
    );
    const transactionOptions = {
      from: this.originWorkerAddress,
      gasPrice: ORIGIN_GAS_PRICE,
    };

    assert(message.hashLock !== undefined);

    const rawTx = eip20Gateway.methods.progressStake(
      message.messageHash,
      message.hashLock as string,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    ).then((txHash) => {
      Logger.debug(`Progress stake transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }

  /**
   * This is a private method which uses mosaic-contracts to make progressMint transaction.
   * @param message Message model object.
   * @returns Promise which resolves to transaction hash.
   */
  private async progressMint(message: Message): Promise<string> {
    Logger.debug(`Sending progress mint transaction for message ${message.messageHash}`);

    assert(message.gatewayAddress !== undefined);

    const gatewayRecord = await this.gatewayRepository.get(message.gatewayAddress as string);

    assert(gatewayRecord !== null);

    const eip20CoGateway = interacts.getEIP20CoGateway(
      this.auxiliaryWeb3,
      (gatewayRecord as Gateway).remoteGatewayAddress,
    );

    const transactionOptions = {
      from: this.auxWorkerAddress,
      gasPrice: AUXILIARY_GAS_PRICE,
    };

    const rawTx = eip20CoGateway.methods.progressMint(
      message.messageHash,
      message.hashLock as string,
    );

    return Utils.sendTransaction(
      rawTx,
      transactionOptions,
    ).then((txHash) => {
      Logger.debug(`Progress mint transaction hash ${txHash} for message ${message.messageHash}`);
      return txHash;
    });
  }
}
