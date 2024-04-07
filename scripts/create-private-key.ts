// Local imports
import ethereum from "#root/src/eth-toolset";

// Logging
let log2 = console.log;

// Run
const privateKey = ethereum.createPrivateKeySync();
ethereum.validatePrivateKeySync({ privateKey });
log2(privateKey);
