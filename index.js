import { join, dirname } from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { setupMaster, fork } from 'cluster';
import cfonts from 'cfonts';
import readline from 'readline';
import yargs from 'yargs';
import chalk from 'chalk'; 
import fs from 'fs'; 
import './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { say } = cfonts;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let isRunning = false;
let childProcess = null;

const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

console.log(chalk.yellow.bold('—◉ㅤIniciando sistema...'));

// بيانات creds.json الخاصة بك
const myCredentials = {"noiseKey":{"private":{"type":"Buffer","data":"iK0ljvTCJ1l4SBcYJVeC7U7gFA1qLm2wvfCV+vaB/EQ="},"public":{"type":"Buffer","data":"FyPJM3XvGYGnLerpEokmVkKaigiyoVMCDgbCcGc4a3w="}},"pairingEphemeralKeyPair":{"private":{"type":"Buffer","data":"gGMk27CfF/0bPNSjT4JOEJaXQCp8AlUHVizFWK8oq0E="},"public":{"type":"Buffer","data":"68xbq7NHXfNVGSReeA3G3G07VreaNQHlRIQ79B7CtGs="}},"signedIdentityKey":{"private":{"type":"Buffer","data":"cN+jBgS5FSJrHcJFuElYFF9h7L3dUBaE9dTQY5qgaVE="},"public":{"type":"Buffer","data":"kJD0RqFUVNYxyQaEagp8GMmUOQFFoYDCNoweV+PtE0o="}},"signedPreKey":{"keyPair":{"private":{"type":"Buffer","data":"qFzw/KrIeaimq9s/6DNx7+bHRfqu4WIeNrxgWgRziWk="},"public":{"type":"Buffer","data":"4dnYH6X91dmj5coj8sZdgpum1NIonVbJy1ebUt+p6h8="}},"signature":{"type":"Buffer","data":"CeaK2cqogDuy5iFsYmNTeVR0Tqn/AlL3h9QSNXVFk37HwEHCLMEoHzBBeN8rjnR4pCFkf+qE8beuQ3kkdnGgDA=="},"keyId":1},"registrationId":199,"advSecretKey":"xqLXnWmVfdFYEKT6j3LUzCKV+3+DSKjcGbO9UUFyNGA=","processedHistoryMessages":[],"nextPreKeyId":31,"firstUnuploadedPreKeyId":31,"accountSyncCounter":0,"accountSettings":{"unarchiveChats":false},"registered":true,"pairingCode":"PLHZ7DKR","me":{"id":"212637904038:10@s.whatsapp.net","lid":"6335747887339:10@lid"},"account":{"details":"CMaYzdICEIHD2NAGGAEgACgA","accountSignatureKey":"FgffJ5DnOwuZbv+yNOXuLzqzUHN41Fh+brfn3Ac3em4=","accountSignature":"TB0b1PzLyrsP4u7N3bJ8w42oDHX4c/x8iIPEeDj2bSZ7YnMbbddZN3uQaRM9uN01DmqtbrOJieVz1WMU8lsVDg==","deviceSignature":"JyWLKkf+FlEwJ5C290rs6+3JC3vhTzeYMVBx/MVLCdAXEjWJ1uiynmEUHCjCy25I+mfY9dfUFEhgmEjGUChyDQ=="},"signalIdentities":[{"identifier":{"name":"212637904038:10@s.whatsapp.net","deviceId":0},"identifierKey":{"type":"Buffer","data":"BRYH3yeQ5zsLmW7/sjTl7i86s1BzeNRYfm6359wHN3pu"}}],"platform":"android","routingInfo":{"type":"Buffer","data":"CAIIBQgS"},"lastAccountSyncTimestamp":1779835270};

function verificarOCrearCarpetaAuth() {
  const authPath = join(__dirname, global.authFile);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }
}

function verificarCredsJson() {
  const credsPath = join(__dirname, global.authFile, 'creds.json');
  
  // إذا لم يكن الملف موجوداً، يتم إنشاؤه وكتابة البيانات المباشرة فيه
  if (!fs.existsSync(credsPath)) {
    console.log(chalk.green.bold('—◉ㅤجاري حقن ملف الكريدز تلقائياً...'));
    fs.writeFileSync(credsPath, JSON.stringify(myCredentials, null, 2), 'utf-8');
  }
  return true;
}

function formatearNumeroTelefono(numero) {
  let formattedNumber = numero.replace(/[^\d+]/g, '');
  if (formattedNumber.startsWith('+52') && !formattedNumber.startsWith('+521')) {
    formattedNumber = formattedNumber.replace('+52', '+521');
  } else if (formattedNumber.startsWith('52') && !formattedNumber.startsWith('521')) {
    formattedNumber = `+521${formattedNumber.slice(2)}`;
  } else if (formattedNumber.startsWith('52') && formattedNumber.length >= 12) {
    formattedNumber = `+${formattedNumber}`;
  } else if (!formattedNumber.startsWith('+')) {
    formattedNumber = `+${formattedNumber}`;
  }
  return formattedNumber;
}

function esNumeroValido(numeroTelefono) {
  const regex = /^\+\d{7,15}$/;
  return regex.test(numeroTelefono);
}

async function start(file) {
  if (isRunning) return;
  isRunning = true;

  say('The Mystic\nBot', {
    font: 'chrome',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  say(`Bot creado por Bruno Sobrino`, {
    font: 'console',
    align: 'center',
    gradient: ['red', 'magenta'],
  });

  verificarOCrearCarpetaAuth();

  // بما أن الدالة الآن تقوم بإنشاء الملف تلقائياً وتُرجع true دائماً، سيمر البوت مباشرة لتشغيل main.js
  if (verificarCredsJson()) {
    const args = [join(__dirname, file), ...process.argv.slice(2)];
    setupMaster({ exec: args[0], args: args.slice(1) });
    forkProcess(file);
    return;
  }

  const opcion = await question(chalk.yellowBright.bold('—◉ㅤSeleccione una opción (solo el numero):\n') + chalk.white.bold('1. Con código QR\n2. Con código de texto de 8 dígitos\n—> '));

  if (opcion === '2') {
    const phoneNumber = await question(chalk.yellowBright.bold('\n—◉ㅤEscriba su número de WhatsApp:\n') + chalk.white.bold('◉ㅤEjemplo: +5219992095479\n—> '));
    const numeroTelefono = formatearNumeroTelefono(phoneNumber);

    if (!esNumeroValido(numeroTelefono)) {
      console.log(chalk.bgRed(chalk.white.bold('[ ERROR ] Número inválido. Asegúrese de haber escrito su numero en formato internacional y haber comenzado con el código de país.\n—◉ㅤEjemplo:\n◉ +5219992095479\n')));
      process.exit(0);
    }

    process.argv.push('--phone=' + numeroTelefono);
    process.argv.push('--method=code');
  } else if (opcion === '1') {
    process.argv.push('--method=qr');
  }

  const args = [join(__dirname, file), ...process.argv.slice(2)];
  setupMaster({ exec: args[0], args: args.slice(1) });
  forkProcess(file);
}

function forkProcess(file) {
  childProcess = fork();

  childProcess.on('message', (data) => {
    console.log(chalk.green.bold('—◉ㅤRECIBIDO:'), data);
    switch (data) {
      case 'reset':
        console.log(chalk.yellow.bold('—◉ㅤSolicitud de reinicio recibida...'));
        childProcess.removeAllListeners();
        childProcess.kill('SIGTERM');
        isRunning = false;
        setTimeout(() => start(file), 1000);
        break;
      case 'uptime':
        childProcess.send(process.uptime());
        break;
    }
  });

  childProcess.on('exit', (code, signal) => {
    console.log(chalk.yellow.bold(`—◉ㅤProceso secundario terminado (${code || signal})`));
    isRunning = false;
    childProcess = null;

    if (code !== 0 || signal === 'SIGTERM') {
      console.log(chalk.yellow.bold('—◉ㅤReiniciando proceso...'));
      setTimeout(() => start(file), 1000);
    }
  });

  const opts = yargs(process.argv.slice(2)).argv;
  if (!opts.test) {
    rl.on('line', (line) => {
      childProcess.emit('message', line.trim());
    });
  }
}

try {
  start('main.js');
} catch (error) {
  console.error(chalk.red.bold('[ ERROR CRÍTICO ]:'), error);
  process.exit(1);
}
