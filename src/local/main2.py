from PIL import Image


def create_hue_split_image(output_path:str):
    # Create a new image
    image = Image.new("RGB", (16, 1))
    vs = [1, 0.5]
    
    # Set each pixel with the corresponding hue
    for x in range(8):
        hue = x / 8
        for y in range(2):
            rgb = hsv_to_rgb(hue, 1, vs[y])  # Convert HSV to RGB
            image.putpixel((x*2+y, 0), rgb)

    # Save the image
    image.save(output_path)
    print(f"Image saved as {output_path}")

def hsv_to_rgb(h: float, s: float, v: float):
    import colorsys
    r, g, b = colorsys.hsv_to_rgb(h, s, v)
    return int(r * 255), int(g * 255), int(b * 255)

# Example usage
if __name__ == "__main__":
    create_hue_split_image("assets/hues.png")
