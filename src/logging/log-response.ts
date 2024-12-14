import ForwardedResponseMessage from "../messages/forwarded-response-message"

const logResponse = (response: ForwardedResponseMessage, tunnelmoleSubdomain: string) => {
    if (process.env.TUNNELMOLE_LOG_LEVEL == "debug") {
        console.info(`Response from ${tunnelmoleSubdomain}: ${JSON.stringify(response)}`)
    }
}

export { logResponse };