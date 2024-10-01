#!/bin/bash

cargo build --manifest-path replace/Cargo.toml

./replace/target/debug/replace project/programs/project/src/lib.rs
./replace/target/debug/replace project/app/sample/test.js
./replace/target/debug/replace project/app/src/app/components/api.ts
./replace/target/debug/replace project/app/src/app/components/Home/Body/Seller/ClaimedRightsList.tsx
./replace/target/debug/replace project/app/src/app/components/Home/Body/Seller/ClaimsExpiredList.tsx
./replace/target/debug/replace project/app/src/app/components/Home/Body/Buyer/UnrecoverableList.tsx
./replace/target/debug/replace project/app/src/app/components/Home/Body/Buyer/ClaimsList.tsx

cargo clean --manifest-path replace/Cargo.toml

rm anchor_id.txt
