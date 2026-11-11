#!/bin/sh
# Rend chaque exercice (deux moitiés en parallèle) puis assemble renders/<exo>.mp4
# usage : sh renders/build_all.sh <dossier_tmp> exo1 exo2 ...
cd "$(dirname "$0")"
T="$1"; shift
for e in "$@"; do
  D="$T/$e"; mkdir -p "$D"
  s=$(date +%s)
  blender -b -P gen.py -- "$e" bad "$D" >/dev/null 2>"$D/bad.err" &
  blender -b -P gen.py -- "$e" good "$D" >/dev/null 2>"$D/good.err"
  wait
  if [ -f "$D/good_0144.png" ] && [ -f "$D/bad_0144.png" ]; then
    ffmpeg -y -loglevel error -framerate 24 -i "$D/bad_%04d.png" -framerate 24 -i "$D/good_%04d.png" \
      -filter_complex "[0][1]vstack,drawbox=x=0:y=638:w=iw:h=4:color=0x0b0f16:t=fill" \
      -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an "$e.mp4" \
      && rm -f "$D"/*.png
    echo "$e $(($(date +%s)-s))s $(wc -c < "$e.mp4") octets"
  else
    echo "$e ECHEC"
  fi
done
