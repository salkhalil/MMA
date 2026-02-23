.PHONY: services/up services/down db/setup db/migrate db/seed db/reset

services/up:
	docker compose -f services/compose.yaml up -d

services/down:
	docker compose -f services/compose.yaml down

db/setup: db/migrate db/seed

db/migrate:
	npm run db:migrate

db/seed:
	npm run db:seed

db/reset:
	docker compose -f services/compose.yaml down -v
	docker compose -f services/compose.yaml up -d
	@echo "Waiting for postgres to be ready..."
	@sleep 3
	$(MAKE) db/setup
