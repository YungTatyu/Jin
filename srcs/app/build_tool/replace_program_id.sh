#!/bin/bash

cargo build --manifest-path replace/Cargo.toml

./replace/target/debug/replace project/programs/project/src/lib.rs
./replace/target/debug/replace project/app/sample/test.js
./replace/target/debug/replace project/app/components/api.ts

cargo clean --manifest-path replace/Cargo.toml

rm anchor_id.txt
