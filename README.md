# Jin - 仁
Jin is an infrastructure refund service that ensures secure and automated refund processing through smart contracts.

## How it works
1. After buyers make a payment, the funds are securely held in escrow by a smart contract.
2. Buyers can receive a refund during the guarantee period agreed upon by both the buyer and seller.
3. The seller can collect the payment after the refund period ends.
4. The entire process is managed by smart contracts, eliminating the need for third-party involvement.

## Smart contract
* [lib.rs](https://github.com/YungTatyu/Jin/blob/main/srcs/app/backend/project/src/lib.rs) - Main logic is implemented.
* [state.rs](https://github.com/YungTatyu/Jin/blob/main/srcs/app/backend/project/src/state.rs) - Defines an escrow account that allows for refund processing.
* [errors.rs](https://github.com/YungTatyu/Jin/blob/main/srcs/app/backend/project/src/errors.rs) - Custom program errors.
* [utils.rs](https://github.com/YungTatyu/Jin/blob/main/srcs/app/backend/project/src/utils.rs) - Defines a set of utility functions for executing payment transactions.
* [refundable_escrow_test.ts](https://github.com/YungTatyu/Jin/blob/main/srcs/app/backend/tests/refundable_escrow_test.ts) - The test program executed by `anchor test`.

## Tests
To run the tests, the `docker compose` command must be installed, and the CPU architecture must be x86_64.
```
make test-anchor
```
