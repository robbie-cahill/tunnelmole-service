### Tunnelmole Service
Tunnelmole is a simple tool to give your locally running web applications a public URL.

So, you could have your app running locally on port `8080`, then by running `tmole 8080` you could have a URL such as `https://df34.tunnelmole.com` routing to your locally running application.

Tunnelmole has been compared to a similar tool known as ngrok, but is open source and self hostable.

Tunnelmole has two main moving parts, the client and the service. This is the service for Tunnelmole.

Both [tunnelmole-service](https://github.com/robbie-cahill/tunnelmole-service/) and [tunnelmole-client](https://github.com/robbie-cahill/tunnelmole-client/) are written in [TypeScript](https://github.com/microsoft/TypeScript).

For the coding style, we mostly follow [Functional Programming](https://en.wikipedia.org/wiki/Functional_programming) patterns. To prevent that devolving into a big ball of Spaghetti code, we follow best practices such as Single Purpose, DRY, consistent naming patterns and clean dependency management. The TypeScript compiler helps catch bugs early.

### Prerequisites
- NodeJS 16 or later
- TypeScript 4.9.3 or later

### Getting started
If you just want to use Tunnelmole without setting up your own server or building things from source, head over to the official website at [https://tunnelmole.com](https://tunnelmole.com) and follow the instructions shown to get up and running in minutes!. Like Docker (another open source project) you don't need to build things from source just to run and use Tunnelmole.

To set up this project:
- Ensure you have the Prerequisites installed
- Install the dependencies with `npm install`.
- Copy over the example config `cp config-instance.example.toml config-instance.toml`
- Build the source code and start the service with `npm start`

As you make changes, the service will hot reload automatically.

#### How to self host
To start off with, you can run both the client and the server locally on your machine (in other words, `localhost` will be "tunneling" to `localhost`). This will make working out any configuration issues or bugs easier as you'll be able to use tools like your favorite IDE or the NodeJS debugger.

When making any kind of changes to the code, always start off by running both the client and the service locally so you can take advantage of built in developer productivity features such as hot reload and the debugger configuration.

- First, start `tunnelmole-service` with `npm start`. The service needs to be running as the client will initiate a websocket connection on startup and will fail with an `ECONNREFUSED` error if it can't connect.
- Clone `tunnelmole-client` `git clone git@github.com:robbie-cahill/tunnelmole-client.git`
- Add a special host to your hosts file (`/etc/hosts` on Linux and Mac OS X) for the locally running `tunnelmole-service`.
- Run a simple HTML website or other test server over HTTP (not HTTPS) on port `3000` so that you have something to tunnel to. A good tool to use is https://www.npmjs.com/package/serve which is a very simple web server that can serve up any folder on your machine in a single command i.e. `cd website; serve .`. `serve` will use port `3000` by default.
```
127.0.0.1 tunnelmole.local
```
- Copy over the example configuration `config-instance.example.ts` to `config-instance.ts`. This example configuration points to the Tunnelmole SaaS service by default. Since you are self hosting, open this file and modify it as follows:

```
const instanceConfig = {
    hostip: {
        endpoint: "ws://tunnelmole.local:8080"
    },
    runtime: {
        debug: true,
        enableLogging: true
    }
}

export default instanceConfig
```

Now you need to compile the code with `npm run build`. This needs to be done after editing the config above or the changes will not take effect.

Once the code is built, you'll have an executable client at `dist/bin/tunnelmole.js` which can be run directly with `node` in the same way as the normal tunnelmole client. Now you need to run this to connect to your locally running `tunnelmole-service`.

With the local tunnelmole service running, invoke the client with `node dist/bin/tunnelmole.js <port number to forward to>`.

You'll see output like:
```
Sending initialise message
http://zd0b3l-ip-127-0-0-1.tunnelmole.local is forwarding to localhost:3000
https://zd0b3l-ip-127-0-0-1.tunnelmole.local is forwarding to localhost:3000
```

NOTE: The `https` URL won't work without extra setup, see below.

#### Troubleshooting
- If there is no output, double check that the tunnelmole service has been started and if it has been, check for errors
- If you hit the URL in the output and nothing happen, double check the web server you started earlier with `serve` is running


#### Security
The service is wide open for anyone wishing to generate random URLs, so keep this in mind.

Custom subdomains require adding an API key to `src/authentication/apiKeys.json` in `tunnelmole-service`. You can then run `node dist/src/index.js --set-api-key <your api key>`. 


All custom subdomains need to be added to your hosts file if you are running `tunnelmole-service` locally. 
```
127.0.0.1 mydomain.tunnelmole.local
```


#### Deploying to a server
Once you have everything working locally, you can deploy the service to a remote server. I won't go into how to get your own server and register a domain, but lets assume you have a server at `https://foo.com` with all of the prerequisites installed.
- First, make sure the compiled code is up to date i.e. `npm run build`
- Upload your copy of `tunnelmole-service` to your server.
- Open up `config-instance.toml` and make any changes you want to make. In particular you'll want to update the domain from `localhost` to your domain and pick a better monitoring password than the default, which is `changeme`. If you don't do this, anyone will be able to hit the endpoint and list the public URLs of all domains that are currently running.


```
[server]
httpPort = 80
websocketPort = 81
domain = 'foo.com'
password = '********'
```

Start the service with `node dist/srv/index.js`. If all went well, the service will start with no errors.

Once this is done, update `config-instance.ts` in `tunnelmole-client` to point to your server.
```
const instanceConfig = {
    hostip: {
        endpoint: "wss://tunnelmole.foo.com:81"
    },
    runtime: {
        debug: false,
        enableLogging: true
    }
}

export default instanceConfig;
```

At that point, rebuild and run the client like below:
```
npm run build && node dist/src/index.js 3000
```

Now you'll see output for your server's domain
```
http://zd0b3l-ip-127-0-0-1.foo.com is forwarding to localhost:3000
https://zd0b3l-ip-127-0-0-1.foo.com is forwarding to localhost:3000
```

At this point, you hit the HTTP URL using your browser or other HTTP client. HTTPs will not work without additional configuration.

### Debugging
To debug using Visual Studio Code, copy over the example config `cp .vscode/launch.json.example .vscode/launch.json`. Then launch "Start Service".

Tunnelmole compiles with sourcemaps by default, so you can put breakpoints in the TypeScript files.

Hot reload is not supported when debugging as you wouldn't be able to maintain a consistent debugger connection with the server restarting all the time. So for every change you will need to stop and restart the debugger session. 

The default config will automatically recompile the code with each new debugger session, so there is no need for you to manually recompile the code between each debug session for every change.

If you have a particularly tricky issue, set a breakpoint in `srv/index.ts` and debug from there.

### Monitoring
Set debug to true in the config and you'll get debugging info logged to the console

```
[runtime]
debug = true
enableLogging = false
```

You can view active connections by going to `http://<your host>/tunnelmole-connections?password=<password from config>`.
The password is under the server config
```
[server]
httpPort = 8001
websocketPort = 8081
domain = 'localhost'
password = 'changeme'
```

### Tunnelmole Service has no native HTTPs support
`tunnelmole-service` does not natively support HTTPs/SSL.  

To get HTTPs, you will need to register your own SSL certificate (Lets Encrypt can get you one for free) and configure a reverse proxy server such as Nginx to proxy to `tunnelmole-service` over HTTP and Websocket.

### Open Source License
Unless alternative arrangements have been made, the Tunnelmole Service is licensed under the GNU Affero General Public License v3.0. This license includes some obligations if you modify the code and make it available over a network. 

The client is licensed under the more permissive MIT license, to make it easier for people to integrate it with their own projects.

For more information, see the [Tunnelmole License](https://github.com/robbie-cahill/tunnelmole-service/blob/main/LICENSE.md).


### Commercial Support and Licensing
Unlock the full potential of the Tunnelmole Service for your business! If you're self-hosting and interested in commercial support options, contact us at [robbie-cahill@proton.me](mailto:robbie-cahill@proton.me).

For cloud service providers or businesses seeking more flexibility that what the AGPL license can offer, we can license Tunnelmole Service code under a commercial source license. To learn more email[robbie-cahill@proton.me](mailto:robbie-cahill@proton.me).

### How Tunnelmole works
![How Tunnelmole works](/docs/img/how-tunnelmole-works.png)


### Are there any differences between this code and the official Tunnelmole service?
The official service at Tunnelmole.com built by taking the code in this repository, patching in our billing and subscription verification code (which is our only code that is closed source), then deploying the patched code to production.

Thats the only difference between the code here and whats running on Tunnelmole.com. As previously mentioned, we also add extra infrastructure for HTTPs support as `tunnnelmole-service` does not natively support HTTPs without extra help.

### Official Website
The official website for this project is at [https://tunnelmole.com](https://tunnelmole.com). Don't get Tunnelmole from anywhere else other than this website or the official GitHub repositories!
