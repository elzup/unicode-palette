#!/bin/bash

# GNU Unifont セットアップスクリプト
# BMP全体をカバーするフォントをダウンロード

FONT_DIR="./fonts"
FONT_FILE="$FONT_DIR/unifont.otf"
UNIFONT_VERSION="16.0.01"
UNIFONT_URL="https://unifoundry.com/pub/unifont/unifont-${UNIFONT_VERSION}/font-builds/unifont-${UNIFONT_VERSION}.otf"

echo "=== GNU Unifont Setup ==="
echo ""

# 既にフォントが存在する場合はスキップ
if [ -f "$FONT_FILE" ]; then
  echo "Font already exists: $FONT_FILE"
  echo "Setup complete!"
  exit 0
fi

# fonts ディレクトリ作成
mkdir -p "$FONT_DIR"

echo "Downloading GNU Unifont ${UNIFONT_VERSION}..."
echo "URL: $UNIFONT_URL"
echo ""

# ダウンロード
curl -L -o "$FONT_FILE" "$UNIFONT_URL"

# ダウンロード確認
if [ -f "$FONT_FILE" ] && [ $(stat -f%z "$FONT_FILE" 2>/dev/null || stat -c%s "$FONT_FILE" 2>/dev/null) -gt 1000000 ]; then
  echo ""
  echo "Download successful!"
  echo "Font saved to: $FONT_FILE"
  echo "Size: $(ls -lh "$FONT_FILE" | awk '{print $5}')"
  echo ""
  echo "Setup complete!"
else
  echo ""
  echo "Error: Download failed or file is too small."
  echo "Please try again or download manually from:"
  echo "  $UNIFONT_URL"
  rm -f "$FONT_FILE"
  exit 1
fi
