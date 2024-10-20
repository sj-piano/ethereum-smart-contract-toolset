// Decimals

export const ETH_DECIMAL_PLACES = 18;
export const GWEI_DECIMAL_PLACES = 9;
export const WEI_DECIMAL_PLACES = 0;

export const MATIC_DECIMAL_PLACES = 18;
export const USDC_DECIMAL_PLACES = 6;
export const WETH_DECIMAL_PLACES = 18;

export const USD_DECIMAL_PLACES = 2;


// Tokens

export const USDC_CONTRACT_ABI = [
  // ABI for USDC transfer event
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  // ABI for getting decimals of the token
  'function decimals() view returns (uint8)'
];

export const USDC_CONTRACT_ADDRESS = {
  local: 'notAvailable',
  testnet: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  mainnet: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  testnetPolygon: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582',
  mainnetPolygon: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'
}

export const WETH_CONTRACT_ADDRESS = {
  local: 'notAvailable',
  testnet: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
  mainnet: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  testnetPolygon: 'notKnown',
  mainnetPolygon: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
}


// Uniswap
export const USDC_WETH_POOL_0_05_ADDRESS = {
  mainnet: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
}


export default {

  ETH_DECIMAL_PLACES,
  GWEI_DECIMAL_PLACES,
  WEI_DECIMAL_PLACES,

  MATIC_DECIMAL_PLACES,
  USD_DECIMAL_PLACES,
  WETH_DECIMAL_PLACES,

  USDC_DECIMAL_PLACES,

  USDC_CONTRACT_ABI,

  USDC_CONTRACT_ADDRESS,
  WETH_CONTRACT_ADDRESS,

  USDC_WETH_POOL_0_05_ADDRESS,

}

