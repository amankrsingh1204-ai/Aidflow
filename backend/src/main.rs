use axum::{
    routing::{get, post},
    Router,
};
use sqlx::PgPool;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use tracing_subscriber;

mod config;
mod error;
mod models;
mod routes;
mod services;

use config::Config;

pub struct AppState {
    pub db: PgPool,
    pub config: Config,
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .init();

    // Load configuration
    dotenvy::dotenv().ok();
    let config = Config::from_env().expect("Failed to load configuration");

    // Initialize database pool
    let pool = sqlx::postgres::PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to database");

    tracing::info!("✅ Connected to PostgreSQL database");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    tracing::info!("✅ Database migrations completed");

    // Build application state
    let app_state = Arc::new(AppState {
        db: pool,
        config: config.clone(),
    });

    // Build router with all routes
    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        // Organization routes
        .nest("/api/organizations", routes::organization::routes())
        // Campaign routes
        .nest("/api/campaigns", routes::campaign::routes())
        // Donation routes
        .nest("/api/donations", routes::donation::routes())
        // Disbursement routes
        .nest("/api/disbursements", routes::disbursement::routes())
        // Audit routes
        .nest("/api/audit", routes::audit::routes())
        .with_state(app_state)
        .layer(
            CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any),
        );

    // Start server
    let addr = format!("0.0.0.0:{}", config.port);
    let listener = tokio::net::TcpListener::bind(&addr)
        .await
        .expect("Failed to bind to address");

    tracing::info!("🚀 AidFlow Backend listening on {}", addr);

    axum::serve(listener, app)
        .await
        .expect("Server error");
}

async fn root() -> &'static str {
    "AidFlow API v1.0 - Blockchain-Powered NGO Donation Platform"
}

async fn health_check() -> &'static str {
    "OK"
}
