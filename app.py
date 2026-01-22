#!/usr/bin/env python3
"""
Screen Vision - Local Ollama Integration
Main application entry point.

This replaces cloud dependencies (OpenAI/OpenRouter/Gemini) with local Ollama
using the qwen3-vl multimodal vision model.

Requirements:
- Ollama installed and running locally
- qwen3-vl model pulled: ollama pull qwen3-vl
- NVIDIA RTX 4060 or similar GPU recommended

Usage:
    python app.py

Then access the application at http://localhost:8000
"""

import uvicorn
import os
import sys

def main():
    """Start the Screen Vision FastAPI application with local Ollama."""
    
    print("🚀 Starting Screen Vision with Local Ollama")
    print("=" * 50)
    
    # Check if Ollama is available
    try:
        import ollama
        # Simple connection test
        response = ollama.chat(model='qwen3-vl', messages=[{'role': 'user', 'content': 'test'}])
        print("✅ qwen3-vl model is working!")
            
    except ImportError:
        print("❌ Ollama Python package not installed!")
        print("Please run: pip install ollama")
        return
    except Exception as e:
        print(f"❌ Cannot connect to Ollama or qwen3-vl model: {e}")
        print("Make sure Ollama is installed and running locally.")
        print("Download from: https://ollama.com/")
        print("And run: ollama pull qwen3-vl")
        return
    
    print("🔧 Starting FastAPI server...")
    print("📱 Application will be available at: http://localhost:8000")
    print("🛑 Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Start the FastAPI application
    uvicorn.run(
        "api.index:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
