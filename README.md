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

### Why self host?
Don't want to use the official hosted service at [https://tunnelmole.com](https://tunnelmole.com)? Because Tunnelmole is open source, you are free to self host your own service. You might want to do this if:
- You want to contribute a new feature or fix a bug
- You want full control of the Tunnelmole service you are connecting to and feel confident that you can manage your own security
- You want to hide your origin server (the IP of the machine you will be running `tunnelmole-client` on), which is a feature we won't implement due to previous negative experiences with bad actors. You'll need to edit this source code to remove code that adds the `X-Forwarded-For` header and if not using a custom domain you will also need to remove the code that adds the IP address to randomly generated domains
- You are interested in learning more about how Tunnelmole works. Self hosting is a great way to learn about Tunnelmole, TypeScript, NodeJS and Websocket.

Generally at the salaries offered for even a Junior developer nowadays its probably not worth your time to do it to save on the $5/month subscription fee for certain features like custom domains. It'll take you more than an hour per month to maintain and if your rate is $50+ per hour (an unusually low amount in todays industry), the numbers don't work out.

#### How to self host
To start off with, you can run both the client and the server locally on your machine (in other words, `localhost` will be "tunneling" to `localhost`). This will make working out any configuration issues or bugs easier as you'll be able to use tools like your favorite IDE or the NodeJS debugger.

When making any kind of changes to the code, always start off by running both the client and the service locally so you can take advantage of built in developer productivity features such as hot reload and the debugger configuration.

- First, start `tunnelmole-service` with `npm start`. The service needs to be running as the client will initiate a websocket connection on startup and will fail with an `ECONNREFUSED` error if it can't connect.
- Follow the instructions to set up [Tunnelmole Client](https://github.com/robbie-cahill/tunnelmole-client). The pre-built binaries available for download are hard coded to the main Tunnelmole service at [https://tunnelmole.com](https://tunnelmole.com) and this can't be changed, so you'll need to use the source version of `tunnelmole-client` from GitHub if you want to self host your own `tunnelmole-service`.
- Update `config-instance.toml` to match the following

```
const instanceConfig = {
    hostip: {
        endpoint: "ws://localhost:8080"
    },
    runtime: {
        debug: true,
        enableLogging: true
    }
}

export default instanceConfig
```

Once this is done compile the client with `npm run build` and then invoke the client with `node dist/srv/index.js <port number to forward to>`.

You'll see output like:
```
Sending initialise message
http://zd0b3l-ip-127-0-0-1.localhost is forwarding to localhost:3000
https://zd0b3l-ip-127-0-0-1.localhost is forwarding to localhost:3000
```
NOTE: The `https` URL won't work without extra setup, see below.

Add the hostname shown to your hosts file. So, for this specific output the line would look like:
```
127.0.0.1 zd0b3l-ip-127-0-0-1.localhost
```
Replace the domain with the domain shown in your `tunnelmole-client` output.

On Linux and Mac, your hosts file is located at `/etc/hosts`. On Windows, its located at `C:\Windows\System32\Drivers\etc\hosts`.

If you want custom domains or other "premium" features, add an API key to `src/authentication/apiKeys.json` in `tunnelmole-service`. You can then run `node dist/srv/index.js --set-api-key <your api key>`. All custom subdomains need to be added to your hosts file if you are running `tunnelmole-service` locally.

Then run for example `node dist/srv/index.js <port number> as mydomain.localhost` to get a custom subdomain. Add your chosen domain to your hosts file so your computer can resolve it.

Then start a web server listening on your chosen port and hit the `http` URL `tunnelmole-client` gave you you earlier in your browser or other HTTP client and it will work if you've set everything up correctly.

Once you have everything working locally, you can deploy the service to a remote server. I won't go into how to get your own server and register a domain, but lets assume you have a server at `https://foo.com` with all of the prerequisites installed.
- First, make sure the compiled code is up to date i.e. `npm run build`
- Upload your copy of `tunnelmole-service` to your server.
- Open up `config-instance.toml` and make any changes you want to make. In particular you'll want to update the domain from `localhost` to your domain and pick a better monitoring password than the default, which is `changeme`.
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
###
# Config for the web and websockets servers
# The password is for any routes you want to password protect
# By default this is only the endpoint that lists active connections for debugging purposes
###
[server]
httpPort = 80
websocketPort = 81
domain = 'foo.com'
password = 'changeme'

[runtime]
debug = true
enableLogging = false
```

At that point, rebuild and run the client like below:
```
npm run build && node dist/srv/index.js 3000
```

Now you'll see output for your server's domain
```
http://zd0b3l-ip-127-0-0-1.foo.com is forwarding to localhost:3000
https://zd0b3l-ip-127-0-0-1.foo.com is forwarding to localhost:3000
```

At this point, you hit the HTTP URL using your browser or other HTTP client. As previously mentioned, HTTPs will not work without extra infrastructure.

### Debugging
To debug using Visual Studio Code, copy over the example config `cp .vscode/launch.json.example .vscode/launch.json`. Then launch "Start Service".

Tunnelmole compiles with sourcemaps by default, so you can put breakpoints in the TypeScript files.

Hot reload is not supported when debugging as you wouldn't be able to maintain a consistent debugger connection with the server restarting all the time. So for every change you will need to stop and restart the debugger session. 

The default config will automatically recompile the code with each new debugger session, so there is no need for you to manually recompile the code between each debug session for every change.

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
`tunnelmole-service` does not natively support HTTPs/SSL. So how do we offer it on the official [https://tunnelmole.com](https://tunnelmole.com) service? We have extra infrastructure including a reverse proxy server set up that handles HTTPs running on the same machine as the service. 

To get HTTPs, you will need to register your own SSL certificate (Lets Encrypt can get you one for free) and configure a reverse proxy server such as Nginx to proxy to `tunnelmole-service` over HTTP and Websocket.

### License
The Tunnelmole Service is licensed under the GNU Affero General Public License v3.0. This license includes some obligations if you modify the code and make it available over a network. 

The client is licensed under the more permissive MIT license, to make it easier for people to integrate it with their own projects.

For more information, see the [Tunnelmole License](https://github.com/robbie-cahill/tunnelmole-service/blob/main/LICENSE.md).

### How Tunnelmole works
![How Tunnelmole works](/docs/img/how-tunnelmole-works.png)


### Are there any differences between this code and the official Tunnelmole service?
The official service at Tunnelmole.com built by taking the code in this repository, patching in our billing and subscription verification code (which is our only code that is closed source), then deploying the patched code to production.

Thats the only difference between the code here and whats running on Tunnelmole.com. As previously mentioned, we also add extra infrastructure for HTTPs support as `tunnnelmole-service` does not natively support HTTPs without extra help.

### Official Website
The official website for this project is at [https://tunnelmole.com](https://tunnelmole.com). Don't get Tunnelmole from anywhere else other than this website or the official GitHub repositories!
