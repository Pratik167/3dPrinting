import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
mkdirSync('dist/server',{recursive:true});mkdirSync('dist/.openai',{recursive:true});
writeFileSync('dist/server/index.js','const page='+JSON.stringify(readFileSync('worker/ui.html','utf8'))+';\n'+readFileSync('worker/server.js','utf8'));
copyFileSync('.openai/hosting.json','dist/.openai/hosting.json');
