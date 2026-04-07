Since your game state and moves are handled via Supabase, the most efficient method is to bypass the browser UI entirely and have the agent interact directly with your Supabase database/API.
Here is the step-by-step architecture for the most efficient setup:
1. Create a "Headless" Game Client (Node.js or Python)
Instead of a browser frontend, write a simple script that acts as the game client. This script will use the Supabase SDK to connect to your database.
Authentication: Create three test users in Supabase Auth (e.g., bot1@test.com, bot2@test.com, bot3@test.com). Have your script log in as all three.
State Reading: The script fetches the current game state (board layout, tile positions, meeple locations) from your Supabase tables.
State Writing: The script pushes moves (e.g., "place tile at X,Y") directly to your Supabase tables or RPC functions, exactly as your frontend app would.
2. Format the Game State for the LLM
LLMs are terrible at looking at visual representations of boards, but they are incredibly good at reading JSON. Your headless client needs to translate the Supabase data into a clean, text-based prompt for the coding agent.
For example, your script will generate a prompt like this:
"You are Player 1 playing a tile-placement game. It is your turn.
The current board state is: [JSON representation of tiles and meeples].
You have 3 meeples remaining. You hold the following tiles: [JSON].
Based on the rules, output your next move in JSON format using this schema: {"action": "place_tile", "x": int, "y": int, "meeple_placed": boolean}."
3. Build the Orchestration Loop
You need a central loop in your script that manages the flow of the game, utilizing Supabase Realtime to know when turns change.
Listen: The script listens to Supabase Realtime for a change in the current_turn column in your games table.
Trigger: When it becomes Player 1's turn, the script pulls the latest game state.
Prompt: The script sends the state to the LLM API (OpenAI, Anthropic, or your local agent API).
Parse & Execute: The LLM returns a JSON move. The script parses it, validates it, and executes the move by writing to Supabase.
Repeat: Supabase registers the move, updates current_turn to Player 2, and the loop triggers for the next bot.
4. Implement a "Retry Loop" for Illegal Moves
LLMs will inevitably hallucinate and try to make illegal moves (e.g., placing a tile on an occupied space or using a meeple they don't have).
Your Supabase Row Level Security (RLS) policies or Postgres Functions should reject this move.
When Supabase returns an error, your script should catch it and feed it back to the agent:
"Error: Move invalid. Space X:2, Y:3 is already occupied. Please provide a different move."
Why is this the most efficient method?
Speed: API calls take milliseconds. Firing up three headless browsers, taking screenshots, and letting a vision model figure out where to click takes minutes per turn.
Cost: Text-based JSON prompts are vastly cheaper in LLM token costs than sending screenshots or massive blocks of HTML DOM.
Isolation of Game Logic: This method tests the actual math, logic, and database rules (RLS) of your game. If the bots can complete a game this way, you know your backend is 100% solid.