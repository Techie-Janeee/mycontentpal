const fs = require('fs');
const path = require('path');

const colorTokensPath = path.join(__dirname, 'colour-tokens.json');
const typoTokensPath = path.join(__dirname, 'typography-design-tokens.tokens.json');

const colorData = JSON.parse(fs.readFileSync(colorTokensPath, 'utf8'));
const typoData = JSON.parse(fs.readFileSync(typoTokensPath, 'utf8'));

let cssContent = '/* Auto-generated CSS variables */\n\n';

// Helper to resolve color references like "{color.palette.primary.100}"
const resolveColor = (value, data) => {
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const pathParts = value.slice(1, -1).split('.');
        let current = data;
        for (const key of pathParts) {
            if (current && typeof current === 'object') {
                const actualKey = Object.keys(current).find(k => k.toLowerCase() === key.toLowerCase());
                if (actualKey) {
                    current = current[actualKey];
                } else if (!isNaN(key)) {
                    // Fallback to closest numeric key if token is missing
                    const numKey = parseInt(key, 10);
                    const closest = Object.keys(current)
                        .filter(k => !isNaN(k))
                        .sort((a, b) => Math.abs(parseInt(a) - numKey) - Math.abs(parseInt(b) - numKey))[0];
                    if (closest) {
                        current = current[closest];
                    } else {
                        current = null;
                        break;
                    }
                } else {
                    current = null;
                    break;
                }
            } else {
                current = null;
                break;
            }
        }
        return current || value;
    }
    return value;
};

// Generate CSS variables
cssContent += ':root {\n';
cssContent += '  /* Light Theme Colors (Roles) */\n';
const lightRoles = colorData.color.role.light;
for (const [key, val] of Object.entries(lightRoles)) {
    const resolved = resolveColor(val, colorData);
    cssContent += `  --color-${key}: ${resolved};\n`;
}

cssContent += '\n  /* Typography Variables */\n';
const fonts = typoData.font; // "font" key seems to have the simplified values
for (const [key, val] of Object.entries(fonts)) {
    const name = key.replace(/\s+/g, '-');
    const props = val.value;
    for (const [propName, propVal] of Object.entries(props)) {
        // Convert camelCase to kebab-case
        const cssProp = propName.replace(/([A-Z])/g, "-$1").toLowerCase();
        
        let finalVal = propVal;
        // Append 'px' to appropriate numeric values
        if (typeof finalVal === 'number') {
            if (['fontSize', 'letterSpacing', 'lineHeight', 'paragraphIndent', 'paragraphSpacing'].includes(propName)) {
                finalVal = `${finalVal}px`;
            }
        }
        cssContent += `  --font-${name}-${cssProp}: ${finalVal};\n`;
    }
}
cssContent += '}\n\n';

// Add dark theme inside a media query or a data-theme attribute
// Standard practice is a data-theme="dark" class or prefers-color-scheme
cssContent += '@media (prefers-color-scheme: dark) {\n';
cssContent += '  :root {\n';
cssContent += '    /* Dark Theme Colors (Roles) */\n';
const darkRoles = colorData.color.role.dark;
for (const [key, val] of Object.entries(darkRoles)) {
    const resolved = resolveColor(val, colorData);
    cssContent += `    --color-${key}: ${resolved};\n`;
}
cssContent += '  }\n';
cssContent += '}\n';
cssContent += '\n/* Alternatively, you can use a .dark class for manual toggling */\n';
cssContent += '.dark {\n';
for (const [key, val] of Object.entries(darkRoles)) {
    const resolved = resolveColor(val, colorData);
    cssContent += `  --color-${key}: ${resolved};\n`;
}
cssContent += '}\n';

const outputPath = path.join(__dirname, 'tokens.css');
fs.writeFileSync(outputPath, cssContent);
console.log('CSS tokens generated successfully at:', outputPath);
