﻿exports.newWebSocketsServer = function newWebSocketsServer(EVENTS_SERVER) {

    const MODULE = "Web Sockets Server"
    const LOG_INFO = false

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    require('dotenv').config()
    const WEB_SOCKET = require('ws')
    let socketServer
    let port = process.env.WEB_SOCKETS_SERVER_PORT  

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function run() {
       setUpWebSocketServer()
    }

    function setUpWebSocketServer() {
        try {
            socketServer = new WEB_SOCKET.Server({ port: port })

            socketServer.on('connection', onConnection)

            function onConnection(socket) {

                let lastNonce = -1
                if (LOG_INFO === true) {
                    console.log('New Websocket Connection.')
                }

                socket.on('message', onMenssage)

                function onMenssage(message){

                    try {
                        if (LOG_INFO === true) {
                            console.log('Message Received: ' + message)
                        }

                        let messageArray = message.split('|*|')

                        let origin = messageArray[0]
                        let nonce = messageArray[1]
                        let messageToEventServer = messageArray[2]

                        if (origin === 'Web Browser') {
                            if (isNaN(nonce) || nonce === "") {
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce is not a Number. message = ' + message)
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce is not a Number. nonce = ' + nonce)
                                return
                            }

                            if (nonce === "1") { // this happens once the browser is restarted, and the server is running since a previous session.
                                lastNonce = 0
                            }

                            if (Number(nonce) < Number(lastNonce)) {
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. message = ' + message)
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. nonce = ' + nonce)
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. lastNonce = ' + lastNonce)
                                return
                            }

                            lastNonce = nonce

                            try {
                                let jsonCheck = JSON.parse(messageToEventServer)
                            } catch (err) {
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. message = ' + message)
                                console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Message received from the browser is not a valid JSON. messageToEventServer = ' + messageToEventServer)
                                return
                            }

                            let acknowledgeMessage = {
                                action: 'Acknowledge',
                                nonce: nonce
                            }

                            socket.send(JSON.stringify(acknowledgeMessage))
                        }


                        EVENTS_SERVER.onMessage(messageToEventServer, onResponse)

                        function onResponse(message) {
                            socket.send(message)
                        }
                    } catch (err) {
                        console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> Nonce received is less than Last Nonce. err = ' + err.stack)
                    }
                }
            }

            console.log('Web Sockets Server Started.')
        } catch (err) {
            console.log('[ERROR] BackendServers -> Web Sockets Server -> run -> setUpWebSocketServer -> err.message = ' + err.message)
        }
    }
}