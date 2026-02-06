# System Architecture

```mermaid
graph TD
    User[User Browser] <-->|HTTPS| Frontend[Web Frontend]
    Frontend <-->|API Call| Backend[Backend API]
    Backend <-->|Vector Search| RecipeEmbeddings[Recipe Embeddings Service]
    RecipeEmbeddings <-->|pgvector| RecipeDB[(Recipe Database<br/>2.2M Recipes)]
    Backend <--> ApplicationDB[(Application Database)]
    Backend <-->|OCR API| ReceiptService[Receipt Recognition]
```

### Considerations and future details: 

- Infrastructure/Platform Components
    - Authentication
    - Load balancer / Cloud hosting layer
    - Reverse Proxy / API Gateway

- Backend Components
    - Microservices
    - Background workers or queues (for async tasks)
    - Caching layer (Redis, Memcached)

- Observability & DevOps
    - Logging/monitoring stack (e.g., ELK, Prometheus)
    - CI/CD pipeline
