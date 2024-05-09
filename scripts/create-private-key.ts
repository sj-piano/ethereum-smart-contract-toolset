// Local imports
import ethToolset from '#root/src/eth-toolset';

// Logging
let log2 = console.log;

// Run
const privateKey = ethToolset.createPrivateKeySync();
ethToolset.validatePrivateKeySync({ privateKey });
log2(privateKey);
