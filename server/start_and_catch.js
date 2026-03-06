const { spawn } = require('child_process');
const fs = require('fs');

const child = spawn('node', ['index.js'], { cwd: __dirname });

let logs = '';

child.stdout.on('data', data => { logs += data.toString(); });
child.stderr.on('data', data => { logs += data.toString(); });

child.on('close', code => {
    fs.writeFileSync('server_crash.txt', `Exited with code ${code}\nLogs:\n${logs}`);
    console.log('Server process ended. Logs written to server_crash.txt');
});

setTimeout(() => {
    if (logs) fs.writeFileSync('server_crash.txt', `Running...\nLogs:\n${logs}`);
    child.kill();
}, 2000);
