// Imports
import fs from 'fs';

// Local imports
import ethToolset from '#root/src/eth-toolset';

// Logging
const log2 = console.log;

// Read stdin
const pipedString = fs.readFileSync(process.stdin.fd).toString().trim();

// Parse arguments
const privateKey = pipedString;

// Run
const address = ethToolset.deriveAddressSync({ privateKey });
ethToolset.validateAddressSync({ address });
log2(address);
