const https = require('https');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const args = process.argv.splice(2);

function getOs4Link(arg) {
    const map = {
        'win32': 'win32-x64-user',
        'linux': 'linux-deb-x64'
    };
    map.exe = map.win32;
    map.deb = map.linux;
    map.rpm = 'linux-rpm-x64';
    return map[arg] || map[os.platform()] || map.linux;
}

function getLink(arg) {
    return new Promise(resolve => {
        https.get(`https://code.visualstudio.com/sha/download?build=stable&os=${getOs4Link(arg)}`, response => {
            let link = response.headers.location;
            let host = new URL(link).host;
            let cdnHost = 'vscode.cdn.azure.cn';
            let cdnLink = link.replace(host, cdnHost);
            resolve(cdnLink);
        });
    });
}

function download(link) {
    const curl = spawn('curl', ['-#', '-O', link]);
    const stdLog = data => process.stdout.write(data.toString());
    curl.stdout.on('data', stdLog);
    curl.stderr.on('data', stdLog);
    curl.on('close', () => {
        const fileName = path.basename(link);
        console.log(`下载 ${fileName} 完成`)
    });
}

getLink(args[0]).then(download);