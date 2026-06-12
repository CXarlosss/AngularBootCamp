#!/bin/bash

BASE="src/portfolios/parallax"

echo "Creating Parallax structure..."

mkdir -p $BASE/layout
mkdir -p $BASE/system
mkdir -p $BASE/data
mkdir -p $BASE/hooks

# ----------------------------
# Layout files
# ----------------------------

touch $BASE/layout/ParallaxPortfolio.jsx
touch $BASE/layout/ParallaxPortfolio.css

touch $BASE/layout/ParallaxCanvas.jsx
touch $BASE/layout/ParallaxCanvas.css

# ----------------------------
# System files
# ----------------------------

touch $BASE/system/UniverseLayout.jsx
touch $BASE/system/UniverseLayout.css

touch $BASE/system/UniverseLayer.jsx
touch $BASE/system/UniverseLayer.css

touch $BASE/system/UniverseNode.jsx
touch $BASE/system/UniverseNode.css

touch $BASE/system/UniverseConnections.jsx
touch $BASE/system/UniverseConnections.css

touch $BASE/system/InspectorPanel.jsx
touch $BASE/system/InspectorPanel.css

# ----------------------------
# Data
# ----------------------------

touch $BASE/data/universeData.js

# ----------------------------
# Hooks
# ----------------------------

touch $BASE/hooks/useUniverseLayout.js
touch $BASE/hooks/useConnections.js

# ----------------------------
# Global & Variables
# ----------------------------

touch $BASE/parallax.variables.css
touch $BASE/parallax.global.css

echo "Parallax structure created successfully."