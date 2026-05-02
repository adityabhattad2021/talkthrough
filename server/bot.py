from dotenv import load_dotenv

import src.debug_routes  # noqa: F401
from src.session import bot_main

load_dotenv(override=True)


async def bot(runner_args):
    await bot_main(runner_args)


if __name__ == "__main__":
    from pipecat.runner.run import main

    main()
