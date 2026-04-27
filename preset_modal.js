import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

import { createMethodOptions } from "./regex_settings.js";

const extensionName = "SillyTavern-QuickCharRegex";

let formState = false; // false for closed, true for open

function removePreset() {
    const presetName = this.dataset.presetName;
    extension_settings[extensionName].savedPresets = extension_settings[extensionName].savedPresets.filter(preset => preset.name !== presetName);
    saveSettingsDebounced();
    openPresetModal();
}

function editPreset() {
    return;
}

function newPresetForm() { return (
    `
    <div class="quick-char-regex-new-preset-form">
        <input type="text" placeholder="Preset Name" class="text_pole quick-char-regex-new-preset-name" />
        <input type="text" placeholder="Pattern" class="text_pole quick-char-regex-new-preset-pattern" />
        <input type="text" placeholder="Replacement" class="text_pole quick-char-regex-new-preset-replacement" />
        <select class="quick-char-regex-new-preset-method">
            ${createMethodOptions()}
        </select>
        <button class="menu_button quick-char-regex-new-preset-save-button">Save Preset</button>
    </div>
    `)
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function escapeAttribute(value) {
    return escapeHtml(value);
}

function populatePresets() {
    if (!extension_settings[extensionName].savedPresets || extension_settings[extensionName].savedPresets.length === 0) {
        return '<tr><td colspan="5">No presets saved.</td></tr>';
    }
    return extension_settings[extensionName].savedPresets.map(preset => {
        const escapedName = escapeHtml(preset.name);
        const escapedMethod = escapeHtml(preset.method);
        const escapedPattern = escapeHtml(preset.pattern);
        const escapedReplacement = escapeHtml(preset.replacement);
        const escapedPresetNameAttribute = escapeAttribute(preset.name);
        return `
        <tr class="quick-char-regex-modal-preset-row">
            <td class="quick-char-regex-preset-name"><strong>${escapedName}</strong></td>
            <td class="quick-char-regex-preset-method">${escapedMethod}</td>
            <td class="quick-char-regex-preset-pattern"><code>${escapedPattern}</code></td>
            <td class="quick-char-regex-preset-replacement"><code>${escapedReplacement}</code></td>
            <td class="quick-char-regex-preset-actions">
                <button class="quick-char-regex-modal-preset-edit-button menu_button" data-preset-name="${escapedPresetNameAttribute}">
                    Edit
                </button>
                <button class="quick-char-regex-modal-preset-remove-button menu_button" data-preset-name="${escapedPresetNameAttribute}">
                    Remove
                </button>
            </td>
        </tr>
    `;
    }).join('');
}

function modalConstruction() { return (
    `
    <dialog class="quick-char-regex-modal popup">
        <div class="quick-char-regex-modal-body popup-body">
            <div class="quick-char-regex-modal-content popup-content">
                <h2>Preset Regular Expressions</h2>
                <div class="popup-controls">
                    <button class="quick-char-regex-preset-add-button popup-button-ok menu_button">ADD</button>
                </div>
                <div class="quick-char-regex-modal-preset-container">
                <table class="quick-char-regex-preset-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Method</th>
                            <th>Pattern</th>
                            <th>Replacement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${populatePresets()}
                    </tbody>
                </table>
                </div>
                <div class="popup-controls">
                    <button class="popup-button-cancel menu_button">Close</button>
                </div>
            </div>
        </div>
    </dialog>
    `)
}

function createPresetModal() {
    document.querySelector('.quick-char-regex-modal')?.remove();

    const modal = document.createElement('div');
    modal.innerHTML = modalConstruction();
    document.body.appendChild(modal.firstElementChild);
}

function openPresetModal() {
    createPresetModal();

    formState = false;

    const modal = document.querySelector('.quick-char-regex-modal');
    modal.showModal();

    const addButton = modal.querySelector('.quick-char-regex-preset-add-button');

    addButton.onclick = function() {
        if (formState) return;

        formState = true;
        addButton.disabled = true;

        const presetContainer = modal.querySelector('.quick-char-regex-modal-preset-container');
        const newPresetFormHTML = newPresetForm();
        presetContainer.insertAdjacentHTML('beforeend', newPresetFormHTML);

        const saveButton = presetContainer.querySelector('.quick-char-regex-new-preset-save-button');
        saveButton.onclick = function() {
            const newPresetElement = saveButton.closest('.quick-char-regex-new-preset-form');

            const name = newPresetElement.querySelector('.quick-char-regex-new-preset-name').value.trim();
            const pattern = newPresetElement.querySelector('.quick-char-regex-new-preset-pattern').value;
            const replacement = newPresetElement.querySelector('.quick-char-regex-new-preset-replacement').value;
            const method = newPresetElement.querySelector('.quick-char-regex-new-preset-method').value;

            if (!name || !pattern || !method) {
                alert('Name, pattern, and method are required.');
                return;
            } else if (extension_settings[extensionName].savedPresets.some(preset => preset.name === name)) {
                alert('Preset name must be unique.');
                return;
            } else {
                const newPreset = { name, pattern, replacement, method };
                extension_settings[extensionName].savedPresets.push(newPreset);
                saveSettingsDebounced();
                openPresetModal();
            }
        }
    }

    const removeButtons = modal.querySelectorAll('.quick-char-regex-modal-preset-remove-button');
    removeButtons.forEach(button => {
        button.onclick = removePreset;
    });

    const editButtons = modal.querySelectorAll('.quick-char-regex-modal-preset-edit-button');
    editButtons.forEach(button => {
        button.onclick = editPreset;
    });

    const closeButton = modal.querySelector('.popup-button-cancel');

    closeButton.onclick = function() {
        modal.close();
        modal.remove();
    }

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.close();
            modal.remove();
        }
    });
}

export { openPresetModal };