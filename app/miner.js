const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');


class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer,) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;

    }


    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(
            Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet())
        );
        // include a reward for the miner
        // crate a block consisting of the valid transactions 
        const block = this.blockchain.addBlock(validTransactions);

        // synchronize the chains in the peer to peer server
        this.p2pServer.syncChains();
        this.transactionPool.clear();
        this.p2pServer.broadcastClearTransactions();

        return block;
        // syschronize the chains in the peer to peer sever
        // clear the transaction pool
        // broadcast to every peer the new block
    }
}
module.exports = Miner;