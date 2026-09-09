import json
import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from xml.etree import ElementTree


class Command(BaseCommand):
    help = "Convert the bird svgs to json/javascript. Requires the `svgpathtools` pypi package!"

    def add_arguments(self, parser):
        pass

    def handle(self, *args, **options):
        data = {
            "templates": {},
        }
        for filename in sorted((settings.BASE_DIR / "templates" / "birds").glob("*.svg")):
            if m := re.match(r"([a-z]+)\d+\.svg", filename.name):
                print(filename.relative_to(settings.BASE_DIR), end=": ")
                paths = parse_svg(filename)
                print(", ".join("{part}-{weight}".format(**p) for p in paths["paths"]))
                data["templates"].setdefault(m.groups()[0], []).append(paths)

        (settings.BASE_DIR.parent / "src" / "views" / "birds.json").write_text(json.dumps(data, indent=2))

def parse_svg(filename: Path) -> dict:
    PARTS = {"eye", "beak", "feet", "body", "wing"}

    paths = []
    outline = None

    tree = ElementTree.fromstring(filename.read_text())
    for e in tree.iter("{http://www.w3.org/2000/svg}path"):
        #print("X", repr(t))
        label = e.get("{http://www.inkscape.org/namespaces/inkscape}label")
        if label and "display:none" not in e.get("style", ""):

            if e.get("transform"):
                raise NotImplementedError(f"Found transform in path '{label}' in file {filename}")

            if label == "outline":
                outline = e.get("d")
                continue

            for p in PARTS:
                if label.startswith(p):
                    weight = 0.
                    if w := label[len(p):]:
                        weight = float(w)

                    paths.append({
                        "part": p,
                        "weight": weight,
                        "path": e.get("d"),
                    })
                    break

    assert outline, f"Missing outline in {filename}"

    return {
        "viewBox": tree.get("viewBox"),
        "outline": outline,
        "outline_polygon": _convert_path_to_polygon(filename, tree, outline),
        "paths": paths,
    }

def _convert_path_to_polygon(
        filename: Path,
        svg: ElementTree.Element,
        path: str,
        step_size: float = 1. / 100,
) -> str:
    import svgpathtools
    view_box = [float(i) for i in svg.get("viewBox").split()]

    path = svgpathtools.Path(path)

    assert path.iscontinuous(), f"outline is not continuous: {filename}"
    assert path.isclosed(), f"outline is not closed: {filename}"

    polygon = []
    t = 0.
    while t < 1:
        try:
            p: complex = path.point(t)
        except RuntimeError:
            if t < 0.999:
                raise
            break

        t += step_size
        x, y = p.real, p.imag
        x = round(x / (view_box[2] - view_box[0]) * 100, 4)
        y = round(y / (view_box[3] - view_box[1]) * 100, 4)
        polygon.append([x, y])

    return ",".join(f"{x}% {y}%" for x, y in polygon)
