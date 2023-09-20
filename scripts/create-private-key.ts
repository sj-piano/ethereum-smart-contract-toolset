// Local imports
import ethereum from "#root/src/ethereum";

// Logging
let log2 = console.log;

// Run
const privateKey = ethereum.createPrivateKeySync();
ethereum.validatePrivateKeySync({ privateKey });
log2(privateKey);
