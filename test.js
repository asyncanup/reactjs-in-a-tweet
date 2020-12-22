const { readFileSync } = require('fs');

const files = process.argv.slice(2);
files.forEach(file => eval(readFileSync(file).toString()));
