
import dataclasses
import json
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image


def get_filenames_without_extension(directory: str):
    # Convert the directory string to a Path object
    path = Path(directory)
    
    # Use the glob method to find all files and get filenames without extensions
    filenames = [file.stem for file in path.iterdir() if file.is_file()]
    
    return filenames

@dataclasses.dataclass
class Pos3D:
   x: int
   y: int
   z: int

@dataclasses.dataclass
class Pos2D:
   x: int
   y: int

class Pos2DEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Pos2D):
            # Convert the Pos2D object to a dictionary
            return {"x": obj.x, "y": obj.y}
        return super().default(obj)

w = 16
h = 17

a = 10
wz =  [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, a, a, a, a, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, a, a, a, a, a, a, a, a, 0, 0, 0, 0],
    [0, 0, a, a, a, a, a, a, a, a, a, a, a, a, 0, 0],
    [a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a],
    [9, 9, a, a, a, a, a, a, a, a, a, a, a, a, 9, 9],
    [8, 8, 9, 9, a, a, a, a, a, a, a, a, 9, 9, 8, 8],
    [7, 7, 8, 8, 9, 9, a, a, a, a, 9, 9, 8, 8, 7, 7],
    [6, 6, 7, 7, 8, 8, 9, 9, 9, 9, 8, 8, 7, 7, 6, 6],
    [5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 7, 7, 6, 6, 5, 5],
    [4, 4, 5, 5, 6, 6, 7, 7, 7, 7, 6, 6, 5, 5, 4, 4],
    [3, 3, 4, 4, 5, 5, 6, 6, 6, 6, 5, 5, 4, 4, 3, 3],
    [2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2],
    [1, 1, 2, 2, 3, 3, 4, 4, 4, 4, 3, 3, 2, 2, 1, 1],
    [0, 0, 1, 1, 2, 2, 3, 3, 3, 3, 2, 2, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
]
wx = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 0, 0, 0, 0],
    [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 0, 0],
    [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8],
    [1, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
    [0, 0, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8, 8, 0, 0],
    [0, 0, 0, 0, 5, 6, 7, 8, 8, 8, 8, 8, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 7, 8, 8, 8, 0, 0, 0, 0, 0, 0]
  ]
wy = [row[::-1] for row in wx]

def format_weights(weights):
    return [item for row in weights for item in row]

wx = format_weights(wx)
wy = format_weights(wy)
wz = format_weights(wz)

def create_pixel_positions() -> list[Pos3D]:
    n = w * h
    ps  = []
    for i in range(n):
      p = Pos3D(x= wx[i], y=wy[i], z= wz[i])
      ps.append(p)
    
    return ps

def generate_boolean_combinations(n: int) -> list[list[bool]]:
    # The result list to hold all combinations
    result = []

    # Total number of combinations is 2^n
    total_combinations = 1 << n

    for i in range(total_combinations):
        combination = []

        for j in range(n):
            # Use bitwise AND to determine if the j-th bit in i is set
            combination.append((i & (1 << j)) != 0)

        result.append(combination)

    return result

def create_mask(ps: list[Pos3D], combo: list[int], offset: int) -> list[bool]:
    xs = []
    ys = []
    if combo[0]:
        xs.append(1 + offset)
    if combo[1]:
        xs.append(8 - offset)
    if combo[2]:
        ys.append(1 + offset)
    if combo[3]:
        ys.append(8 - offset)
    
    mask = [p.z == 10 and (p.x in xs or p.y in ys) for p in ps]
    return mask

def apply_mask_to_image(image_path: str, mask: list[int]) -> Image.Image:
    import numpy as np
    from PIL import Image

    # Open the image
    image = Image.open(image_path)
    image_data = np.array(image)

    # Ensure the mask has the same number of pixels as the image's height and width
    mask_array = np.array(mask).reshape(image_data.shape[:2])  # Shape (17, 16)
    # Iterate through each pixel and apply the mask
    for i in range(image_data.shape[0]):  # Height
        for j in range(image_data.shape[1]):  # Width
            # set alpha to that of mask
            image_data[i, j][3] = mask_array[i, j]

    # Save the modified image
    modified_image = Image.fromarray(image_data)
    return modified_image



def combine_images_in_memory(images: dict[str, Image.Image]) -> tuple[dict[str, Pos2D], Image.Image]:
    # Number of images
    num_images = len(images)

    # Calculate the number of rows and columns to make the image as square as possible
    ncols = int(np.ceil(np.sqrt(num_images)))
    nrows = int(np.ceil(num_images / ncols))

    # Get the size of each individual image (assuming all images are the same size)
    width, height = list(images.values())[0].size

    # Create a new blank image with enough space to fit the grid of images
    new_width = ncols * width
    new_height = nrows * height
    new_image = Image.new('RGBA', (new_width, new_height))

    meta: dict[str, Pos2D] = {}
    # Place the images into the new image grid
    for i, name in enumerate(images):
        row = i // ncols
        col = i % ncols
        # Calculate the position to paste the image into the new image
        x = col * width
        y = row * height
        new_image.paste(images[name], (x, y))
        meta[name] = Pos2D(col, row)

    return meta, new_image


def create_edge_key(combo: list[bool]):
    return f"{'ny' if combo[0] else ''}{'py' if combo[1] else ''}{'nx' if combo[2] else ''}{'px' if combo[3] else ''}"

def boolean_mask_to_alpha(mask: list[bool], chance, min, max) -> list[int]:
    alphas: list[int] = []
    for item in mask:
        if item and random.uniform(0, 1) < chance:
            alphas.append(math.floor(random.uniform(min, max) * 255))
        else:
            alphas.append(0)
    return alphas

def main():
    ps = create_pixel_positions()
    directory = 'assets/blocks'
    filenames: list[str] = get_filenames_without_extension(directory)
    images: dict[str, Image.Image] = {}
    for filename in filenames:
        name: str = filename

        input_image_path: str = f"{directory}/{name}.png"
        
        for combo in generate_boolean_combinations(4):
            masks = [
                boolean_mask_to_alpha(create_mask(ps, combo, 0), 0.5, 0.5, 1.0),
                boolean_mask_to_alpha(create_mask(ps, combo, 1), 0.25, 0.3, 0.5),
                boolean_mask_to_alpha(create_mask(ps, combo, 2), 0.125, 0.1, 0.3)
            ]
            mask: list[int] =[]
            for i in range(w*h):
                ss = 0
                for m in masks:
                    ss += m[i]
                mask.append(ss)

            key = f"{name}_{create_edge_key(combo)}"
            image = apply_mask_to_image(input_image_path, mask)
            images[key] = image

    meta, tileset = combine_images_in_memory(images)

    tileset.save(f"assets/procedural/edges.png")

    with open(f"assets/procedural/edges.json", 'w') as f:
        # Write the JSON data to the file
        json.dump(meta, f, cls=Pos2DEncoder, indent=4)


    
    
       
   
    

if __name__ == "__main__":
    main()
