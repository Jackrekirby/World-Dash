import json

from v1.structs import Tileset


def extract_part(name: str, parts: list[str]) -> str | None:
    key = f'{name}-'
    for p in parts:
        if p.startswith(key):
            return p[len(key):]
        

def update_metas(metas, parts: list[str], v):
    current = metas
    for i, part in enumerate(parts):
        if i == len(parts) - 1:  # If it's the last part
            current[part] = v
        else:
            current = current.setdefault(part, {})

def sort_by_prefix(strings: list[str], prefixes: list[str]):
    prefix_order = {prefix: i for i, prefix in enumerate(prefixes)}

    def prefix_key(s):
        # Find the prefix of the string that matches the prefix list
        for prefix in prefixes:
            if s.startswith(prefix):
                return prefix_order[prefix]
        # If no prefix matches, place it at the end
        return len(prefixes)

    return sorted(strings, key=prefix_key)

def nested_dict_to_arrays(nested_dict: dict):
    """
    Convert a nested dictionary into nested arrays by removing keys.

    :param nested_dict: Dictionary to convert
    :return: Nested list structure
    """
    key: str = list(nested_dict.keys())[0]
    if key.startswith('sub-'):
        return {k[4:].replace('_', ' '): v for k, v in nested_dict.items()}
    elif isinstance(nested_dict, dict) and not key.startswith('sub-'):
        return [nested_dict_to_arrays(value) for value in nested_dict.values()]
    else:
        return nested_dict

def export_tileset_meta(tileset: Tileset):
    metas: dict = {}
    for k, v in tileset.meta.items():
        parts = k.split(':')
        
        edge_part = extract_part('edge', parts)
        if edge_part is not None:
            edge_key = f'edge-{edge_part}'
            parts = [p for p in parts if p != edge_key]
            parts[0] = f'{parts[0]}_edge_{edge_part}'

        sorted_part_keys = ['mvar', 'color', 'rot', 'frame', 'sub']
        for pk in sorted_part_keys:
            part = extract_part(pk, parts)
            if part is None:
                if pk == 'sub':
                    parts.append(f'{pk}-0_0')
                else:
                    parts.append(f'{pk}-0')

        parts = [parts[0], *sort_by_prefix(parts[1:], sorted_part_keys)]
        update_metas(metas, parts, [v.x, v.y])
        

    arr_metas: dict = {}
    for k, v in metas.items():
        arr_metas[k] = nested_dict_to_arrays(v)
    
        
    data = json.dumps(arr_metas, indent=4)
    body = (
        f"export const TILESET: {{[key: string]: {{[key: string]: number[]}}[][][][]}} = {data}"
    )
    with open("src/front_end/renderer/tileset.ts", 'w') as f:
        f.write(body)

    
