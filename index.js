// Importing necessary functions and variables from the main extension script
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

// Importing debounced save functions to save data immediately
import { saveSettingsDebounced, saveCharacterDebounced } from "../../../../script.js";

// Importing custom functions
import { openPresetModal } from "./preset_modal.js";
import { createQuickCharRegexContainer } from "./regex_container.js";
import { createRegexSettingsMenu } from "./regex_settings.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavern-QuickCharRegex";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
// Define default settings for your extension
const extensionSettings = extension_settings[extensionName];
const defaultSettings = { method: "simple", extensionActive: false, onlyMainChat: false , savedPresets: []};

// schema for saved presets: { name: string, method: string, pattern: string, replacement: string }

const FORBIDDEN_FIELDS = ["send_textarea", "world_info_search", "settingsSearch"]

// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};

  extension_settings[extensionName] = { ...defaultSettings, ...extension_settings[extensionName] };

  // Updating settings in the UI
  $("#quick-char-regex-method-setting").val(extension_settings[extensionName].method).trigger("input");
  $("#quick-char-regex-extension-active-checkbox").prop("checked", extension_settings[extensionName].extensionActive);
  $("#quick-char-regex-only-main-chat-checkbox").prop("checked", extension_settings[extensionName].onlyMainChat);
}

// These functions are called when the extension settings are changed in the UI
function onMethodSelect(event) {
  const method_value = $(event.target).val();
  extension_settings[extensionName].method = method_value;
  saveSettingsDebounced();
}

// This function is called when the extension toggle is changed in the UI
function onExtensionToggle() {
  extension_settings[extensionName].extensionActive = !extension_settings[extensionName].extensionActive;

  if (extension_settings[extensionName].extensionActive) {
    toastr.success("Quick Regex extension activated!");
  } else {
    toastr.success("Quick Regex extension deactivated!");
    cleanReplaceDivs();
  }

  saveSettingsDebounced();
}

// This function is called when the "Only Main Chat" toggle is changed in the UI
function onOnlyMainChatToggle() {
  extension_settings[extensionName].onlyMainChat = !extension_settings[extensionName].onlyMainChat;
  cleanReplaceDivs();
  saveSettingsDebounced();
}

// This function is called when the extension button is clicked in the UI
function changeExtensionView() {
  $("#quick-char-regex-menu").toggle();
}

// Utility function to escape special characters in a string for use in a regular expression
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// This function removes all the replace divs from the page and resets the data attribute on textareas
function cleanReplaceDivs() {
  document.querySelectorAll('.quick-char-regex-container').forEach(container => container.remove());
  document.querySelectorAll('textarea').forEach(textarea => delete textarea.dataset.quickRegexAdded);
}

// This function is called when the "Undo" button is clicked
function onUndoButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();

  try {
  const fieldID = this.dataset.fieldId;
  const undoContent = this.dataset.undoContent;

  $(`#` + fieldID).val(undoContent);

  saveCharacterDebounced();

  $("#quick-char-regex-undo-button_" + fieldID).prop("disabled", true);

  console.log("Undo successful! Reverted content:", undoContent);
  toastr.success("Undo successful!", "The last replacement has been reverted.");

} catch (error) {
  console.error("Error during QuickCharRegex undo operation:", error);
  toastr.error("An error occurred while trying to undo the last operation. Please try again.", error);
}}

// This function is called when the "Replace" button is clicked
function onReplaceButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();

  try {
  const fieldID = this.dataset.fieldId;

  const pattern = $("#quick-char-regex-pattern-input_" + fieldID).val();
  const replacement = $("#quick-char-regex-replacement-input_" + fieldID).val();
  const method = extension_settings[extensionName].method;

  let fieldContent = $(`#` + fieldID).val();

  $("#quick-char-regex-undo-button_" + fieldID)[0].dataset.undoContent = fieldContent;

  if (method === "regex") {
    const regex = new RegExp(pattern, "g");
    fieldContent = fieldContent.replace(regex, replacement);
  } else if (method === "simple") {
    const regex = new RegExp(escapeRegExp(pattern), "g");
    fieldContent = fieldContent.replace(regex, replacement);
  } else if (method === "whole-words") {
    const regex = new RegExp(`(?<!\\w)${escapeRegExp(pattern)}(?!\\w)`, "g");
    fieldContent = fieldContent.replace(regex, replacement);
  } else if (method === "combined-words") {
    const regex = new RegExp(`(?<=\\w)${escapeRegExp(pattern)}|${escapeRegExp(pattern)}(?=\\w)`, "g");
    fieldContent = fieldContent.replace(regex, replacement);
  }

  $(`#` + fieldID).val(fieldContent);

  // simulate input event to trigger save
  const inputEvent = new Event('input', { bubbles: true });
  $(`#` + fieldID)[0].dispatchEvent(inputEvent);
  const changeEvent = new Event('change', { bubbles: true });
  $(`#` + fieldID)[0].dispatchEvent(changeEvent);

  saveCharacterDebounced();

  $("#quick-char-regex-undo-button_" + fieldID).prop("disabled", false);

  console.log("Replacement successful! Updated content:", fieldContent);
  toastr.success("Replacement complete!", "Your character has been updated.");

} catch (error) {
  console.error("Error during QuickCharRegex replace operation:", error);
  toastr.error("An error occurred while trying to perform the replacement. Please try again.", error);
}}

// This function adds the replace div with inputs and buttons after a textarea, if it meets the criteria
function addReplaceDiv(textarea) {
  const invalidDiv = 
    textarea.dataset.quickRegexAdded ||
    !extension_settings[extensionName].extensionActive ||
    (extension_settings[extensionName].onlyMainChat && textarea.id !== "curEditTextarea") ||
    FORBIDDEN_FIELDS.includes(textarea.id) ||
    !textarea.id;

  if (invalidDiv) {
    return;
  }

  const quickCharRegexContainer = createQuickCharRegexContainer(textarea.id, extension_settings[extensionName].savedPresets);

  textarea.insertAdjacentHTML('afterend', quickCharRegexContainer);

  const container = document.getElementById(
      `quick-char-regex-container_${textarea.id}`
  );

  container.querySelector('.quick-char-regex-replace-button').addEventListener('click', onReplaceButtonClick);
  container.querySelector('.quick-char-regex-undo-button').addEventListener('click', onUndoButtonClick);

  textarea.dataset.quickRegexAdded = 'true';
}

// This function is called when the extension is loaded
jQuery(async () => {
  // Loading HTML from a file
  const regexRowHTML = createRegexSettingsMenu();
  const extensionButtonHTML = await $.get(`${extensionFolderPath}/extension_button.html`);

  // Append the extension button to the menu
  $("#extensionsMenu").append(extensionButtonHTML);

  // Append the HTML to the appropriate places in the DOM
  $("#form_sheld").before(regexRowHTML);

  // Listening for events
  $("#quick-char-regex-extension-button").on("click", changeExtensionView);

  $("#quick-char-regex-extension-active-checkbox").on("change", onExtensionToggle);
  $("#quick-char-regex-only-main-chat-checkbox").on("change", onOnlyMainChatToggle);
  $("#quick-char-regex-method-setting").on("input", onMethodSelect);

  $("#quick-char-regex-clean-button").on("click", cleanReplaceDivs);
  $("#quick-char-regex-preset-menu-button").on("click", openPresetModal);

  $("#quick-char-regex-add-to-all-button").on("click", () => {
    document.querySelectorAll('textarea').forEach(textarea => addReplaceDiv(textarea));
  });

  document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'TEXTAREA') {
    addReplaceDiv(e.target);
  }
});

  // Load settings when starting extension up
  loadSettings();
});
