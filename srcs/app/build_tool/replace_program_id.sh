#!/bin/bash

rustc replace.rs
./replace project/programs/project/src/lib.rs
./replace project/app/sample/test.js

rm replace
rm anchor_id.txt