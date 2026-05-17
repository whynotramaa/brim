import asyncio
import sys
import click
from typing import Any
from agent.agent import Agent
from agent.events import AgentEventType

from ui.tui import TUI
from ui.tui import get_console

console = get_console()


class CLI:
    def __init__(self):
        self.agent: Agent | None = None
        self.tui = TUI(console)

    async def run_single(self, message: str) -> str | None:
        async with Agent() as agent:
            self.agent = agent
            return await self._process_msg(message)

    async def _process_msg(self, message: str) -> str | None:
        if not self.agent:
            print("Agent not initialized")
            return None

        assistant_streaming = False

        final_response: str | None = None

        async for event in self.agent.run(message):
            if event.type == AgentEventType.TEXT_DELTA:
                content = event.data.get("content", "")

                if not assistant_streaming:
                    self.tui.begin_assistant()
                    assistant_streaming = True

                self.tui.stream_assistant_delta(content)

            elif event.type == AgentEventType.TEXT_COMPLETE:
                final_response = event.data.get("content", "\n")
                if assistant_streaming:
                    self.tui.end_assistant()
                    assistant_streaming = False

            elif event.type == AgentEventType.AGENT_ERROR:
                error_message = event.data.get("error", "Unknown error")

                # NOT STOPPING STREAMING ON ERROR BECAUSE WE WANT TO SHOW THE ERROR MESSAGE IN THE TUI, AND IF WE STOP THE STREAM THEN WE CANT SHOW IT IN THE TUI. INSTEAD WE JUST PRINT IT OUT IN THE CONSOLE AND EXIT THE PROGRAM. THIS IS A TEMPORARY SOLUTION UNTIL WE IMPLEMENT BETTER ERROR HANDLING IN THE TUI.
                # if assistant_streaming:
                #     self.tui.end_assistant()
                #     assistant_streaming = False

                console.print(f"[error]Agent error: {error_message}[/error]")
                details = event.data.get("details")
                if details:
                    console.print(f"[dim]Details: {details}[/dim]")
                return None

        return final_response


@click.command()
@click.argument(
    "prompt", required=False
)  # false because we want to open a TUI with just command brim and not brim --prompt "bla bla blaa" everytime
def main(
    prompt: str | None,
):
    cli = CLI()
    # messages = [{"role": "user", "content": prompt}]
    if prompt:
        result = asyncio.run(cli.run_single(prompt))
        if result is None:
            sys.exit(1)
    print("\n")


if __name__ == "__main__":
    main()
