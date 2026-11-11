# Assemble les lignes de la planche par groupes de 4 : python3 tile.py <dossier> exo...
import subprocess, sys
d, ex = sys.argv[1], sys.argv[2:]
for i in range(0, len(ex), 4):
    g = ex[i:i + 4]
    args = sum([["-i", f"{d}/row_{e}.png"] for e in g], [])
    f = f"vstack={len(g)}" if len(g) > 1 else "null"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args, "-filter_complex", f, "-q:v", "4", f"{d}/sheet{i // 4}.jpg"], check=True)
