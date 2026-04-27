function createSavedPresetsButton(savedPresets) {
    if (!savedPresets || savedPresets.length === 0) {
        return '';
    }

    return savedPresets.map(preset => {
        const button = document.createElement('button');
        button.className = 'quick-char-regex-saved-preset-button menu_button';
        
        button.dataset.method = preset.method;
        button.dataset.pattern = preset.pattern;
        button.dataset.replacement = preset.replacement;
        
        button.textContent = preset.name;
        
        return button;
    });
}

function createQuickCharRegexContainer(textareaId, savedPresets) { return (
    `
    <div class="quick-char-regex-container" id="quick-char-regex-container_${textareaId}">
        <input type="text"
            placeholder="Pattern"
            autocomplete="off"
            id="quick-char-regex-pattern-input_${textareaId}"
            class="text_pole quick-char-regex-pattern-input" />

        <input type="text"
            placeholder="Replacement"
            autocomplete="off"
            id="quick-char-regex-replacement-input_${textareaId}"
            class="text_pole quick-char-regex-replacement-input" />

        <div class="quick-char-regex-button-div">
            <button type="button"
                    id="quick-char-regex-replace-button_${textareaId}"
                    class="menu_button quick-char-regex-replace-button"
                    data-field-id="${textareaId}">
                Replace
            </button>
            <button type="button"
                    id="quick-char-regex-undo-button_${textareaId}"
                    class="menu_button quick-char-regex-undo-button"
                    data-field-id="${textareaId}"
                    data-undo-content=""
                    disabled>
                Undo
            </button>
        </div>

        <div class="quick-char-regex-saved-presets-container" id="quick-char-regex-saved-presets_${textareaId}">
            <p>Saved Presets:</p>
            ${createSavedPresetsButton(savedPresets)}
        </div>
    </div>
    `)
}

export { createQuickCharRegexContainer };