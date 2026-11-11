# Met à jour la liste VIDS de data.js d'après les renders/*.mp4 présents (+ alias de exos.ALIAS)
import glob, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import exos
here = os.path.dirname(os.path.abspath(__file__))
ids = sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(here, "*.mp4")))
alias = {k: v for k, v in exos.ALIAS.items() if v in ids}
p = os.path.join(here, "..", "data.js")
s = open(p).read()
s = re.sub(r"const VIDS=new Set\(\[.*?\]\);(\nconst VALIAS=\{.*?\};)?",
           "const VIDS=new Set([" + ",".join(f'"{i}"' for i in ids) + "]);\nconst VALIAS={" +
           ",".join(f'{k}:"{v}"' for k, v in alias.items()) + "};", s, count=1)
open(p, "w").write(s)
print(len(ids), "vidéos,", len(alias), "alias")
