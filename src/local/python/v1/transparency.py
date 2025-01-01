import numpy as np
from PIL import Image


def adjust_pixel_transparent(image: Image.Image, max_alpha_offset: int) -> Image.Image:
    image_rgba = image.convert("RGBA")
    image_data = np.array(image_rgba)

    max_alpha = 0
    for i in range(image_data.shape[0]):  # Height
        for j in range(image_data.shape[1]):  # Width
            alpha = image_data[i, j][3]
            if alpha > max_alpha:
                max_alpha = alpha
    print('max alpha', max_alpha)
    for i in range(image_data.shape[0]):  # Height
        for j in range(image_data.shape[1]):  # Width
            alpha = image_data[i, j][3]
            if alpha == 0:
                continue
            new_alpha = alpha + (255 - max_alpha - max_alpha_offset)
            # print('new alpha', new_alpha)
            image_data[i, j][3] = new_alpha

    # Save the modified image
    modified_image = Image.fromarray(image_data)
    return modified_image

def main():
    for i in range(1, 6):
        in_path: str = f"assets/pre_tiles/debug_{i}.png"
        out_path: str = f"assets/tiles/debug_{i}.png"

        image = Image.open(in_path)
        new_image = adjust_pixel_transparent(image, 50)
        new_image.save(out_path)

if __name__ == "__main__":
    main()