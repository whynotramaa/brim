
![#file:banner.png](#file:banner.png)

# Brim — Terminal-native AI Coding Assistant (BYOK)

Brim is a small, terminal-native AI coding assistant that runs locally and communicates with a configurable LLM service. It follows a BYOK (Bring Your Own Key) model so you keep control of API credentials.

**TL;DR:** Use `python main.py "your prompt"` to run a one-off prompt, or integrate the client from `client/llm_client.py` into your own tools. Keep your credentials out of source control using the `.env` pattern.

**Features**
- Terminal-first CLI for quick prompts and small workflows
- Streaming and non-streaming chat completion support
- Retry/backoff for rate limits and connection failures
- BYOK: no secrets committed — load from `.env` or environment

**Security / BYOK**
Brim never hardcodes API keys in committed files. Provide your `OPENROUTER_API_KEY` via a local `.env` file or environment variable. 

Create a `.env` in the project root with:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

`.gitignore` already excludes `.env` and common Python artifacts.

**Quickstart**
1. (Optional) Activate your virtualenv:

```bash
source .venv/Scripts/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
```

2. Install dependencies (if not already installed):

```bash
pip install -r requirements.txt
# or at minimum
pip install python-dotenv openai
```

3. Add your API key to `.env` then run a prompt:

```bash
python main.py "hey how are you doing"
```

**Code pointers**
- CLI entry: [main.py](main.py)
- LLM client and BYOK handling: [client/llm_client.py](client/llm_client.py)
- Event types and streaming model: [client/response.py](client/response.py)
- Example env template: [.env.example](.env.example)

**Extending Brim**
- Swap models or providers by editing `model`/`base_url` in `client/llm_client.py`.
- Add local caching, conversation history, or TUI frontends that consume the `StreamEvent` generator.

If you'd like, I can add a checked-in `requirements.txt`, a `setup.py`/`pyproject.toml`, or a short development guide for contributors.

