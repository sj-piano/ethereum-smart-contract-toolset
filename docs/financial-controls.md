### <a name="financial-controls"></a> Explanation of financial controls

The settings in the `user-config.env` file under the top section `FINANCIAL CONTROLS` impose strict limits on the maximum cost of a transaction.

Example settings:
```
MAX_FEE_PER_TRANSACTION_USD = "60.00"
MAX_FEE_PER_GAS_GWEI = "50"
MAX_PRIORITY_FEE_PER_GAS_GWEI = "5"
```

You can change the settings by editing the file.

Explanations:

`MAX_FEE_PER_TRANSACTION_USD`

* This is the maximum fee in USD permitted for a transaction.
* The ETH/USD exchange rate is fetched from Coinbase's ticker API. The script estimates the gas cost in gwei and converts it to USD using this rate.
* The estimated fee for each position deployment transaction is checked against this value prior to deployment. If any transaction is too expensive, the entire deployment is aborted. This check occurs within the deployment script.

`MAX_FEE_PER_GAS_GWEI`

* This is the maximum fee per gas in gwei permitted for a transaction.
* This value is specified within the transaction itself.
* Ethereum validators will not process the transaction if this value is too low relative to the current network average fee.

`MAX_PRIORITY_FEE_PER_GAS_GWEI`

* The priority fee allows you to tip block validators so that they are incentivized to include your transaction in the upcoming block.
* This value is specified within the transaction itself.
* Normally a transaction will pay the base network fee per gas. If this value is > 0, then the transaction will pay `gas fee = gas limit * (base fee + priority fee)`.
* The priority fee does _not_ allow a transaction to pay more than MAX_FEE_PER_GAS_GWEI. Instead, the priority fee will be reduced down until the max fee is reached.

Note: The priority fee is paid to the validator. The base fee is burned.

Examples:

If MAX_FEE_PER_GAS_GWEI is set to 10 and MAX_PRIORITY_FEE_PER_GAS_GWEI to 4, and the current network base fee is 2, then the transaction will pay a fee of 2 + 4 = 6.

If MAX_FEE_PER_GAS_GWEI is set to 10 and MAX_PRIORITY_FEE_PER_GAS_GWEI to 4, and the current network base fee is 8, then the transaction will pay a fee of 8 + 2 = 10.

The base fee is the starting point, and the priority fee is added, but cannot cause the transaction fee to exceed the max permitted fee.
