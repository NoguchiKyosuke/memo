#!/bin/bash
export LD_LIBRARY_PATH=$PWD/lib:$LD_LIBRARY_PATH
export TESSDATA_PREFIX=$PWD/tessdata

# Use the bundled loader if needed, or just run the binary
# ./bin/tesseract "$@"
# If that fails, try invoking via loader:
# ./lib/ld-linux-x86-64.so.2 --library-path ./lib ./bin/tesseract "$@"

# Simple attempt first:
./bin/tesseract "$@"
