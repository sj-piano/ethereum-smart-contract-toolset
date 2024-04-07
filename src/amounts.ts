// Imports
import _ from "lodash";
import Big from "big.js";

// Local imports
import config from "#root/config";
import { createLogger } from "#root/lib/logging";
import utils, { jd } from "#lib/utils";
import validate from "#lib/validate";

// Controls
let logLevel = "error";
logLevel = "info";

// Logging
const { logger, log, deb } = createLogger({ logLevel });

// Constants
let weiPerEth = Big(10 ** 18);
let gweiPerEth = Big(10 ** 9);
let weiPerGwei = Big(10 ** 9);
let zeroWei = "0";
let zeroEth = "0." + "0".repeat(config.constants.ETH_DECIMAL_PLACES);

// Setup
let { ETH_DECIMAL_PLACES, GWEI_DECIMAL_PLACES, USD_DECIMAL_PLACES, WEI_DECIMAL_PLACES } = config.constants;

// Functions

function validateAmountWei({ amountWei }: { amountWei: string }): boolean {
  validate.numericString({
    name: "amountWei",
    value: amountWei,
  });
  return true;
}

function validateAmountEth({ amountEth }: { amountEth: string }): boolean {
  const nDP = amountEth.split(".").length - 1;
  if (nDP > 1) {
    throw new Error(`Too many decimal places in amountEth: ${amountEth}`);
  }
  validate.numericString({
    name: "amountEth",
    value: amountEth,
  });
  return true;
}

function weiToEth({ amountWei }: { amountWei: string }) {
  validateAmountWei({ amountWei });
  const amountEth = Big(amountWei).div(weiPerEth).toFixed(ETH_DECIMAL_PLACES);
  return amountEth;
}

function ethToWei({ amountEth }: { amountEth: string }) {
  validateAmountEth({ amountEth });
  const amountWei = Big(amountEth).times(weiPerEth).toFixed(WEI_DECIMAL_PLACES);
  return amountWei;
}

function multiplyAmountWei({
  amountWei,
  multiplier,
}: {
  amountWei: string;
  multiplier: string | number | bigint;
}) {
  const m = String(multiplier);
  validateAmountWei({ amountWei });
  validate.string({ name: "multiplier", value: m });
  const amountWei2 = Big(amountWei).times(Big(m)).toFixed(WEI_DECIMAL_PLACES);
  return amountWei2;
}

function multiplyAmountEth({
  amountEth,
  multiplier,
}: {
  amountEth: string;
  multiplier: string | number | bigint;
}) {
  const m = String(multiplier);
  validateAmountEth({ amountEth });
  validate.string({ name: "multiplier", value: m });
  const amountEth2 = Big(amountEth).times(Big(m)).toFixed(ETH_DECIMAL_PLACES);
  return amountEth2;
}

function addAmountsEth(amounts: string[]): string {
  if (amounts.length < 2) {
    throw new Error("At least two amounts are required.");
  }
  let totalWeiBig = Big(0);
  for (let amount of amounts) {
    let amountWei2 = ethToWei({ amountEth: amount });
    totalWeiBig = totalWeiBig.plus(Big(amountWei2));
  }
  let totalWei = totalWeiBig.toFixed(WEI_DECIMAL_PLACES);
  let amountEth = weiToEth({ amountWei: totalWei });
  return amountEth;
}

// We take the first amount and subtract the rest from it.
function subtractAmountsEth(amounts: string[]): string {
  if (amounts.length < 2) {
    throw new Error("At least two amounts are required.");
  }
  let amountEth = amounts[0];
  let amountWei = ethToWei({ amountEth });
  let amountWeiBig = Big(amountWei);
  let amountsToSubtract = amounts.slice(1);
  for (let amount of amountsToSubtract) {
    let amountWei2 = ethToWei({ amountEth: amount });
    amountWeiBig = amountWeiBig.minus(Big(amountWei2));
  }
  let finalWei = amountWeiBig.toFixed(WEI_DECIMAL_PLACES);
  let finalEth = weiToEth({ amountWei: finalWei });
  return finalEth;
}

export default {
  zeroWei,
  zeroEth,
  validateAmountWei,
  validateAmountEth,
  weiToEth,
  ethToWei,
  multiplyAmountWei,
  multiplyAmountEth,
  addAmountsEth,
  subtractAmountsEth,
};
