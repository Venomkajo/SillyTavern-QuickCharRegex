// Importing necessary functions and variables from the main extension script
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

// Importing debounced save functions to save data immediately
import { saveSettingsDebounced, saveCharacterDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavern-QuickCharRegex";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
// Define default settings for your extension
const extensionSettings = extension_settings[extensionName];
const defaultSettings = { method: "simple", field: "description" };

// Define valid fields and their corresponding selectors
const validFields = { description: "#description_textarea", first_mes: "#firstmessage_textarea", mes_example: "#mes_example_textarea", scenario: "#scenario_pole", personality: "#personality_textarea" };

let undoContent = [];
let undoField = [];

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
function onMethodSelect(event) {
  const method_value = $(event.target).val();
  extension_settings[extensionName].method = method_value;
  saveSettingsDebounced();
}

function onFieldSelect(event) {
  const selectedField = $(event.target).val();
  extension_settings[extensionName].field = selectedField;
  saveSettingsDebounced();
}

function onUndoButtonClick() {
  try {
  if (undoContent.length > 0 && undoField.length > 0 && undoContent.length === undoField.length) {

    for (let i = 0; i < undoField.length; i++) {
    const fieldSelector = validFields[undoField[i]];
    $(fieldSelector).val(undoContent[i]);
  }

    undoContent = [];
    undoField = [];

    saveCharacterDebounced();

    toastr.success("Undo successful!", "Your character has been reverted to the previous state.");

    $("#undo-button").prop("disabled", true);
  } else {
    toastr.warning("Nothing to undo!", "There are no recent changes to revert.");
    
    undoContent = [];
    undoField = [];
  }
} catch (error) {
  console.error("Error during undo operation:", error);
  toastr.error("An error occurred while trying to undo the last operation. Please try again.", error);
}}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function changeExtensionView() {
  $("#quick-regex-menu").toggle();
}

// This function is called when the "Replace" button is clicked
function onReplaceButtonClick() {
  try {
  const pattern = $("#regex-pattern-input").val();
  const replacement = $("#replacement-string-input").val();
  const method = extension_settings[extensionName].method;
  const context = getContext();

  let fieldsToUpdate = [];

  if (extension_settings[extensionName].field === "all") {
    fieldsToUpdate = Object.keys(validFields);
  } else {
    fieldsToUpdate = [extension_settings[extensionName].field];
  }

  fieldsToUpdate.forEach(field => {
    let field_content = context.characters[context.characterId][field];

    undoContent.push(field_content); // Store the original content for undo functionality
    undoField.push(field); // Store the field being modified for undo functionality

    if (method === "regex") {
      const regex = new RegExp(pattern, "g");
      field_content = field_content.replace(regex, replacement);
    } else if (method === "simple") {
      const regex = new RegExp(escapeRegExp(pattern), "g");
      field_content = field_content.replace(regex, replacement);
    } else if (method === "whole-words") {
      const regex = new RegExp(`(?<!\\w)${escapeRegExp(pattern)}(?!\\w)`, "g");
      field_content = field_content.replace(regex, replacement);
    } else if (method === "combined-words") {
      const regex = new RegExp(`(?<=\\w)${escapeRegExp(pattern)}|${escapeRegExp(pattern)}(?=\\w)`, "g");
      field_content = field_content.replace(regex, replacement);
    }

    const fieldSelector = validFields[field];
    if (fieldSelector) {
      $(fieldSelector).val(field_content);
    }
  });

  saveCharacterDebounced();

  toastr.success("Replacement complete!", "Your character has been updated.");

  $("#undo-button").prop("disabled", false);
} catch (error) {
  console.error("Error during replace operation:", error);
  toastr.error("An error occurred while trying to perform the replacement. Please try again.", error);
}}



// This function is called when the extension is loaded
jQuery(async () => {
  // Loading HTML from a file
  const regexRowHTML = await $.get(`${extensionFolderPath}/regex_row.html`);
  const extensionButtonHTML = await $.get(`${extensionFolderPath}/extension_button.html`);

  // Append the extension button to the menu
  $("#avatar_controls > div").children().last().before(extensionButtonHTML);

  // Append the HTML to the appropriate places in the DOM
  $("#form_sheld").before(regexRowHTML);

  // Listening for events
  $("#extension_button").on("click", changeExtensionView);
  $("#regex-replace-button").on("click", onReplaceButtonClick);
  $("#method-setting").on("input", onMethodSelect);
  $("#field-setting").on("change", onFieldSelect);
  $("#undo-button").on("click", onUndoButtonClick);

  if (undoContent == null || undoField == null) {
    $("#undo-button").prop("disabled", true);
  }

  // Load settings when starting things up
  loadSettings();
});
