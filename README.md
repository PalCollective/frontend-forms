# Quick instructions

For desployment on the ypc server instance, all one need to do is to switch to the right docker context (check other respositories in the organisation for insructions) and run the following commands:
```bash
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up --build --detach
```
