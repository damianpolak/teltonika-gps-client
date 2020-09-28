const net = require('net');

const imei = {
  'type': 15,
  'amount': 1,
  'packet': {
    'preamble': '',
    'imei': ''
  },
  '_15': [
    '356307042441013',
    '426301032741423',
    '195783201928412'
  ],
  '_17': [
    '83648010098345687',
    '71739573564777567',
    '23319836465392001'
   ]
};

const myArgs = process.argv.slice(2);

if(myArgs.length == 0) {
  imei.amount = 1;
  imei.type = 15;

} else {

  if(myArgs[0] == '15o') {
    imei.amount = 1;
    imei.type = 15;
  }

  if(myArgs[0] == '15a') {
    imei.amount = imei._15.length;
    imei.type = 15;
  }

  if(myArgs[0] == '17o') {
    imei.amount = 1;
    imei.type = 17;
  }

  if(myArgs[0] == '17a') {
    imei.amount = imei._17.length;
    imei.type = 17;
  }
}

for(let i = 0; i < imei.amount; i++) {
  let client = new net.Socket();

  client.inc++;
  client.id = client.inc;
  client.imeiSent = false;
  client.imeiAllowed = false;

  client.connect(7777, '127.0.0.1', () => {
    console.log('Log: Connected!');

      if(client.imeiSent == false) {
        if(imei.type == 15) {
          imei.packet.preamble = Buffer.from([0x00, 0x0F]);
          imei.packet.imei = Buffer.alloc(imei._15[i].toString().length, imei._15[i].toString());
        }
    
        if(imei.type == 17) {
          imei.packet.preamble = Buffer.from([0x00, 0x11]);
          imei.packet.imei = Buffer.alloc(imei._17[i].toString().length, imei._17[i].toString());
        }
        
        const buff = Buffer.concat([imei.packet.preamble, imei.packet.imei], imei.packet.preamble.length + imei.packet.imei.length);
        client.write(buff);
        
        client.imeiSent = true;
      }

    client.on('data', (data) => {
      if(client.imeiSent == true) {

        if(data.length == 1 && data[0] == 0x01) {
          console.log('accept');
          client.imeiAllowed = true;

          let sendData = setInterval(() => {
            client.write((Math.round(Math.random() * 1000)).toString());
          }, Math.round(Math.random(100) * 15000));
        } 

        if(data.length == 1 && data[0] == 0x00) {
          client.imeiAllowed = false;
          console.log('close');
          client.destroy();
        }
        console.log(data);
      }

    });

  });

  
  client.on('end', () => {
    console.log('Disconnected');
  });
  client.on('close', () => {
    console.log('Close');
  });


}
