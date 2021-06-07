const qrcode = require('qrcode-terminal');
const { Client, MessageMedia } = require('whatsapp-web.js');
const fs = require('fs');
const ora = require ('ora');
const clear = require('clear-screen');
const readline = require('readline');
const rl= readline.createInterface({
    input: process.stdin,
    output: process.stdout
});



const SESSION_FILE_PATH = './session.json';
let client;
let sessionData;

const withsession = ()=>{ 
    
    const spinner = ora('Loading Validating whatsapp session');
    sessionData = require(SESSION_FILE_PATH);
    spinner.start();
    
    client = new Client({
        session:sessionData
    })

    client.on('ready',async ()=>{
        spinner.stop();
        clear();
        console.log('Client is Ready!');
        rl.question('Get Number to start ',(number)=>{
            console.log('number is: '+number)
            const num = number+"@c.us"
            sendMessage(num,"Welcome!")
            clear();
            console.log('Client is Ready!');
            listenMessage();
        })
        
    })

    client.on('auth_failure',()=>{
        spinner.stop();
        console.log('Error de autenticaciòn');
    })

    client.initialize();
}

const withoutsession = ()=>{ 
    console.log('No session initialized');
    client = new Client();
    client.on('qr',qr=> {
        qrcode.generate(qr,{small:true});
    });

    client.on('authenticated',(session)=>{
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH,JSON.stringify(session),function (err) {
            if(err){
                console.log(err);
            }
            
        });
    });
    client.initialize();
}

const listenMessage =  ()=>{
    client.on('message',(inboundMsg)=>{
        const {from, to,body} = inboundMsg;
        //console.log(inboundMsg)
        console.log(from, to , body);
        
        if(body){
            inboundMsg.reply('Write Hello, Day, Date or Ping');
        }
    })
}

const sendMessage = (to, outboundMsg) =>{
    client.sendMessage(to, outboundMsg)
}

const sendMedia = (to, file)=>{
    const mediaFile= MessageMedia.fromFilePath(file)
    client.sendMessage(to, mediaFile)
}

(fs.existsSync(SESSION_FILE_PATH))? withsession() : withoutsession();