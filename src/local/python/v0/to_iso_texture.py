import math

import numpy as np
from PIL import Image, ImageOps


def apply_perspective_transform(image_path, output_path):
    # Open the image
    image = Image.open(image_path)
    width, height = image.size

    # Define the points for the original rectangle (source points)
    src_points = np.array([
        [0, 0],  # Top-left
        [width, 0],  # Top-right
        [width, height],  # Bottom-right
        [0, height]  # Bottom-left
    ], dtype=np.float32)
    j = 0.5
    k = 1
    # Define the points for the isometric perspective (destination points)
    iso_points = np.array([
        [width * 0.5, -j],  # Top-left
        [width+k, height * 0.25],  # Top-right
        [width * 0.5, height*0.5+ j],  # Bottom-right
        [-k, height * 0.25 ]  # Bottom-left
    ], dtype=np.float32)

    # Calculate the transformation matrix using NumPy
    matrix = find_coeffs(src_points, iso_points)

    print(matrix)

    # Apply the transformation using PIL
    transformed_image = image.transform((width, math.floor(height/2)), Image.PERSPECTIVE, matrix, resample=Image.BICUBIC)

    # Save the output
    transformed_image.save(output_path, "PNG")

def find_coeffs(source_coords, target_coords):
    matrix = []
    for s, t in zip(source_coords, target_coords):
        matrix.append([t[0], t[1], 1, 0, 0, 0, -s[0]*t[0], -s[0]*t[1]])
        matrix.append([0, 0, 0, t[0], t[1], 1, -s[1]*t[0], -s[1]*t[1]])
    A = np.matrix(matrix, dtype=np.float32)
    B = np.array(source_coords).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).reshape(8)


def main():
    apply_perspective_transform(
        "assets/water2.png", 
        "assets/procedural/iso.png"
    )
   
   
   
    

if __name__ == "__main__":
    main()