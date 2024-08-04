export const ETH_DECIMAL_PLACES = 18;
export const GWEI_DECIMAL_PLACES = 9;
export const MATIC_DECIMAL_PLACES = 18;
export const USD_DECIMAL_PLACES = 2;
export const WEI_DECIMAL_PLACES = 0;

export const USDC_DECIMAL_PLACES = 6;

export const USDC_CONTRACT_ABI = [
  // ABI for USDC transfer event
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  // ABI for getting decimals of the token
  'function decimals() view returns (uint8)'
];

export const USDC_CONTRACT_ADDRESS_MAINNET = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
export const USDC_CONTRACT_ADDRESS_MAINNET_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';


export default {

  ETH_DECIMAL_PLACES,
  GWEI_DECIMAL_PLACES,
  MATIC_DECIMAL_PLACES,
  USD_DECIMAL_PLACES,
  WEI_DECIMAL_PLACES,

  USDC_DECIMAL_PLACES,

  USDC_CONTRACT_ABI,

  USDC_CONTRACT_ADDRESS_MAINNET,
  USDC_CONTRACT_ADDRESS_MAINNET_POLYGON,

}