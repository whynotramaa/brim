from __future__ import annotations
from typing import AsyncGenerator
from client.llm_client import LLMClient
from agent.events import AgentEvent
from agent.events import AgentEventType
from client.response import StreamEventType
from context.manager import ContextManager


class Agent:
    def __init__(self):
        self.client = LLMClient()
        self.context_manager = ContextManager()

    async def run(self, prompt: str) -> AsyncGenerator[AgentEvent, None]:
        final_response = ""

        # initial event to indicate agent has started
        yield AgentEvent.agent_start(f"Agent started with prompt: {prompt}")

        self.context_manager.add_user_message(prompt)

        # TODo -> add user message to context

        # main agentic loop
        async for event in self._agentic_loop():
            yield event

            if event.type == AgentEventType.TEXT_COMPLETE:
                final_response = event.data.get("content", "")

        yield AgentEvent.agent_end(final_response)

    async def _agentic_loop(self) -> AsyncGenerator[AgentEvent, None]:

        response = ""

        async for event in self.client.chat_completion(
            self.context_manager.get_messages(), True
        ):  # set False for non-streaming IMPORTANTTTTTTTTTT
            if event.type == StreamEventType.TEXT_DELTA:
                if event.text_delta:
                    yield AgentEvent.text_delta(event.text_delta.content)
                    response += event.text_delta.content

            elif event.type == StreamEventType.MESSAGE_COMPLETE:
                # Non-streaming response: if it contains text, emit it as a delta
                if event.text_delta:
                    yield AgentEvent.text_delta(event.text_delta.content)
                    response += event.text_delta.content

                # If the message indicates an error, surface it as an agent error
                if getattr(event, "error", None):
                    yield AgentEvent.agent_error(event.error)

            elif event.type == StreamEventType.ERROR:
                yield AgentEvent.agent_error(event.error or " Unknown error occurred ")

        self.context_manager.add_assistant_message(response or None)

        if response:
            yield AgentEvent.text_complete(response)

    async def __aenter__(self) -> Agent:
        # setup resources if needed
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        # cleanup resources if needed
        if self.client:
            await self.client.close()
            self.client = None
