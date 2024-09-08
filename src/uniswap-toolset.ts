/*
Uniswap v3
*/


// Imports
import { ethers } from 'ethers';


// Uniswap imports
import {
  AddLiquidityOptions,
  CollectOptions,
  MintOptions,
  nearestUsableTick,
  NonfungiblePositionManager,
  Pool,
  Position,
  RemoveLiquidityOptions,
} from '@uniswap/v3-sdk';


// Local imports
import config from '#root/config';


// Import interfaces
import { IUniswapV3Pool } from "#typechain-types/index";


// Import ABIs
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';


interface PoolInfo {
  token0: string
  token1: string
  fee: number
  tickSpacing: number
  sqrtPriceX96: string
  liquidity: string
  tick: number
}


class UniswapToolset {


  parent: any


  constructor() {
    this.parent = null;
  }


  poolAddressToContract({poolAddress}: {poolAddress: string}): IUniswapV3Pool {
    const contract = new ethers.Contract(poolAddress, IUniswapV3PoolABI.abi, this.parent.provider);
    return contract as unknown as IUniswapV3Pool;
  }


  async getPoolInfo({ poolContract }: { poolContract: IUniswapV3Pool }): Promise<PoolInfo> {
    const [fee, tickSpacing,liquidity, slot0] = await Promise.all([
      poolContract.fee(),
      poolContract.tickSpacing(),
      poolContract.liquidity(),
      poolContract.slot0(),
    ]);
    const sqrtPriceX96 = slot0.sqrtPriceX96;
    const tickCurrent = slot0.tick;

    return {
      token0: this.parent.addresses.USDC_CONTRACT_ADDRESS,
      token1: this.parent.addresses.WETH_CONTRACT_ADDRESS,
      fee: Number(fee),
      tickSpacing: Number(tickSpacing),
      sqrtPriceX96: sqrtPriceX96.toString(),
      liquidity: liquidity.toString(),
      tick: Number(tickCurrent),
    };
  }


}


// Exports
export {
  UniswapToolset,
}
export default new UniswapToolset();

