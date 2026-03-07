// Importing necessary functions and variables from the main extension script
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

// Importing debounced save functions to save data immediately
import { saveSettingsDebounced, saveCharacterDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavern-QuickCharRegex";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
// Define default settings for your extension
const extensionSettings = extension_settings[extensionName];
const defaultSettings = {method: "simple", field: "description"};

// Define valid fields and their corresponding selectors
const validFields = {description: "#description_textarea", first_mes: "#first_message_textarea", mes_example: "#mes_example_textarea", scenario: "#scenario_pole", personality: "#personality_textarea"};


 
// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Updating settings in the UI
  $("#method-setting").val(extension_settings[extensionName].method).trigger("input");
  $("#field-setting").val(extension_settings[extensionName].field).trigger("input");
}

// These functions are called when the extension settings are changed in the UI
function onMethodInput(event) {
  const method_value = $(event.target).val();
  extension_settings[extensionName].method = method_value;
  saveSettingsDebounced();
}

function onFieldSelect(event) {
  const selectedField = $(event.target).val();
  extension_settings[extensionName].field = selectedField;
  saveSettingsDebounced();
}

// This function is called when the "Replace" button is clicked
function onReplaceButtonClick() {
  const pattern = $("#regex-pattern-input").val();
  const replacement = $("#replacement-string-input").val();
  const method = extension_settings[extensionName].method;
  const context = getContext();

  try {
  if (pattern && replacement && context && method && context.characters[context.characterId]) {
  let field = context.characters[context.characterId][extension_settings[extensionName].field];

  // Perform the replacement based on the selected method
  if (method === "regex") {
    const regex = new RegExp(pattern, "g");
    field = field.replace(regex, replacement);
  } else {
    field = field.replaceAll(pattern, replacement);
  }

  // Update the character's field chosen in the settings
  const fieldSelector = validFields[extension_settings[extensionName].field];
  if (fieldSelector) {
    $(fieldSelector).val(field);
  }

  saveCharacterDebounced();

  toastr.success("Replacement complete!", "Your character has been updated.");

  }
  } catch (error) {
    toastr.error(error.message, "Error");
    return;
  }
}

// This function is called when the extension is loaded
jQuery(async () => {
  // Loading HTML from a file
  const regexRowHTML = await $.get(`${extensionFolderPath}/regex_row.html`);

  // Append the HTML to the appropriate places in the DOM
  $("#personality_div").before(regexRowHTML);

  // Listening for events
  $("#regex-replace-button").on("click", onReplaceButtonClick);
  $("#method-setting").on("input", onMethodInput);
  $("#field-setting").on("change", onFieldSelect);

  // Load settings when starting things up
  loadSettings();
});
