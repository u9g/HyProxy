const { parse } = require('yaml')
const { readFileSync, existsSync, writeFileSync } = require('fs')
const Proxy = require('minecraft-proxy-handler').default

if (!existsSync('./config.yaml')) {
  writeFileSync('./config.yaml', `server_ip: hypixel.net.hypixel.io # change to hypixel.net if you have problems with this
accounts:
  MY_USERNAME: # replace MY_USERNAME with your username
    username: my@email.com # put your email here
    password: mypassword # put your password here, or delete mypassword and leave blank if you have a microsoft account
    auth: mojang # replace with microsoft if you have a microsoft account
  `)
  errorExit('Fill out the config.yaml, then restart the program.')
}
const config = parse(readFileSync('./config.yaml', 'utf-8'))
const proxy = new Proxy({
  loginHandler: (client) => {
    if (!config.accounts[client.username]) errorExit(`${client.username} is not an account in the config`)
    return config.accounts[client.username]
  },
  clientOptions: {
    host: config.server_ip,
    version: '1.8.9'
  },
  serverOptions: {
    version: '1.8.9'
  }
})

proxy.on('incoming', (data, meta, toClient, toServer) => {
  if (meta.name === 'custom_payload') {
    if (data.channel === 'badlion:mods') return
    else if (data.channel === 'MC|Brand') data.data = Buffer.from('<XeBungee (git:XeBungee-Bootstrap:1.16-R0.5-SNAPSHOT:a2e1df4)') // hack to re-enable freelook on lunar
  }
  toClient.write(meta.name, data)
})

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  toServer.write(meta.name, data)
})

function errorExit (str) {
  console.error(str)
  console.error('Press any key to exit.')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}
