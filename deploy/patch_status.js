const fs = require('fs');
let c = fs.readFileSync('deploy/clean_localseed.js', 'utf8');
c = c.replace("'2026-03-29', 'COMPLETED',", "'2026-03-29', 'RECEIVED',");
fs.writeFileSync('deploy/clean_localseed.js', c);
