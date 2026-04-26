import { extension_settings } from "../../../extensions.js";

const extensionName = "SillyTavern-QuickCharRegex";
let savedPresets = extension_settings[extensionName].savedPresets;

function populatePresets() {
    if (!savedPresets || savedPresets.length === 0) {
        return '<p>No presets saved.</p>';
    }

    return savedPresets.map(preset => `
        <div class="quick-char-regex-modal-preset">
            <span class="quick-char-regex-modal-preset-name">${preset.name}</span>
            <span class="quick-char-regex-modal-preset-method">${preset.method}</span> 
            <span class="quick-char-regex-modal-preset-pattern">${preset.pattern}</span>
            <span class="quick-char-regex-modal-preset-replacement">${preset.replacement}</span>
            <button class="quick-char-regex-modal-preset-remove-button" data-preset-name="${preset.name}">Remove</button>
            <button class="quick-char-regex-modal-preset-edit-button" data-preset-name="${preset.name}">Edit</button>
        </div>
    `).join('');
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
                    ${populatePresets()}
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

    const modal = document.querySelector('.quick-char-regex-modal');
    modal.showModal();

    const closeButton = modal.querySelector('.popup-button-cancel');

    closeButton.onclick = function() {
        modal.close();
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.close();
        }
    }
}

export { createPresetModal, openPresetModal };