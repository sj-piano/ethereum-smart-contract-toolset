

declare global {


  type Transfer = {
    blockNumber: number
    txHash: string
    from: string
    to: string
    value: bigint
  }


}


export {};
