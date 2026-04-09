# SillyTavern-QuickCharRegex

**SillyTavern-QuickCharRegex** is a productivity extension for SillyTavern that allows you to perform bulk text replacements directly within the character editing interface. Instead of manually searching through long descriptions or personality fields, you can swap terms, fix names, or restructure text using simple strings or Regular Expressions (Regex) without leaving the page.

## Features

* **Contextual Controls:** Replacement tools appear automatically whenever you click into a character textarea.
* **Flexible Matching Modes:**
    * **Simple:** Direct string-to-string replacement.
    * **Regex:** Full Regular Expression support for advanced pattern matching.
    * **Whole Words:** Replaces only exact word matches.
    * **Combined Words:** Targets patterns that are adjacent to other word characters.
* **Safety First:** Built-in **Undo** button for every field to immediately revert the last change.
* **Universal Application:** Works across all character-related text fields (Description, Personality, Scenario, etc.).

---

## Installation

1. Open SillyTavern and navigate to the **Extensions** menu.
2. Select **Install Extension**.
3. Paste the URL of this repository:`https://github.com/Venomkajo/SillyTavern-QuickCharRegex`
4. Click **Install** and refresh your browser.

---

## Usage

### Getting Started
1. Open the **Character Menu** in SillyTavern.
2. Click the **Quick Regex** button (**RE**) in the avatar controls to open the settings menu.
3. Toggle the **Extension Active** checkbox to enable the tool.

### Performing a Replacement
Once activated, simply click inside any text field (like the character's Description). A small control panel will appear below the box:

1. **Pattern:** Enter the text or regex you want to find.
2. **Replacement:** Enter the text you want to swap in.
3. **Replace Button:** Click this to apply the changes instantly.
4. **Undo Button:** If you made a mistake, click "Undo" to restore the text to its state prior to the last replacement.

### Cleaning up the Interface
Disabling the extension will automatically remove all the replacement controls from the character editing interface, leaving no trace behind.

### Choosing the Right Method
In the extension settings menu, you can switch between different replacement methods:
- **Simple:** Great for changing a name (e.g., changing "John" to "Jonathan").
- **Regex:** For power users (e.g., using`\d+` to find all numbers in a bio).
- **Whole Words:** Use this if you want to change "Cat" but NOT "Category".

---

## Prerequisites

* **SillyTavern:** Tested on version 1.17.0. Should be compatible with any modern version of SillyTavern.