import json
import time
import traceback
import uuid
import base64
import io
import os
from typing import Any, List, Optional, Dict
from PIL import Image
import ollama


def analyze_screen(image_path: str, user_prompt: str) -> str:
    """
    Local Ollama screen analysis function.
    
    SYSTEM PROMPT:
    You are a local screen-vision assistant.
    You can see the user's screen image and read UI elements.
    Guide the user step by step based on what is visible.
    Explain what buttons, panels, or menus to click next.
    Be concise, technical, and accurate.
    Do not hallucinate UI elements.
    """
    model = os.getenv('OLLAMA_MODEL', 'qwen3-vl')
    
    response = ollama.chat(
        model=model,
        messages=[
            {
                'role': 'system',
                'content': 'You are a local screen-vision assistant. You can see the user\'s screen image and read UI elements. Guide the user step by step based on what is visible. Explain what buttons, panels, or menus to click next. Be concise, technical, and accurate. Do not hallucinate UI elements.'
            },
            {
                'role': 'user',
                'content': user_prompt,
                'images': [image_path]
            }
        ]
    )
    return response['message']['content']


def convert_openai_to_ollama(messages: List[Any]) -> List[Dict[str, Any]]:
    """
    Convert OpenAI message format to Ollama format.
    Handles text and image content.
    """
    ollama_messages = []
    
    for msg in messages:
        role = msg.get("role")
        content = msg.get("content")
        
        # Skip system messages for now - we'll handle them separately
        if role == "system":
            continue
            
        # Map OpenAI roles to Ollama roles
        ollama_role = "user" if role == "user" else "assistant"
        
        ollama_msg = {
            "role": ollama_role,
            "content": ""
        }
        
        # Handle content as string or list
        if isinstance(content, str):
            ollama_msg["content"] = content
        elif isinstance(content, list):
            text_parts = []
            images = []
            
            for part in content:
                if part.get("type") == "text":
                    text_parts.append(part.get("text"))
                elif part.get("type") == "image_url":
                    image_url = part.get("image_url", {}).get("url", "")
                    if image_url.startswith("data:image/"):
                        # Handle base64 image
                        try:
                            header, data = image_url.split(",", 1)
                            mime_type = header.split(";")[0].split(":")[1]
                            
                            # Decode base64 and save as temp file for Ollama
                            image_data = base64.b64decode(data)
                            image = Image.open(io.BytesIO(image_data))
                            
                            # For now, we'll pass the base64 data directly
                            # Ollama can handle base64 images
                            images.append(image_data)
                        except Exception as e:
                            print(f"Error parsing base64 image: {e}")
                            continue
            
            ollama_msg["content"] = " ".join(text_parts)
            if images:
                ollama_msg["images"] = images
        
        ollama_messages.append(ollama_msg)
    
    return ollama_messages


def extract_system_prompt(messages: List[Any]) -> str:
    """Extract system prompt from OpenAI format messages."""
    for msg in messages:
        if msg.get("role") == "system":
            content = msg.get("content")
            if isinstance(content, str):
                return content
            elif isinstance(content, list):
                text_parts = []
                for part in content:
                    if part.get("type") == "text":
                        text_parts.append(part.get("text"))
                return " ".join(text_parts)
    return "You are a local screen-vision assistant. You can see the user's screen image and read UI elements. Guide the user step by step based on what is visible."


def stream_ollama(
    messages: List[Any],
    model: str = None,
    endpoint_name: Optional[str] = None,
    start_time: Optional[float] = None,
):
    """
    Stream responses from Ollama in the same format as the existing streaming utilities.
    Supports multiple providers through environment variables.
    """
    try:
        if start_time is None:
            start_time = time.time()
        first_chunk_logged = False

        def format_sse(payload: dict) -> str:
            return f"data: {json.dumps(payload, separators=(',', ':'))}\n\n"

        message_id = f"msg-{uuid.uuid4().hex}"
        text_stream_id = "text-1"
        text_started = False
        text_finished = False

        yield format_sse({"type": "start", "messageId": message_id})

        # Determine which provider and model to use
        if os.getenv('OPENROUTER_API_KEY'):
            # Use OpenRouter cloud provider
            import httpx
            client = httpx.Client()
            
            openrouter_model = os.getenv('OPENROUTER_MODEL', 'qwen/qwen3-vl-30b-a3b-instruct')
            openrouter_messages = convert_openai_to_ollama(messages)
            
            response = client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                    "HTTP-Referer": "https://github.com/bullmeza/screen.vision",
                    "X-Title": "Screen Vision Local",
                },
                json={
                    "model": openrouter_model,
                    "messages": openrouter_messages,
                    "stream": True
                },
                timeout=60.0
            )
            
            for line in response.iter_lines():
                if line.startswith(b'data: '):
                    data = json.loads(line[6:].decode('utf-8'))
                    if data.get('choices') and data['choices'][0].get('delta', {}).get('content'):
                        content = data['choices'][0]['delta']['content']
                        if not first_chunk_logged:
                            first_chunk_logged = True
                            print(
                                f"[{endpoint_name or 'openrouter-stream'}] Time to first chunk: {(time.time() - start_time) * 1000:.2f}ms"
                            )
                        if not text_started:
                            yield format_sse({"type": "text-start", "id": text_stream_id})
                            text_started = True
                        yield format_sse(
                            {
                                "type": "text-delta",
                                "id": text_stream_id,
                                "delta": content,
                            }
                        )
                        
        elif os.getenv('CUSTOM_API_BASE_URL'):
            # Use custom provider
            import httpx
            client = httpx.Client()
            
            custom_model = os.getenv('CUSTOM_MODEL', model or 'qwen3-vl')
            custom_messages = convert_openai_to_ollama(messages)
            custom_api_key = os.getenv('CUSTOM_API_KEY', '')
            
            headers = {"Content-Type": "application/json"}
            if custom_api_key:
                headers["Authorization"] = f"Bearer {custom_api_key}"
            
            response = client.post(
                f"{os.getenv('CUSTOM_API_BASE_URL')}/v1/chat/completions",
                headers=headers,
                json={
                    "model": custom_model,
                    "messages": custom_messages,
                    "stream": True
                },
                timeout=60.0
            )
            
            for line in response.iter_lines():
                if line.startswith(b'data: '):
                    data = json.loads(line[6:].decode('utf-8'))
                    if data.get('choices') and data['choices'][0].get('delta', {}).get('content'):
                        content = data['choices'][0]['delta']['content']
                        if not first_chunk_logged:
                            first_chunk_logged = True
                            print(
                                f"[{endpoint_name or 'custom-stream'}] Time to first chunk: {(time.time() - start_time) * 1000:.2f}ms"
                            )
                        if not text_started:
                            yield format_sse({"type": "text-start", "id": text_stream_id})
                            text_started = True
                        yield format_sse(
                            {
                                "type": "text-delta",
                                "id": text_stream_id,
                                "delta": content,
                            }
                        )
        else:
            # Use local Ollama (default)
            ollama_base_url = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
            ollama_model = model or os.getenv('OLLAMA_MODEL', 'qwen3-vl')
            
            # Update ollama client base URL if custom
            if ollama_base_url != 'http://localhost:11434':
                ollama.Client(host=ollama_base_url)
            
            # Convert messages to Ollama format
            system_prompt = extract_system_prompt(messages)
            ollama_messages = convert_openai_to_ollama(messages)
            
            # Add system message at the beginning
            if system_prompt:
                ollama_messages.insert(0, {
                    "role": "system",
                    "content": system_prompt
                })

            # Stream from Ollama
            stream = ollama.chat(
                model=ollama_model,
                messages=ollama_messages,
                stream=True
            )

            for chunk in stream:
                if not first_chunk_logged:
                    first_chunk_logged = True
                    print(
                        f"[{endpoint_name or 'ollama-stream'}] Time to first chunk: {(time.time() - start_time) * 1000:.2f}ms"
                    )

                if chunk.get("message", {}).get("content"):
                    content = chunk["message"]["content"]
                    if not text_started:
                        yield format_sse({"type": "text-start", "id": text_stream_id})
                        text_started = True
                    yield format_sse(
                        {
                            "type": "text-delta",
                            "id": text_stream_id,
                            "delta": content,
                        }
                    )

        if text_started and not text_finished:
            yield format_sse({"type": "text-end", "id": text_stream_id})
            text_finished = True

        # Finish metadata
        finish_metadata = {}
        yield format_sse(
            {"type": "finish", "messageMetadata": finish_metadata}
            if finish_metadata
            else {"type": "finish"}
        )

        print(
            f"[{endpoint_name or 'stream'}] Total stream time: {(time.time() - start_time) * 1000:.2f}ms"
        )

        yield "data: [DONE]\n\n"
    except Exception:
        traceback.print_exc()
        raise


def get_ollama_response(messages: List[Any], model: str = None) -> str:
    """
    Get a non-streaming response from Ollama or other providers.
    """
    # Determine which provider to use
    if os.getenv('OPENROUTER_API_KEY'):
        # Use OpenRouter cloud provider
        import httpx
        client = httpx.Client()
        
        openrouter_model = os.getenv('OPENROUTER_MODEL', 'qwen/qwen3-vl-30b-a3b-instruct')
        openrouter_messages = convert_openai_to_ollama(messages)
        
        response = client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "HTTP-Referer": "https://github.com/bullmeza/screen.vision",
                "X-Title": "Screen Vision Local",
            },
            json={
                "model": openrouter_model,
                "messages": openrouter_messages,
                "stream": False
            },
            timeout=60.0
        )
        
        data = response.json()
        return data['choices'][0]['message']['content']
        
    elif os.getenv('CUSTOM_API_BASE_URL'):
        # Use custom provider
        import httpx
        client = httpx.Client()
        
        custom_model = os.getenv('CUSTOM_MODEL', model or 'qwen3-vl')
        custom_messages = convert_openai_to_ollama(messages)
        custom_api_key = os.getenv('CUSTOM_API_KEY', '')
        
        headers = {"Content-Type": "application/json"}
        if custom_api_key:
            headers["Authorization"] = f"Bearer {custom_api_key}"
        
        response = client.post(
            f"{os.getenv('CUSTOM_API_BASE_URL')}/v1/chat/completions",
            headers=headers,
            json={
                "model": custom_model,
                "messages": custom_messages,
                "stream": False
            },
            timeout=60.0
        )
        
        data = response.json()
        return data['choices'][0]['message']['content']
    else:
        # Use local Ollama (default)
        system_prompt = extract_system_prompt(messages)
        ollama_messages = convert_openai_to_ollama(messages)
        
        # Add system message at the beginning
        if system_prompt:
            ollama_messages.insert(0, {
                "role": "system", 
                "content": system_prompt
            })

        ollama_model = model or os.getenv('OLLAMA_MODEL', 'qwen3-vl')
        
        response = ollama.chat(
            model=ollama_model,
            messages=ollama_messages
        )
        
        return response['message']['content']
