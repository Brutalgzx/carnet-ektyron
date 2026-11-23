#!/bin/sh
# Construit atlas3d/atlas3d.js à partir de atlas3d/src (moteur 3D repris d'Atlas Fitness 3D).
# Dépendances (react, three, @react-three/*) prises dans ~/atlas-fitness-3d/node_modules.
# Usage : ESBUILD=/chemin/esbuild sh tools/build-atlas3d.sh
set -e
cd "$(dirname "$0")/.."
NODE_PATH="${ATLAS_NM:-$HOME/atlas-fitness-3d/node_modules}" "${ESBUILD:-esbuild}" atlas3d/src/entry.tsx \
  --bundle --minify --format=iife --target=safari15 --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --legal-comments=none \
  --outfile=atlas3d/atlas3d.js
