import asyncio
import os
from typing import Any
from typing import AsyncGenerator

from dotenv import load_dotenv
from openai import AsyncOpenAI
from openai import RateLimitError, APIConnectionError, APIError
from client.response import StreamEventType, StreamEvent, TextDelta, TokenUsage


load_dotenv()


class LLMClient:
    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = None
        self._max_retries: int = 3

    def get_client(self) -> AsyncOpenAI:
        if self._client is None:  # ensures we have only client at an instance
            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                raise RuntimeError(
                    "OPENROUTER_API_KEY is missing. Add it to your .env file."
                )

            self._client = AsyncOpenAI(
                api_key=api_key,
                base_url="https://openrouter.ai/api/v1",
            )

        return self._client

    async def close(self) -> None:
        if self._client:
            await self._client.close()
            self._client = None

    async def chat_completion(
        self, messages: list[dict[str, Any]], stream: bool = True
    ) -> AsyncGenerator[StreamEvent, None]:

        client = self.get_client()

        kwargs = {
            "model": "deepseek/deepseek-v4-flash:free",
            "messages": messages,
            "stream": stream,
        }

        for attempt in range(self._max_retries + 1):
            try:
                if stream:
                    async for event in self._stream_response(client, kwargs):
                        yield event
                else:
                    event = await self._non_stream_response(client, kwargs)
                    yield event  # temporarily returns event without destroying function state
                return

            except RateLimitError as e:
                if attempt < self._max_retries:
                    wait_time = 2**attempt  # Exponential backoff
                    await asyncio.sleep(wait_time)

                    print(
                        f"Rate limit exceeded. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{self._max_retries})"
                    )

                else:
                    print(f"Rate limit error: {e}")
                    print("Max retries reached. Please try again later.")
                    yield StreamEvent(type=StreamEventType.ERROR, error=str(e))
                    return

            except APIConnectionError as e:
                if attempt < self._max_retries:
                    wait_time = 2**attempt  # Exponential backoff
                    await asyncio.sleep(wait_time)

                    print(
                        f"API Connection error. Retrying in {wait_time} seconds... (Attempt {attempt + 1}/{self._max_retries})"
                    )

                else:
                    print(f"API connection error: {e}")
                    print("Max retries reached. Please try again later.")
                    yield StreamEvent(type=StreamEventType.ERROR, error=str(e))
                    return

            except APIError as e:
                print(f"API error: {e}")
                yield StreamEvent(type=StreamEventType.ERROR, error=str(e))
                return

    async def _stream_response(
        self, client: AsyncOpenAI, kwargs: dict[str, Any]
    ) -> AsyncGenerator[StreamEvent, None]:
        response = await client.chat.completions.create(**kwargs)

        finish_reason: str | None = None
        usage: TokenUsage | None = None

        async for chunk in response:
            if hasattr(chunk, "usage") and chunk.usage:
                usage = TokenUsage(
                    prompt_tokens=chunk.usage.prompt_tokens,
                    completion_tokens=chunk.usage.completion_tokens,
                    total_tokens=chunk.usage.total_tokens,
                    cached_tokens=chunk.usage.prompt_tokens_details.cached_tokens,
                )
            if not chunk.choices:
                continue

            choice = chunk.choices[0]
            delta = choice.delta

            if choice.finish_reason:
                finish_reason = choice.finish_reason

            if delta.content:
                text_delta = TextDelta(content=delta.content)
                yield StreamEvent(
                    type=StreamEventType.TEXT_DELTA,
                    text_delta=text_delta,
                    finish_reason=finish_reason,
                    usage=usage,
                )

        yield StreamEvent(
            type=StreamEventType.MESSAGE_COMPLETE,
            finish_reason=finish_reason,
            usage=usage,
        )

    async def _non_stream_response(
        self, client: AsyncOpenAI, kwargs: dict[str, Any]
    ) -> StreamEvent:

        response = await client.chat.completions.create(**kwargs)
        choice = response.choices[0]
        message = choice.message

        text_delta = None
        if message.content:
            text_delta = TextDelta(content=message.content)

        if response.usage:
            usage = TokenUsage(
                prompt_tokens=response.usage.prompt_tokens,
                completion_tokens=response.usage.completion_tokens,
                total_tokens=response.usage.total_tokens,
                cached_tokens=response.usage.prompt_tokens_details.cached_tokens,
            )

        return StreamEvent(
            type=StreamEventType.MESSAGE_COMPLETE,
            text_delta=text_delta,
            finish_reason=choice.finish_reason,
            usage=usage,
        )
