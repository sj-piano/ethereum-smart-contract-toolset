/*

HOW TO RUN THIS SCRIPT

cat user-data/example-private-key.txt | pnpm ts-node scripts/derive-address.ts

*/

// Imports
import fs from 'fs';


// Local imports
import utils from '#root/utils';
import toolsetFactory from '#root/src/ToolsetFactory';


// Components
const { misc } = utils;


// Console.log
const log2 = console.log;
const jd2 = function (foo) { return JSON.stringify(foo, null, 2) }
const lj2 = function (foo) { log2(jd2(foo)); }


// Run


mainAsync().catch((error) => {
  misc.stop(error)
});


async function mainAsync() {
  let toolset = await toolsetFactory.createToolsetAsync({ networkLabel: 'local', logLevel: 'debug' });

  // Read private key from stdin
  const pipedString = fs.readFileSync(process.stdin.fd).toString().trim();
  const privateKey = pipedString;

  const address = toolset.deriveAddress({ privateKey });
  toolset.validateAddress({ address });
  log2(address);
}

