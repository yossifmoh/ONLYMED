const fs = require('fs');
const path = require('path');

const dir = 'e:/Downloads/ONLYMED';

// Create directories
['css', 'js', 'assets'].forEach(f => {
    if (!fs.existsSync(path.join(dir, f))) {
        fs.mkdirSync(path.join(dir, f));
    }
});

// Move files
const moveFile = (src, dest) => {
    if (fs.existsSync(path.join(dir, src))) {
        fs.renameSync(path.join(dir, src), path.join(dir, dest));
    }
};

moveFile('style.css', 'css/style.css');
moveFile('script.js', 'js/main.js');

// Move images to assets
const files = fs.readdirSync(dir);
files.forEach(file => {
    if (file.startsWith('ONLYMED Logo') && (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))) {
        moveFile(file, `assets/${file}`);
    }
});

// Update index.html paths
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
html = html.replace(/href="style\.css"/g, 'href="css/style.css"');
html = html.replace(/src="script\.js"/g, 'src="js/main.js"');
html = html.replace(/src="ONLYMED Logo RGB AI\.png"/g, 'src="assets/ONLYMED Logo RGB AI.png"');

fs.writeFileSync(path.join(dir, 'index.html'), html);

console.log('Files organized successfully!');
