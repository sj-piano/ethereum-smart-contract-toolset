// Local imports
import toolset from '#root/src/toolset';

// Logging
let log2 = console.log;

// Run
const privateKey = toolset.createPrivateKeySync();
toolset.validatePrivateKeySync({ privateKey });
log2(privateKey);
