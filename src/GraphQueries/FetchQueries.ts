const FetchQueries: Record<string, string> = {
  stakeRequesteds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stakeRequesteds(skip: $skip, first:$limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    amount\n'
  + '    gasPrice\n'
  + '    gasLimit\n'
  + '    staker\n'
  + '    gateway\n'
  + '    stakeRequestHash\n'
  + '    nonce\n'
  + '    beneficiary\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeIntentDeclareds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stakeIntentDeclareds(skip: $skip, first:$limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _amount\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stateRootAvailables: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stateRootAvailables(skip: $skip, first:$limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _blockHeight\n'
  + '    _stateRoot\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  gatewayProvens: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'gatewayProvens(skip: $skip, first: $limit, order: blockNumber, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _gateway\n'
  + '    _blockHeight\n'
  + '    _storageRoot\n'
  + '    _wasAlreadyProved\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeIntentConfirmeds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stakeIntentConfirmeds(skip: $skip, first: $limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _beneficiary\n'
  + '    _amount\n'
  + '    _blockHeight\n'
  + '    _hashLock\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  stakeProgresseds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'stakeProgresseds(skip: $skip, first: $limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _stakerNonce\n'
  + '    _amount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

  mintProgresseds: 'query ($contractAddress: String!, $uts: BigInt!, $skip: BigInt!, $limit:'
  + ' BigInt!) {\n'
  + 'mintProgresseds(skip: $skip, first: $limit, order: uts, orderDirection: asc, where:'
  + ' {contractAddress:'
  + ' $contractAddress, uts_gt: $uts}, '
  + '    orderDirection: asc,'
  + '    limit: 100) {\n'
  + '    id\n'
  + '    _messageHash\n'
  + '    _staker\n'
  + '    _beneficiary\n'
  + '    _stakeAmount\n'
  + '    _mintedAmount\n'
  + '    _rewardAmount\n'
  + '    _proofProgress\n'
  + '    _unlockSecret\n'
  + '    contractAddress\n'
  + '    blockNumber\n'
  + '    uts\n'
  + '  }\n'
  + '}',

};

export default FetchQueries;
