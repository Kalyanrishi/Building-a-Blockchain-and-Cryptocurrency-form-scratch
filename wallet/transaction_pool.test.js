const TransactionPool = require('./transaction_pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');

describe('TransactionPool', () => {
    let tp , wallet,transaction, bc;


    beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
    transaction = wallet.createTransaction('r3c1p13nt', 30, bc,tp);
});


    // beforeEach(() => {
    //     tp = new TransactionPool();
    //     wallet = new Wallet();
    //     // transaction = Transaction.newTransaction(wallet, 'r3c1p13nt', 30);
    //     // tp.updateOrAddTransaction(transaction);
    //     transaction = wallet.createTransaction('r3c1p13nt',30,tp);
    // }); 

    it('adds a transaction to the pool', () => {
        expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool', ()  => {
        const oldTransaction = JSON.stringify(transaction);
        const newTransaction = transaction.update(wallet, 'n3xt-r3c1p13nt', 40);
        tp.updateOrAddTransaction(newTransaction);

        expect(JSON.stringify(tp.transactions.find(t => t.id === transaction.id))).not.toEqual(oldTransaction);
    });

    it('clears the transactions', () => {
        tp.clear();
        expect(tp.transactions).toEqual([]);
    });

    describe('mixing valid and invalid transactions', () => {
        let validTransactions;

        beforeEach(() => {
            validTransactions = [...tp.transactions];
            for (let i = 0; i < 6; i++) {
            wallet = new Wallet();
            transaction = wallet.createTransaction('r3c1p13nt', 30, bc, tp);
            if (i % 2 === 0) {
                transaction.input.amount = 99999;
            } else {
                validTransactions.push(transaction);
            }
        }


        });


        it('shows a difference between valid and invalid transactions', () => {
            expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('returns valid transactions', () => {
            expect(tp.validTransactions()).toEqual(validTransactions);
        });
    });
    
    
});