// Importing necessary functions and variables from the main extension script
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";

// Importing debounced save functions to save data immediately
import { saveSettingsDebounced, saveCharacterDebounced } from "../../../../script.js";

// Keep track of where your extension is located, name should match repo name
const extensionName = "SillyTavern-QuickCharRegex";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;
// Define default settings for your extension
const extensionSettings = extension_settings[extensionName];
const defaultSettings = { method: "simple", extensionActive: false };

const FORBIDDEN_FIELDS = ["send_textarea", "world_info_search", "settingsSearch"]

// Loads the extension settings if they exist, otherwise initializes them to the defaults.
async function loadSettings() {
  //Create the settings if they don't exist
  extension_settings[extensionName] = extension_settings[extensionName] || {};
  if (Object.keys(extension_settings[extensionName]).length === 0) {
    Object.assign(extension_settings[extensionName], defaultSettings);
  }

  // Updating settings in the UI
  $("#quick-char-regex-method-setting").val(extension_settings[extensionName].method).trigger("input");
  $("#quick-char-regex-field-setting").val(extension_settings[extensionName].field).trigger("input");
  $("#quick-char-regex-extension-active-checkbox").prop("checked", extension_settings[extensionName].extensionActive);
}

// These functions are called when the extension settings are changed in the UI
function onMethodSelect(event) {
  const method_value = $(event.target).val();
  extension_settings[extensionName].method = method_value;
  saveSettingsDebounced();
}

function onExtensionToggle() {
  extension_settings[extensionName].extensionActive = !extension_settings[extensionName].extensionActive;

  if (extension_settings[extensionName].extensionActive) {
    toastr.success("Quick Regex extension activated!");
  } else {
    toastr.success("Quick Regex extension deactivated!");
    document.querySelectorAll('.quick-char-regex-container').forEach(container => container.remove());
    document.querySelectorAll('textarea').forEach(textarea => delete textarea.dataset.quickRegexAdded);
  }

  saveSettingsDebounced();
}

function changeExtensionView() {
  $("#quick-char-regex-menu").toggle();
}


function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


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

  let field_content = $(`#` + fieldID).val();

  $("#quick-char-regex-undo-button_" + fieldID)[0].dataset.undoContent = field_content;

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

  $(`#` + fieldID).val(field_content);

  // simulate input event to trigger save
  const inputEvent = new Event('input', { bubbles: true });
  $(`#` + fieldID)[0].dispatchEvent(inputEvent);
  const changeEvent = new Event('change', { bubbles: true });
  $(`#` + fieldID)[0].dispatchEvent(changeEvent);

  saveCharacterDebounced();

  $("#quick-char-regex-undo-button_" + fieldID).prop("disabled", false);

  console.log("Replacement successful! Updated content:", field_content);
  toastr.success("Replacement complete!", "Your character has been updated.");

} catch (error) {
  console.error("Error during QuickCharRegex replace operation:", error);
  toastr.error("An error occurred while trying to perform the replacement. Please try again.", error);
}}

function addReplaceDiv(textarea) {
  const invalidDiv = 
    textarea.dataset.quickRegexAdded ||
    !extension_settings[extensionName].extensionActive ||
    FORBIDDEN_FIELDS.includes(textarea.id) ||
    !textarea.id;

  if (invalidDiv) {
    return;
  }

  const quickCharRegexContainer = document.createElement('div');
  quickCharRegexContainer.className = 'quick-char-regex-container';
  quickCharRegexContainer.id = `quick-char-regex-container_${textarea.id}`;

  const undoButton = document.createElement('button');
  undoButton.textContent = 'Undo';
  undoButton.type = 'button';
  undoButton.onclick = onUndoButtonClick;
  undoButton.classList.add('menu_button');
  undoButton.classList.add('quick-char-regex-undo-button');

  undoButton.id = `quick-char-regex-undo-button_${textarea.id}`;
  undoButton.dataset.fieldId = textarea.id;
  undoButton.dataset.undoContent = '';
  undoButton.disabled = true;

  const replaceButton = document.createElement('button');
  replaceButton.textContent = 'Replace';
  replaceButton.type = 'button';
  replaceButton.onclick = onReplaceButtonClick;
  replaceButton.classList.add('menu_button');
  replaceButton.classList.add('quick-char-regex-replace-button');

  replaceButton.id = `quick-char-regex-replace-button_${textarea.id}`;
  replaceButton.dataset.fieldId = textarea.id;

  const patternInput = document.createElement('input');
  patternInput.type = 'text';
  patternInput.placeholder = 'Pattern';
  patternInput.autocomplete = 'off';
  patternInput.id = `quick-char-regex-pattern-input_${textarea.id}`;
  patternInput.classList.add('text_pole');
  patternInput.classList.add('quick-char-regex-pattern-input');

  const replacementInput = document.createElement('input');
  replacementInput.type = 'text';
  replacementInput.placeholder = 'Replacement';
  replacementInput.autocomplete = 'off';
  replacementInput.id = `quick-char-regex-replacement-input_${textarea.id}`;
  replacementInput.classList.add('text_pole');
  replacementInput.classList.add('quick-char-regex-replacement-input');

  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'quick-char-regex-button-div';

  quickCharRegexContainer.appendChild(patternInput);
  quickCharRegexContainer.appendChild(replacementInput);

  buttonDiv.appendChild(replaceButton);
  buttonDiv.appendChild(undoButton);
  quickCharRegexContainer.appendChild(buttonDiv);

  textarea.insertAdjacentElement('afterend', quickCharRegexContainer);

  textarea.dataset.quickRegexAdded = 'true';
}

// This function is called when the extension is loaded
jQuery(async () => {
  // Loading HTML from a file
  const regexRowHTML = await $.get(`${extensionFolderPath}/regex_settings.html`);
  const extensionButtonHTML = await $.get(`${extensionFolderPath}/extension_button.html`);

  // Append the extension button to the menu
  $("#avatar_controls > div").children().last().before(extensionButtonHTML);

  // Append the HTML to the appropriate places in the DOM
  $("#form_sheld").before(regexRowHTML);

  // Listening for events
  $("#quick-char-regex-extension-button").on("click", changeExtensionView);
  $("#quick-char-regex-extension-active-checkbox").on("change", onExtensionToggle);
  $("#quick-char-regex-method-setting").on("input", onMethodSelect);

  document.addEventListener('focusin', (e) => {
  if (e.target.tagName === 'TEXTAREA') {
    addReplaceDiv(e.target);
  }
});

  // Load settings when starting extension up
  loadSettings();
});
