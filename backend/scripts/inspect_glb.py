#!/usr/bin/env python3
"""List glTF meshes, nodes with meshes, and materials for binding headlights/moldings/paint."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from pygltflib import GLTF2
except ImportError:
    print("Install dev deps: pip install -r backend/requirements-dev.txt", file=sys.stderr)
    raise


def main() -> None:
    p = argparse.ArgumentParser(description="Inspect a .glb for mesh/material names.")
    p.add_argument("glb", type=Path, help="Path to .glb file")
    args = p.parse_args()

    gltf = GLTF2().load(str(args.glb.resolve()))

    print("=== Meshes (index, name) ===")
    if gltf.meshes:
        for i, m in enumerate(gltf.meshes):
            print(i, repr(m.name or f"mesh_{i}"))

    print("\n=== Nodes with mesh ===")
    if gltf.nodes:
        for i, node in enumerate(gltf.nodes):
            if node.mesh is None:
                continue
            mname = None
            if gltf.meshes and node.mesh < len(gltf.meshes):
                mname = gltf.meshes[node.mesh].name
            print(i, "node:", repr(node.name), "-> mesh", node.mesh, repr(mname))

    print("\n=== Materials (index, name) ===")
    if gltf.materials:
        for i, mat in enumerate(gltf.materials):
            print(i, repr(mat.name))


if __name__ == "__main__":
    main()
