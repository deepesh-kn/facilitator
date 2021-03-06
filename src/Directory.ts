import os from 'os';
import path from 'path';

const MOSAIC_CONFIG_FILE = 'mosaic.json';
/**
 * Directory provides operations on strings representing directories.
 */
export default class Directory {
  // Facilitator config file name.
  public static MOSAIC_FACILITATOR_CONFIG = 'facilitator-config.json';

  /**
   * Provides path to mosaic directory
   * @returns {string} It returns mosaic directory path.
   */
  public static getMosaicDirectoryPath(): string {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * It returns default db file path.
   * @param chain Chain id of the aux chain.
   * @returns {string} It returns file path where db is present.
   */
  public static getDBFilePath(chain: string): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      'facilitator',
    );
  }

  /**
   * @returns The absolute path to the directory in which we store mosaic data.
   */
  public static get getDefaultMosaicDataDir(): string {
    return path.join(
      os.homedir(),
      '.mosaic',
    );
  }

  /**
   * This returns default facilitator config path
   * @param chain Chain Identifier.
   */
  public static getFacilitatorConfigPath(chain: string): string {
    return path.join(
      Directory.getMosaicDirectoryPath(),
      chain,
      Directory.MOSAIC_FACILITATOR_CONFIG,
    );
  }

  /**
   * Returns the mosaic json file name.
   */
  public static getMosaicFileName(): string {
    return MOSAIC_CONFIG_FILE;
  }


}
