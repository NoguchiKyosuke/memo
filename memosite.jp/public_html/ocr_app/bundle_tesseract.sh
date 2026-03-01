#!/bin/bash

# Bundle Tesseract and dependencies for portable usage

APP_DIR="/home/nk21137/OneDrive/memo/memosite.jp/public_html/ocr_app"
BIN_DIR="$APP_DIR/bin"
LIB_DIR="$APP_DIR/lib"
TESSDATA_DIR="$APP_DIR/tessdata"

mkdir -p "$BIN_DIR"
mkdir -p "$LIB_DIR"
mkdir -p "$TESSDATA_DIR"

# Copy binary
cp /usr/bin/tesseract "$BIN_DIR/"

# Copy dependencies
# Get list of libs, filter out linux-vdso, and copy them
ldd /usr/bin/tesseract | grep "=> /" | awk '{print $3}' | xargs -I '{}' cp -v '{}' "$LIB_DIR/"

# Copy ld-linux (loader) if needed, but usually we use the system one if compatible.
# Let's copy it just in case we need to invoke it directly, though usually not needed for same-OS.
# ldd output line: /lib64/ld-linux-x86-64.so.2 (0x...)
ldd /usr/bin/tesseract | grep "/lib64/ld-linux" | awk '{print $1}' | xargs -I '{}' cp -v '{}' "$LIB_DIR/"

# Create wrapper script
cat <<EOF > "$APP_DIR/tesseract_wrapper.sh"
#!/bin/bash
export LD_LIBRARY_PATH=\$PWD/lib:\$LD_LIBRARY_PATH
export TESSDATA_PREFIX=\$PWD/tessdata

# Use the bundled loader if needed, or just run the binary
# ./bin/tesseract "\$@"
# If that fails, try invoking via loader:
# ./lib/ld-linux-x86-64.so.2 --library-path ./lib ./bin/tesseract "\$@"

# Simple attempt first:
./bin/tesseract "\$@"
EOF

chmod +x "$APP_DIR/tesseract_wrapper.sh"
chmod -R 755 "$APP_DIR"

echo "Bundling complete."
