import asyncio
from client.llm_client import LLMClient
import click
from typing import Any


class CLI:
    def __init__(self):
        pass

    def run_single(self):
        pass


async def run(messages: list[dict[str, Any]]):
    client = LLMClient()
    async for event in client.chat_completion(messages, False):
        print(event)


@click.command()
@click.argument(
    "prompt", required=False
)  # false because we want to open a TUI with just command brim and not brim --prompt "bla bla blaa" everytime
def main(
    prompt: str | None,
):
    print(prompt)
    messages = [{"role": "user", "content": prompt}]
    asyncio.run(run(messages))
    print("done")


if __name__ == "__main__":
    main()
