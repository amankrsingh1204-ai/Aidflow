const { server, StellarSdk, config } = require('../config/stellar');

class StellarService {
    /**
     * Create a new Stellar account (keypair)
     */
    static createAccount() {
        const pair = StellarSdk.Keypair.random();
        return {
            publicKey: pair.publicKey(),
            secretKey: pair.secret()
        };
    }

    /**
     * Fund account on testnet using Friendbot
     */
    static async fundTestnetAccount(publicKey) {
        if (config.network !== 'testnet') {
            throw new Error('Friendbot only available on testnet');
        }
        
        try {
            const response = await fetch(
                `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
            );
            return await response.json();
        } catch (error) {
            throw new Error(`Failed to fund testnet account: ${error.message}`);
        }
    }

    /**
     * Get account details from Stellar
     */
    static async getAccountDetails(publicKey) {
        try {
            const account = await server.loadAccount(publicKey);
            return {
                id: account.id,
                sequence: account.sequence,
                balances: account.balances,
                signers: account.signers,
                thresholds: account.thresholds,
                flags: account.flags
            };
        } catch (error) {
            throw new Error(`Failed to load account: ${error.message}`);
        }
    }

    /**
     * Setup multi-signature account
     */
    static async setupMultiSigAccount(sourceSecret, signerPublicKeys, threshold = 2) {
        try {
            const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
            const sourcePublicKey = sourceKeypair.publicKey();
            
            const account = await server.loadAccount(sourcePublicKey);
            
            const transaction = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: config.networkPassphrase
            });

            // Add signers
            signerPublicKeys.forEach(signerKey => {
                transaction.addOperation(
                    StellarSdk.Operation.setOptions({
                        signer: {
                            ed25519PublicKey: signerKey,
                            weight: 1
                        }
                    })
                );
            });

            // Set thresholds
            transaction.addOperation(
                StellarSdk.Operation.setOptions({
                    masterWeight: 1,
                    lowThreshold: threshold,
                    medThreshold: threshold,
                    highThreshold: threshold
                })
            );

            const builtTransaction = transaction.setTimeout(180).build();
            builtTransaction.sign(sourceKeypair);
            
            const result = await server.submitTransaction(builtTransaction);
            return result;
        } catch (error) {
            throw new Error(`Failed to setup multi-sig: ${error.message}`);
        }
    }

    /**
     * Send payment
     */
    static async sendPayment(sourceSecret, destinationKey, amount, assetCode = 'XLM', assetIssuer = null, memo = null) {
        try {
            const sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecret);
            const account = await server.loadAccount(sourceKeypair.publicKey());

            let asset;
            if (assetCode === 'XLM') {
                asset = StellarSdk.Asset.native();
            } else {
                asset = new StellarSdk.Asset(assetCode, assetIssuer);
            }

            const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: config.networkPassphrase
            });

            transactionBuilder.addOperation(
                StellarSdk.Operation.payment({
                    destination: destinationKey,
                    asset: asset,
                    amount: amount.toString()
                })
            );

            if (memo) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
            }

            const transaction = transactionBuilder.setTimeout(180).build();
            transaction.sign(sourceKeypair);

            const result = await server.submitTransaction(transaction);
            return {
                success: true,
                transactionId: result.hash,
                ledger: result.ledger,
                result: result
            };
        } catch (error) {
            throw new Error(`Payment failed: ${error.message}`);
        }
    }

    /**
     * Create multi-sig payment transaction (returns XDR for signing)
     */
    static async createMultiSigPayment(sourcePublicKey, destinationKey, amount, assetCode = 'XLM', assetIssuer = null, memo = null) {
        try {
            const account = await server.loadAccount(sourcePublicKey);

            let asset;
            if (assetCode === 'XLM') {
                asset = StellarSdk.Asset.native();
            } else {
                asset = new StellarSdk.Asset(assetCode, assetIssuer);
            }

            const transactionBuilder = new StellarSdk.TransactionBuilder(account, {
                fee: StellarSdk.BASE_FEE,
                networkPassphrase: config.networkPassphrase
            });

            transactionBuilder.addOperation(
                StellarSdk.Operation.payment({
                    destination: destinationKey,
                    asset: asset,
                    amount: amount.toString()
                })
            );

            if (memo) {
                transactionBuilder.addMemo(StellarSdk.Memo.text(memo));
            }

            const transaction = transactionBuilder.setTimeout(300).build();
            
            return {
                xdr: transaction.toXDR(),
                hash: transaction.hash().toString('hex')
            };
        } catch (error) {
            throw new Error(`Failed to create transaction: ${error.message}`);
        }
    }

    /**
     * Sign transaction with secret key
     */
    static signTransaction(xdr, secretKey) {
        try {
            const transaction = new StellarSdk.Transaction(xdr, config.networkPassphrase);
            const keypair = StellarSdk.Keypair.fromSecret(secretKey);
            transaction.sign(keypair);
            return transaction.toXDR();
        } catch (error) {
            throw new Error(`Failed to sign transaction: ${error.message}`);
        }
    }

    /**
     * Submit signed transaction
     */
    static async submitTransaction(xdr) {
        try {
            const transaction = new StellarSdk.Transaction(xdr, config.networkPassphrase);
            const result = await server.submitTransaction(transaction);
            return {
                success: true,
                transactionId: result.hash,
                ledger: result.ledger,
                result: result
            };
        } catch (error) {
            throw new Error(`Failed to submit transaction: ${error.message}`);
        }
    }

    /**
     * Get transaction details
     */
    static async getTransaction(transactionId) {
        try {
            const transaction = await server.transactions().transaction(transactionId).call();
            return transaction;
        } catch (error) {
            throw new Error(`Failed to fetch transaction: ${error.message}`);
        }
    }

    /**
     * Get transactions for account
     */
    static async getAccountTransactions(publicKey, limit = 10) {
        try {
            const transactions = await server.transactions()
                .forAccount(publicKey)
                .limit(limit)
                .order('desc')
                .call();
            return transactions.records;
        } catch (error) {
            throw new Error(`Failed to fetch transactions: ${error.message}`);
        }
    }

    /**
     * Get payments for account
     */
    static async getAccountPayments(publicKey, limit = 20) {
        try {
            const payments = await server.payments()
                .forAccount(publicKey)
                .limit(limit)
                .order('desc')
                .call();
            return payments.records;
        } catch (error) {
            throw new Error(`Failed to fetch payments: ${error.message}`);
        }
    }

    /**
     * Monitor account for incoming payments
     */
    static monitorAccount(publicKey, callback) {
        const paymentStream = server.payments()
            .forAccount(publicKey)
            .cursor('now')
            .stream({
                onmessage: callback,
                onerror: (error) => {
                    console.error('Stream error:', error);
                }
            });
        
        return paymentStream;
    }

    /**
     * Validate Stellar address
     */
    static isValidAddress(address) {
        return StellarSdk.StrKey.isValidEd25519PublicKey(address);
    }

    /**
     * Get Horizon transaction URL
     */
    static getHorizonUrl(transactionId) {
        return `${config.horizonUrl}/transactions/${transactionId}`;
    }
}

module.exports = StellarService;
