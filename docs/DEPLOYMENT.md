# Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

#### 1. Environment Configuration
- [ ] Update `.env` with production values
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set strong JWT secret
- [ ] Configure production Stellar network (mainnet)
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domain

#### 2. Security Hardening
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Configure rate limiting
- [ ] Enable CSRF protection
- [ ] Set up WAF (Web Application Firewall)
- [ ] Configure DDoS protection
- [ ] Enable security headers (Helmet.js)
- [ ] Set up monitoring and alerting

#### 3. Database
- [ ] Run production migrations
- [ ] Set up automated backups
- [ ] Configure read replicas (if needed)
- [ ] Enable connection pooling
- [ ] Set up monitoring
- [ ] Configure backup retention

#### 4. Stellar Configuration
- [ ] Switch to mainnet
- [ ] Fund platform account with XLM
- [ ] Configure production signer keys
- [ ] Set up key management system (KMS/HSM)
- [ ] Configure backup signers
- [ ] Test transaction submission

### Deployment Options

## Option 1: Cloud Platform (Recommended)

### Heroku

#### Backend Deployment
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create aidflow-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set STELLAR_NETWORK=public
heroku config:set STELLAR_HORIZON_URL=https://horizon.stellar.org
# ... set all other env vars

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run npm run migrate
```

#### Frontend Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify, Vercel, or AWS S3
netlify deploy --prod --dir=build
```

### AWS

#### Infrastructure Setup
1. **EC2 Instances**
   - Backend API server(s)
   - PostgreSQL RDS instance
   - Redis for caching (optional)

2. **Load Balancer**
   - Application Load Balancer
   - SSL termination
   - Health checks

3. **S3 + CloudFront**
   - Static frontend hosting
   - CDN distribution
   - HTTPS

4. **Security Groups**
   - Backend: Port 5000 (internal)
   - PostgreSQL: Port 5432 (internal only)
   - Load Balancer: Ports 80, 443

#### Backend Deployment Script
```bash
# SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/yourusername/aidflow.git
cd aidflow/backend

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env
nano .env  # Edit with production values

# Start with PM2
pm2 start src/server.js --name aidflow-api
pm2 startup
pm2 save

# Set up nginx reverse proxy
sudo yum install -y nginx
sudo nano /etc/nginx/conf.d/aidflow.conf
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name api.aidflow.org;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Option 2: Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: aidflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_NAME: aidflow
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      STELLAR_NETWORK: ${STELLAR_NETWORK}
      STELLAR_HORIZON_URL: ${STELLAR_HORIZON_URL}
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Deploy with Docker
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Option 3: Kubernetes

### Kubernetes Manifests

Create deployment files in `k8s/` directory:

#### backend-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aidflow-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: aidflow-backend
  template:
    metadata:
      labels:
        app: aidflow-backend
    spec:
      containers:
      - name: backend
        image: your-registry/aidflow-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: aidflow-secrets
              key: db-host
---
apiVersion: v1
kind: Service
metadata:
  name: aidflow-backend-service
spec:
  selector:
    app: aidflow-backend
  ports:
  - port: 5000
    targetPort: 5000
  type: LoadBalancer
```

### Deploy to Kubernetes
```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get services
```

## Post-Deployment

### 1. Monitoring Setup

#### Application Monitoring
- Set up New Relic / DataDog / Application Insights
- Configure error tracking (Sentry)
- Set up uptime monitoring (Pingdom, UptimeRobot)
- Configure performance monitoring

#### Infrastructure Monitoring
- CPU, memory, disk usage
- Database performance
- Network traffic
- API response times

### 2. Logging

#### Centralized Logging
```javascript
// backend/src/config/logger.js
const winston = require('winston');
const CloudWatch = require('winston-cloudwatch');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new CloudWatch({
      logGroupName: 'aidflow',
      logStreamName: 'backend',
      awsRegion: 'us-east-1'
    })
  ]
});
```

### 3. Backup Strategy

#### Database Backups
```bash
# Daily automated backup
0 2 * * * pg_dump -U postgres aidflow | gzip > /backups/aidflow-$(date +\%Y\%m\%d).sql.gz

# Retention: Keep 30 days
find /backups -name "aidflow-*.sql.gz" -mtime +30 -delete
```

#### Configuration Backups
- Store in version control
- Encrypt sensitive values
- Document restoration process

### 4. SSL/TLS Setup

#### Let's Encrypt (Free)
```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.aidflow.org

# Auto-renewal
sudo certbot renew --dry-run
```

### 5. Performance Optimization

#### Backend
- Enable response compression (gzip)
- Implement caching (Redis)
- Database query optimization
- Connection pooling
- Load balancing

#### Frontend
- CDN for static assets
- Image optimization
- Code splitting
- Lazy loading
- Service worker caching

### 6. Disaster Recovery

#### Backup Plan
- Database: Daily automated backups
- Code: Git repository
- Configuration: Encrypted storage
- Secrets: Key management service

#### Recovery Procedure
1. Provision new infrastructure
2. Restore database from backup
3. Deploy latest code
4. Restore configuration
5. Verify functionality
6. Update DNS

### 7. Scaling Strategy

#### Vertical Scaling
- Increase server resources
- Upgrade database tier

#### Horizontal Scaling
- Add more backend instances
- Load balancer distribution
- Database read replicas
- Caching layer

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: |
        cd backend && npm ci
        cd ../frontend && npm ci
    
    - name: Run tests
      run: |
        cd backend && npm test
        cd ../frontend && npm test
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Deploy backend
      run: |
        # Deploy to your hosting service
        # e.g., heroku, aws, etc.
    
    - name: Deploy frontend
      run: |
        # Deploy to Netlify, Vercel, etc.
```

## Maintenance

### Regular Tasks

#### Daily
- Monitor error rates
- Check system health
- Review security alerts

#### Weekly
- Review logs
- Check performance metrics
- Update dependencies (security)

#### Monthly
- Security audit
- Performance optimization
- Backup verification
- Cost analysis

## Support & Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL
```

#### Stellar Transaction Failures
- Check account has sufficient XLM for fees
- Verify network (testnet vs mainnet)
- Check Horizon service status
- Review transaction sequence numbers

### Getting Help

- Documentation: `/docs`
- GitHub Issues: Link to repository
- Email Support: support@aidflow.org
- Community Discord: [Link]

## Security Incident Response

1. **Detect**: Monitor for unusual activity
2. **Contain**: Isolate affected systems
3. **Investigate**: Determine scope and impact
4. **Remediate**: Fix vulnerabilities
5. **Recover**: Restore normal operations
6. **Review**: Post-mortem analysis

## Compliance

- Maintain audit logs (7 years)
- Regular security assessments
- Privacy policy updates
- Terms of service review
- Regulatory filing compliance

## Success Metrics

- Uptime: 99.9% target
- API response time: <500ms p95
- Database queries: <100ms p95
- Error rate: <0.1%
- Security incidents: Zero tolerance
