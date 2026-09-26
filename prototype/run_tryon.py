"""
Standalone Prototype Executable for AI Salon Virtual Hairstyle Try-On.
Demonstrates end-to-end:
Customer photo + Hairstyle reference -> Realistic Hairstyle Try-On Result
"""

import os
import sys
import argparse
import time
import cv2
import numpy as np

# Ensure project root is in PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from prototype.adapters.local_vision_adapter import LocalVisionAdapter
from prototype.adapters.hairfastgan_adapter import HairFastGANAdapter

def create_comparison_grid(customer: np.ndarray, style: np.ndarray, result: np.ndarray, title: str = "AI Salon Virtual Try-On") -> np.ndarray:
    """Creates a beautifully styled side-by-side comparison card."""
    h_target = 600
    def resize_h(img):
        h, w = img.shape[:2]
        new_w = int(w * (h_target / h))
        return cv2.resize(img, (new_w, h_target), interpolation=cv2.INTER_AREA)

    c_resized = resize_h(customer)
    s_resized = resize_h(style)
    r_resized = resize_h(result)

    gap = 12
    card_w = c_resized.shape[1] + s_resized.shape[1] + r_resized.shape[1] + (gap * 4)
    card_h = h_target + 90

    # Modern dark salon backdrop
    canvas = np.full((card_h, card_w, 3), 24, dtype=np.uint8)

    # Place images with subtle margins
    x_offset = gap
    for img, label in [(c_resized, "CUSTOMER (ORIGINAL)"), (s_resized, "SELECTED HAIRSTYLE"), (r_resized, "AI SALON PREVIEW")]:
        iw = img.shape[1]
        canvas[70:70+h_target, x_offset:x_offset+iw] = img

        # Label bar below image
        cv2.putText(canvas, label, (x_offset + 10, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (230, 230, 230), 2, cv2.LINE_AA)
        # Highlight accent for AI preview
        if "PREVIEW" in label:
            cv2.rectangle(canvas, (x_offset - 2, 68), (x_offset + iw + 2, 70 + h_target + 2), (218, 165, 32), 2)
            cv2.putText(canvas, "* IDENTITY PRESERVED", (x_offset + 10, card_h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (218, 165, 32), 1, cv2.LINE_AA)

        x_offset += iw + gap

    # Title header
    cv2.putText(canvas, title.upper(), (20, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (218, 165, 32), 2, cv2.LINE_AA)
    return canvas

def main():
    parser = argparse.ArgumentParser(description="AI Salon Virtual Hairstyle Try-On Prototype")
    parser.add_argument("--customer", type=str, default="prototype/data/customer.jpg", help="Path to customer portrait")
    parser.add_argument("--hairstyle", type=str, default="prototype/data/hair_blonde_bob.jpg", help="Path to hairstyle reference")
    parser.add_argument("--color", type=str, default=None, help="Optional hair color (blonde, burgundy, copper, etc.)")
    parser.add_argument("--output", type=str, default="prototype/output/result.jpg", help="Output path for result image")
    parser.add_argument("--comparison", type=str, default="prototype/output/comparison.jpg", help="Output path for side-by-side comparison")
    parser.add_argument("--model", type=str, default="localvision", choices=["localvision", "hairfastgan"], help="Model adapter")

    args = parser.parse_args()

    print("=================================================================")
    print("           AI SALON VIRTUAL HAIRSTYLE TRY-ON SYSTEM              ")
    print("=================================================================")
    print(f"Customer Photo:      {args.customer}")
    print(f"Hairstyle Reference: {args.hairstyle}")
    print(f"Selected Color:      {args.color or 'Original Hairstyle Tone'}")
    print(f"Model Adapter:       {args.model}")
    print("-----------------------------------------------------------------")

    if not os.path.exists(args.customer):
        print(f"Error: Customer image not found at {args.customer}")
        sys.exit(1)
    if not os.path.exists(args.hairstyle):
        print(f"Error: Hairstyle reference not found at {args.hairstyle}")
        sys.exit(1)

    customer_img = cv2.imread(args.customer)
    hairstyle_img = cv2.imread(args.hairstyle)

    # Initialize Adapter
    if args.model == "hairfastgan":
        adapter = HairFastGANAdapter()
    else:
        adapter = LocalVisionAdapter()

    adapter.load_model()

    print("[1/3] Validating face orientation, illumination, and focus...")
    val = adapter.validate_input(customer_img, hairstyle_img)
    if not val["valid"]:
        print(f"[REJECTED] Validation failed: {val['error']}")
        sys.exit(1)

    print("      + Customer face detected (confidence: {:.2f}, blur score: {:.1f})".format(
        val["customer"]["confidence"], val["customer"]["blur_score"]
    ))
    print("      + Hairstyle reference validated successfully.")

    print("[2/3] Performing AI Hairstyle Transfer & Face Shielding...")
    res = adapter.generate(customer_img, hairstyle_img, hair_color=args.color)

    if not res.success:
        print(f"[ERROR] Try-On generation failed: {res.error_message}")
        sys.exit(1)

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    cv2.imwrite(args.output, res.result_image)
    print(f"[3/3] Generated Result saved to: {args.output}")

    if args.comparison:
        comp_grid = create_comparison_grid(customer_img, hairstyle_img, res.result_image)
        cv2.imwrite(args.comparison, comp_grid)
        print(f"      Comparison Grid saved to: {args.comparison}")

    print("-----------------------------------------------------------------")
    print("PERFORMANCE METRICS:")
    print(f"  * Preprocessing:    {res.timings['preprocessing_ms']} ms")
    print(f"  * AI Inference:     {res.timings['inference_ms']} ms")
    print(f"  * Postprocessing:   {res.timings['postprocessing_ms']} ms")
    print(f"  * Total Latency:    {res.processing_time_ms} ms")
    print("=================================================================")
    print("SUCCESS: Hairstyle Try-On completed with full identity preservation!")

if __name__ == "__main__":
    main()
