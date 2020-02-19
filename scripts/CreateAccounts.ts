// Copyright 2020 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
import * as path from 'path';
import * as fs from 'fs';

import inquirer from 'inquirer';
import Web3 from 'web3';

interface AccountInfo {
  accountAddress: string;
  keyStorePath: string;
}

async function createEthereumAccount(): Promise<AccountInfo> {
  const answer = await inquirer.prompt([
    {
      type: 'password',
      name: 'password',
      message: 'Please provide a password to generate an ethereum account.',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      validate(input: string) {
        return input.length > 0;
      },
    },
    {
      type: 'path',
      name: 'path',
      default: __dirname,
      message: 'Please provide a path to store the key store file.',
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      validate(input: string) {
        return input.length > 0;
      },
    },
  ]);

  const web3 = new Web3(null);
  const ethereumAccount = web3.eth.accounts.create(web3.utils.randomHex(32));
  const encryptedAccount = ethereumAccount.encrypt(answer.password);
  const filePath = path.join(answer.path, '/', `${ethereumAccount.address}.json`);
  fs.writeFileSync(filePath, JSON.stringify(encryptedAccount, null, '    '));

  return { accountAddress: ethereumAccount.address, keyStorePath: filePath };
}

createEthereumAccount().then((accountInfo: AccountInfo): void => {
  console.log('\nKeys generated, you can use same password to unlock.\n');
  console.log(`Account address ${accountInfo.accountAddress}`);
  console.log(`Encrypted key store path: ${accountInfo.keyStorePath}\n`);
  process.exit(0);
});
