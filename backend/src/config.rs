use std::env;

#[derive(Clone)]
pub struct Config {
    pub database_url: String,
    pub port: u16,
    pub stellar_network: String,
    pub stellar_horizon_url: String,
    pub contract_id: String,
}

impl Config {
    pub fn from_env() -> Result<Self, env::VarError> {
        Ok(Self {
            database_url: env::var("DATABASE_URL")?,
            port: env::var("PORT")
                .unwrap_or_else(|_| "5000".to_string())
                .parse()
                .unwrap_or(5000),
            stellar_network: env::var("STELLAR_NETWORK")
                .unwrap_or_else(|_| "testnet".to_string()),
            stellar_horizon_url: env::var("STELLAR_HORIZON_URL")
                .unwrap_or_else(|_| "https://horizon-testnet.stellar.org".to_string()),
            contract_id: env::var("CONTRACT_ID")
                .unwrap_or_else(|_| "".to_string()),
        })
    }
}
