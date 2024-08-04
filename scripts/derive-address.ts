// Imports
import fs from 'fs';

// Local imports
import toolset from '#root/src/toolset';

// Logging
const log2 = console.log;

// Read stdin
const pipedString = fs.readFileSync(process.stdin.fd).toString().trim();

// Parse arguments
const privateKey = pipedString;

// Run
const address = toolset.deriveAddressSync({ privateKey });
toolset.validateAddressSync({ address });
log2(address);
