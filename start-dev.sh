#!/bin/bash

# KRED Multiplayer Development Startup Script
# Starts both server and client in separate terminal tabs/windows

echo "🎮 Starting KRED Multiplayer Development Servers"
echo "================================================"
echo ""

# Check if tmux is available
if command -v tmux &> /dev/null; then
    echo "Using tmux for split terminals..."
    
    # Create new tmux session
    tmux new-session -d -s kred-dev
    
    # Split window vertically
    tmux split-window -h
    
    # Run server in left pane
    tmux send-keys -t kred-dev:0.0 'cd /var/www/fly.on/_KRED && npm run dev:server' C-m
    
    # Run client in right pane
    tmux send-keys -t kred-dev:0.1 'cd /var/www/fly.on/_KRED && npm run dev:client' C-m
    
    # Attach to session
    tmux attach -t kred-dev
    
elif command -v gnome-terminal &> /dev/null; then
    echo "Using gnome-terminal..."
    
    # Server terminal
    gnome-terminal --tab --title="KRED Server" -- bash -c "cd /var/www/fly.on/_KRED && npm run dev:server; exec bash"
    
    # Client terminal
    gnome-terminal --tab --title="KRED Client" -- bash -c "cd /var/www/fly.on/_KRED && npm run dev:client; exec bash"
    
else
    echo "⚠️  Could not detect terminal multiplexer (tmux or gnome-terminal)"
    echo ""
    echo "Please start servers manually in separate terminals:"
    echo ""
    echo "Terminal 1:"
    echo "  cd /var/www/fly.on/_KRED"
    echo "  npm run dev:server"
    echo ""
    echo "Terminal 2:"
    echo "  cd /var/www/fly.on/_KRED"
    echo "  npm run dev:client"
fi
