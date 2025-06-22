#!/usr/bin/env python3
import sys
import json
import time
import easyocr
import numpy as np
from PIL import Image

def process_image_ocr(image_path, languages):
    """
    Process image using EasyOCR and return extracted text with confidence scores
    """
    try:
        print(f"Starting OCR processing for: {image_path}")
        start_time = time.time()
        
        # Initialize EasyOCR reader
        lang_list = languages.split(',')
        print(f"Initializing EasyOCR with languages: {lang_list}")
        reader = easyocr.Reader(lang_list, gpu=False)  # Set gpu=True if you have CUDA
        print("EasyOCR reader initialized successfully")
        
        # Read text from image
        print("Processing image...")
        results = reader.readtext(image_path)
        print(f"OCR processing completed. Found {len(results)} text regions")
        
        # Process results
        extracted_texts = []
        confidence_scores = []
        
        for i, (bbox, text, confidence) in enumerate(results):
            print(f"Text {i+1}: '{text}' (confidence: {confidence:.3f})")
            extracted_texts.append(text.strip())
            confidence_scores.append(round(confidence, 3))
        
        processing_time = round(time.time() - start_time, 2)
        print(f"Total processing time: {processing_time}s")
        
        # Combine all text
        full_text = ' '.join(extracted_texts)
        
        result = {
            'text_extracted': full_text,
            'individual_texts': extracted_texts,
            'confidence_scores': confidence_scores,
            'processing_time': processing_time,
            'total_detections': len(results)
        }
        
        return result
        
    except Exception as e:
        print(f"Error during OCR processing: {str(e)}")
        return {
            'error': str(e),
            'text_extracted': '',
            'confidence_scores': [],
            'processing_time': 0
        }

def main():
    if len(sys.argv) < 3:
        print(json.dumps({'error': 'Missing arguments. Usage: python ocr_processor.py <image_path> <languages>'}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    languages = sys.argv[2]
    
    # Process the image
    result = process_image_ocr(image_path, languages)
    
    # Output JSON result
    print(json.dumps(result, ensure_ascii=False))

if __name__ == '__main__':
    main()
