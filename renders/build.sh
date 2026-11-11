#!/bin/sh
# Rend les deux moitiés puis assemble renders/hipt.mp4 (720x1280, 6 s, boucle)
# usage : sh renders/build.sh [dossier_images]
set -e
cd "$(dirname "$0")"
TMP="${1:-/tmp/hipt_frames}"
mkdir -p "$TMP"
if [ ! -f "$TMP/good_0144.png" ]; then
  blender -b -P hipt.py -- bad "$TMP"
  blender -b -P hipt.py -- good "$TMP"
fi
ffmpeg -y -loglevel error -framerate 24 -i "$TMP/bad_%04d.png" -framerate 24 -i "$TMP/good_%04d.png" \
  -filter_complex "[0][1]vstack,drawbox=x=0:y=638:w=iw:h=4:color=0x0b0f16:t=fill" \
  -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart -an hipt.mp4
ls -lh hipt.mp4
