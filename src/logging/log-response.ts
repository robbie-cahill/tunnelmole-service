import ForwardedResponseMessage from "../messages/forwarded-response-message"

const logResponse = (response: ForwardedResponseMessage) => {
    if (process.env.TUNNELMOLE_LOG_LEVEL = "debug") {
        console.info(`Response: ${JSON.stringify(response)}`)
    }
}

export { logResponse };