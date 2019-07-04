import * as path from 'path';
import * as fs from 'fs-extra';
const Web3 = require('web3');
import { EncryptedKeystoreV3Json } from 'web3-eth-accounts';
import { Validator as JsonSchemaVerifier } from 'jsonschema';
import MosaicConfig from './MosaicConfig';
import Directory from './Directory';
import InvalidFacilitatorConfigException, { WorkerPasswordNotFoundException } from './Exception';
import * as schema from './Config/FacilitatorConfig.schema.json';
import Utils from './Utils';
import Account from './Account';

// Database password key to read from env.
const ENV_DB_PASSWORD = 'MOSAIC_FACILITATOR_DB_PASSWORD';
export const ENV_WORKER_PASSWORD_PREFIX = 'MOSAIC_ADDRESS_PASSW_';

// Database type
enum DBType {
  SQLITE = 'SQLITE',
}

// Facilitator config file name.
const MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

/**
 * Holds database configurations.
 */
export class DBConfig {
  public type?: DBType;

  /** Database path */
  public path?: string;

  /** Database host */
  public host?: string;

  /** Database user name */
  public userName?: string;

  /** Database password */
  private _password?: string;

  /**
   * Get the password for the database.
   */
  get password(): string | undefined {
    return process.env[ENV_DB_PASSWORD] || this._password;
  }
}

/**
 * Holds chain data
 */
export class Chain {
  /** Chain RPC endpoint. */
  public readonly rpc: string;

  /** Worker address. */
  public readonly worker: string;

  /** Worker password. */
  private readonly _password?: string;

  public constructor(
    rpc: string,
    worker: string,
    password?: string,
  ) {
    this.rpc = rpc;
    this.worker = worker;
    this._password = password;
  }

  /**
   * Get the password for unlocking worker.
   */
  get password(): string | undefined {
    return process.env[`${ENV_WORKER_PASSWORD_PREFIX}${this.worker}`] || this._password;
  }
}

/**
 * It holds contents of the facilitator config.
 */
export class FacilitatorConfig {
  public originChainId: string;

  public auxiliaryChainId: string;

  public database: DBConfig;

  public chains: Record<string, Chain>;

  public encryptedAccounts: Record<string, EncryptedKeystoreV3Json>;

  /**
   * Constructor.
   * @param config Facilitator config object.
   */
  private constructor(config: any) {
    this.originChainId = config.originChainId || '';
    this.auxiliaryChainId = '';
    this.database = config.database || new DBConfig();
    this.chains = {};
    this.encryptedAccounts = config.encryptedAccounts || {};
    this.assignDerivedParams = this.assignDerivedParams.bind(this);
    this.assignDerivedParams(config);
  }

  /**
   * Assigns derived parameters.
   * @param config
   */
  private assignDerivedParams(config: any) {
    const chains = config.chains || {};
    Object.keys(chains).forEach(async (identifier, _) => {
      this.chains[identifier] = new Chain(
        chains[identifier].rpc,
        chains[identifier].worker,
      );
      // we have only 2 chains in config
      if (identifier !== this.originChainId) {
        this.auxiliaryChainId = identifier;
      }
    })
  }

  /**
   * It writes facilitator config object.
   * @param {string} chain Auxiliary chain id.
   */
  public writeToFacilitatorConfig(chain: string): void {
    const mosaicConfigDir = Directory.getMosaicDirectoryPath();
    const configPath = path.join(
      mosaicConfigDir,
      chain,
    );
    fs.ensureDirSync(configPath);

    fs.writeFileSync(
      path.join(configPath, MOSAIC_FACILITATOR_CONFIG),
      JSON.stringify(this, null, '    '),
    );
  }

  /**
   * This reads facilitator config from the json file and creates FacilitatorConfig object.
   * @param {string} chain Auxiliary chain id.
   * @returns {FacilitatorConfig} Facilitator config object.
   */
  public static from(chain: string): FacilitatorConfig {
    const facilitatorConfigPath = path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      MOSAIC_FACILITATOR_CONFIG,
    );

    if (fs.existsSync(facilitatorConfigPath)) {
      const config = Utils.getJsonDataFromPath(facilitatorConfigPath);
      FacilitatorConfig.verifySchema(config);
      return new FacilitatorConfig(config);
    }
    return new FacilitatorConfig({});
  }

  /**
   * It provides facilitator config object if facilitator config file is present at the path.
   * @param {string} filePath Path to facilitator config file.
   * @returns {FacilitatorConfig}
   */
  public static fromPath(filePath: string): FacilitatorConfig {
    if (fs.existsSync(filePath)) {
      const config = Utils.getJsonDataFromPath(filePath);
      return new FacilitatorConfig(config);
    }
    return new FacilitatorConfig({});
  }

  /**
   * This method verifies json object against facilitator config schema and throws
   * an exception on failure.
   * @param jsonObject JSON object to be validated against schema.
   */
  public static verifySchema(jsonObject: any): void {
    const jsonSchemaVerifier = new JsonSchemaVerifier();
    try {
      jsonSchemaVerifier.validate(jsonObject, schema, { throwError: true });
    } catch (error) {
      throw new InvalidFacilitatorConfigException(error.message);
    }
  }

  /**
   * It checks if facilitator config is present for given chain id.
   * @param {string} chain Auxiliary chain id.
   * @returns `true` if file is present.
   */
  public static isFacilitatorConfigPresent(chain: string): boolean {
    const statOutput = fs.statSync(
      path.join(Directory.getMosaicDirectoryPath(), chain, MOSAIC_FACILITATOR_CONFIG),
    );
    return (statOutput.size > 0);
  }
}

/**
 * Holds mosaic config, database config and facilitator config.
 */
export class Config {
  public facilitator: FacilitatorConfig;

  public mosaic: MosaicConfig;

  private _originWeb3?: any;

  private _auxiliaryWeb3?: any;

  /**
   * Constructor.
   * @param mosaicConfig Mosaic config object.
   * @param facilitatorConfig Facilitator config object.
   */
  public constructor(
    mosaicConfig: MosaicConfig,
    facilitatorConfig: FacilitatorConfig,
  ) {
    this.facilitator = facilitatorConfig;
    this.mosaic = mosaicConfig;
  }

  /**
   * Returns web3 provider for origin chain.
   */
  public get originWeb3(): any {
    if (this._originWeb3) {
      return this._originWeb3;
    }
    const originChain = this.facilitator.chains[this.facilitator.originChainId];
    this._originWeb3 = this.createWeb3Instance(originChain);
    return this._originWeb3;
  }

  /**
   * Returns web3 provider for auxiliary chain.
   */
  public get auxiliaryWeb3(): any {
    if (this._auxiliaryWeb3) {
      return this._auxiliaryWeb3;
    }
    const auxiliaryChain = this.facilitator.chains[this.facilitator.auxiliaryChainId];
    this._auxiliaryWeb3 = this.createWeb3Instance(auxiliaryChain);
    return this._auxiliaryWeb3;
  }

  /**
   * Create web3 instance.
   * @param chain : chain object for which web3 instance needs to be created
   */
  public createWeb3Instance(chain: Chain) {
    if (!chain.password) {
      throw new WorkerPasswordNotFoundException(`password not found for ${chain.worker}`);
    }
    const account = new Account(chain.worker, this.facilitator.encryptedAccounts[chain.rpc]);
    const web3 = new Web3(chain.rpc);
    account.unlock(web3, chain.password);
    return web3;
  }

  /**
   * It provides config object from the path specified.
   * @param {string} mosaicConfigPath Path to mosaic config file path.
   * @param {string} facilitatorConfigPath Path to facilitator config file path/
   * @returns {Config} Config object consisting of mosaic and facilitator configurations.
   */
  public static getConfigFromPath(
    mosaicConfigPath: string,
    facilitatorConfigPath: string,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromFile(mosaicConfigPath);
    const facilitator: FacilitatorConfig = FacilitatorConfig.fromPath(facilitatorConfigPath);

    return new Config(mosaic, facilitator);
  }

  /**
   * It provides config object from default paths.
   * @param {string} originChain Origin chain identifier (ex. ropsten).
   * @param {string} auxiliaryChain Auxiliary chain id.
   * @returns {Config} Config object consisting of mosaic and facilitator configurations.
   */
  public static getConfig(
    originChain: string,
    auxiliaryChain: string,
  ): Config {
    const mosaic: MosaicConfig = MosaicConfig.fromChain(originChain);
    const facilitator: FacilitatorConfig = FacilitatorConfig.from(auxiliaryChain);
    return new Config(mosaic, facilitator);
  }
}
