// The main script for the extension
// The following are examples of some basic extension functionality

//You'll likely need to import extension_settings, getContext, and loadExtensionSettings from extensions.js
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

//You'll likely need to import some other functions from the main script
import { saveSettingsDebounced, saveCharacterDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavern-QuickCharRegex";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {"method": "simple"};


 
// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Updating settings in the UI
  $("#method-setting").val(extension_settings[extensionName].method).trigger("input");
}

// This function is called when the extension settings are changed in the UI
function onMethodInput(event) {
  const method_value = $(event.target).val();
  extension_settings[extensionName].method = method_value;
  saveSettingsDebounced();
}

function onReplaceButtonClick() {
  const pattern = $("#regex-pattern-input").val();
  const replacement = $("#replacement-string-input").val();
  const method = extension_settings[extensionName].method;
  const context = getContext();

  try {
  if (pattern && replacement && context && method && context.characters[context.characterId]) {
  let description = context.characters[context.characterId].description;

  if (method === "regex") {
    const regex = new RegExp(pattern, "g");
    description = description.replace(regex, replacement);
  } else {
    description = description.replaceAll(pattern, replacement);
  }

  $("#description_textarea").val(description);

  saveCharacterDebounced();

  toastr.success("Replacement complete!", "Your character has been updated.");

  }
  } catch (error) {
    toastr.error("An error occurred while performing the replacement. Please check your pattern and try again.", "Error");
    return;
  }
}

// This function is called when the extension is loaded
jQuery(async () => {
  // This is an example of loading HTML from a file
  const regexRowHTML = await $.get(`${extensionFolderPath}/regex_row.html`);
  const settingsHTML = await $.get(`${extensionFolderPath}/settings.html`);

  // Append settingsHtml to extensions_settings
  // extension_settings and extensions_settings2 are the left and right columns of the settings menu
  // Left should be extensions that deal with system functions and right should be visual/UI related 
  $("#extensions_settings").append(settingsHTML);
  $("#description_div").append(regexRowHTML);

  // These are examples of listening for events
  $("#regex-replace-button").on("click", onReplaceButtonClick);
  $("#method-setting").on("input", onMethodInput);

  // Load settings when starting things up (if you have any)
  loadSettings();
});
