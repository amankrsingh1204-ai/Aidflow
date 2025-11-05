FROM rust:1.75 as builder

WORKDIR /app

# Copy workspace manifests
COPY Cargo.toml ./
COPY backend/Cargo.toml ./backend/

# Copy source
COPY backend/src ./backend/src
COPY backend/migrations ./backend/migrations

# Build release
RUN cargo build --release --package aidflow-backend

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/aidflow-backend /app/backend
COPY backend/migrations ./migrations

EXPOSE 5000

CMD ["./backend"]
