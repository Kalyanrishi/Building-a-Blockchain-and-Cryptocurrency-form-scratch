const ChainUtil = require('./chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
        publicKey: ${this.publicKey.toString()}
        balance: ${this.balance}`;
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    createTransaction(recipient, amount, blockchain, transactionPool) {
        // Always recalculate balance from blockchain
        this.balance = this.calculateBalance(blockchain);

        if (amount > this.balance) {
            console.log(`Amount: ${amount} exceeds balance.`);
            return;
        }

        let transaction = transactionPool.existingTransaction(this.publicKey);

        if (transaction) {
            transaction.update(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    calculateBalance(blockchain) {
        let balance = INITIAL_BALANCE;
        let transactions = [];

        // Collect all transactions from every block in the chain
        blockchain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }));

        // Transactions where this wallet was the sender
        const walletInputTs = transactions.filter(
            transaction => transaction.input && transaction.input.address === this.publicKey
        );

        let startTime = 0;

        if (walletInputTs.length > 0) {
            // Most recent outgoing transaction
            const recentInputT = walletInputTs.reduce((prev, current) =>
                prev.input.timestamp > current.input.timestamp ? prev : current
            );

            // Balance is whatever is left in that transaction
            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount;
            startTime = recentInputT.input.timestamp;
        }

        // Add funds received after the most recent spend
        transactions.forEach(transaction => {
            if (transaction.input.timestamp > startTime) {
                transaction.outputs.forEach(output => {
                    if (output.address === this.publicKey) {
                        balance += output.amount;
                    }
                });
            }
        });

        return balance;
    }

    static blockchainWallet() {
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
}

module.exports = Wallet;
