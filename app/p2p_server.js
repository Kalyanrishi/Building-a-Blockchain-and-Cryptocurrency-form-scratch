const Websocket = require('ws');
//"dev-peer1": "cross-env HTTP_PORT=3001 P2P_PORT=5001 PEERS=\"\" node ./app",
const P2P_PORT = process.env.P2P_PORT || 5001;
//const server = new Websocket.Server({ port: P2P_PORT });

const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
const MESSAGE_TYPES = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION',
    clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2PServer {
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = [];
    }

    listen() {
        const server = new Websocket.Server({ port: P2P_PORT });
        server.on('connection', socket => this.connectSocket(socket));
        console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
        this.connectToPeers();
    }

    connectToPeers() {
        peers.forEach(peer => {
            // ws://localhost:5001
            const socket = new Websocket(peer);

            socket.on('open', () => this.connectSocket(socket));
        });
    }

    connectSocket(socket) {
        this.sockets.push(socket);
        console.log('Socket connected');
        this.messageHandler(socket);
        this.sendChain(socket);
        //socket.send(JSON.stringify(this.blockchain.chain));
    }

    messageHandler(socket) {
        socket.on('message', message => {
            const data = JSON.parse(message);
            switch (data.type) {
                case MESSAGE_TYPES.chain:
                    this.blockchain.replaceChain(data.chain);
                    break;
                case MESSAGE_TYPES.transaction:
                    this.transactionPool.updateOrAddTransaction(data.transaction);
                   // this.braodcastTransaction(data.transaction);
                    break;
                case MESSAGE_TYPES.clear_transactions:
                    this.transactionPool.clear();
                    break;
            }
            //console.log('data',data);

            //this.blockchain.replaceChain(data);
        });
    }

    sendChain(socket) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.chain,
            chain: this.blockchain.chain
        }));
        //console.log(`Sending chain to peer: ${JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain })}`);
        //socket.send(JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain }));
        //console.log(`Sending chain to peer: ${JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain }  
        
    }

    sendTransaction(socket, transaction) {
        socket.send(JSON.stringify({
            type: MESSAGE_TYPES.transaction,
            transaction,
        }));
        //console.log(`Sending transaction to peer: ${JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction
        //transaction })}`);
        //socket.send(JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction }));
        //console.log(`Sending transaction to peer: ${JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction })}`);
    }

    syncChains() {
        this.sockets.forEach(socket => this.sendChain(socket));

    }
    
    broadcastTransaction(transaction) {
        this.sockets.forEach(socket => this.sendTransaction(socket, transaction));  
    }

    broadcastClearTransactions() {
        this.sockets.forEach(socket => socket.send(JSON.stringify({
            type: MESSAGE_TYPES.clear_transactions
        })));
        //console.log(`Broadcasting clear transactions message to peers`);
        //this.sockets.forEach(socket => socket.send(JSON.stringify({ type: MESSAGE_TYPES.cleat_transactions })));
    }
}

module.exports = P2PServer;

//cross-env HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001
//"dev": "nodemon ./app",