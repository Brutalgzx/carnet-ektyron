#!/bin/sh
# Planche de contrôle : pour chaque exercice, BON départ | BON fin | MAUVAIS fin
# usage : sh renders/sheet.sh <dossier> exo1 exo2 ...
cd "$(dirname "$0")"
D="$1"; shift
mkdir -p "$D"
for e in "$@"; do
  F=60; grep -A1 "EXOS\[\"$e\"\]" exos.py | grep -q 'cycle="alt"' && F=36
  blender -b -P gen.py -- "$e" good "$D" 1,$F >/dev/null 2>"$D/$e.err" &
  blender -b -P gen.py -- "$e" bad "$D" $F >/dev/null 2>>"$D/$e.err"
  wait
  ffmpeg -y -loglevel error -i "$D/${e}_good_0001.png" -i "$D/${e}_good_00$F.png" -i "$D/${e}_bad_00$F.png" \
    -filter_complex "[0][1][2]hstack=3,scale=900:-1" "$D/row_$e.png" || echo "ECHEC $e"
done
