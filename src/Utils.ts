import fs from 'fs-extra';

const Utils = {
  /**
   * Get config json data from the given file path.
   * @param filePath Config file path.
   * @returns JSON data from config file.
   */
  getJsonDataFromPath(filePath: string): Record<string, any> {
    if (fs.existsSync(filePath)) {
      const config = fs.readFileSync(filePath).toString();
      if (config && config.length > 0) {
        return JSON.parse(config);
      }
      throw new Error('Empty file.');
    }
    throw new Error('File not found.');
  },

  /**
   * This method submits a raw transaction and returns transaction hash.
   * @param tx Raw transaction.
   * @param txOption Transaction options.
   */
  async sendTransaction(tx: any, txOption: any): Promise<string> {
    return new Promise(async (onResolve, onReject): Promise<void> => {
      const txOptions = Object.assign({}, txOption);
      if (txOptions.gas === undefined) {
        txOptions.gas = await tx.estimateGas(txOptions);
      }

      tx.send(txOptions)
        .on('transactionHash', (hash: string): void => onResolve(hash))
        .on('error', (error: Error): void => onReject(error));
    });
  },

  getDefinedOwnProps(obj: {}): string[] {
    const nonUndefinedOwnedProps: string[] = [];
    Object.entries(obj).forEach(
      ([key, value]): void => {
        if (value !== undefined) {
          nonUndefinedOwnedProps.push(key);
        }
      },
    );
    return nonUndefinedOwnedProps;
  },
};

export default Utils;
