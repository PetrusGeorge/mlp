#! /bin/bash

rm target/release/main
cargo build --release
cp target/release/main .
