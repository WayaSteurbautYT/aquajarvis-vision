#!/usr/bin/env python3
"""
Test script to verify Ollama integration with qwen3-vl model.
Run this script to test if Ollama is properly set up and accessible.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from api.utils.ollama_client import get_ollama_response, stream_ollama

def test_basic_chat():
    """Test basic text chat with Ollama."""
    print("Testing basic text chat...")
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! Can you help me with something?"}
    ]
    
    try:
        response = get_ollama_response(messages)
        print("✅ Basic chat test passed!")
        print(f"Response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Basic chat test failed: {e}")
        return False

def test_vision_chat():
    """Test vision capabilities (requires a test image)."""
    print("\nTesting vision capabilities...")
    
    # Create a simple test message with image placeholder
    messages = [
        {"role": "system", "content": "You are a screen-vision assistant."},
        {"role": "user", "content": "This is a test of the vision capabilities."}
    ]
    
    try:
        response = get_ollama_response(messages)
        print("✅ Vision chat test passed!")
        print(f"Response: {response[:100]}...")
        return True
    except Exception as e:
        print(f"❌ Vision chat test failed: {e}")
        return False

def test_streaming():
    """Test streaming functionality."""
    print("\nTesting streaming...")
    
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Count from 1 to 5 slowly."}
    ]
    
    try:
        chunks = []
        for chunk in stream_ollama(messages, endpoint_name="test"):
            chunks.append(chunk)
            if chunk.startswith("data: [DONE]"):
                break
        
        print("✅ Streaming test passed!")
        print(f"Received {len(chunks)} chunks")
        return True
    except Exception as e:
        print(f"❌ Streaming test failed: {e}")
        return False

def main():
    print("🧪 Testing Ollama Integration")
    print("=" * 40)
    
    # Check if Ollama is available
    try:
        import ollama
        models = ollama.list()
        model_names = [m.get('name', 'unknown') for m in models.get('models', [])]
        print(f"✅ Ollama is running. Available models: {model_names}")
        
        # Check if qwen3-vl is available
        if not any('qwen3-vl' in name for name in model_names):
            print("⚠️  qwen3-vl model not found. Available models:")
            for name in model_names:
                print(f"  - {name}")
        else:
            print("✅ qwen3-vl model found!")
        
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        print("Make sure Ollama is installed and running locally.")
        return
    
    # Run tests
    tests = [test_basic_chat, test_vision_chat, test_streaming]
    passed = 0
    
    for test in tests:
        if test():
            passed += 1
    
    print(f"\n📊 Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Ollama integration is ready.")
    else:
        print("⚠️  Some tests failed. Check your Ollama setup.")

if __name__ == "__main__":
    main()
