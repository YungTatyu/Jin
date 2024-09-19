#!/bin/bash



rustc replace.rs
./replace ${BACKEND_ROOT}/lib.rs
# ./replace ${FRONTEND_ROOT} 

rm replace
rm anchor_id.txt