// Local imports
import toolset from '#root/src/toolset';

// Logging
let log2 = console.log;

// Run
const privateKey = toolset.createPrivateKey();
toolset.validatePrivateKey({ privateKey });
log2(privateKey);
