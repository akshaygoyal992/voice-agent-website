.PHONY: help install run build build-prod watch test clean

help:
	@echo "Available commands:"
	@echo "  make install     - install dependencies"
	@echo "  make run         - run local dev server (http://localhost:4201)"
	@echo "  make build       - build app (default config)"
	@echo "  make build-prod  - build optimized production bundle"
	@echo "                    Optional: LOGIN_URL=https://your-login-url"
	@echo "  make watch       - build in watch mode"
	@echo "  make test        - run tests"
	@echo "  make clean       - remove dist output"

install:
	npm ci

run:
	npm start

build:
	npm run build

build-prod:
	npm run build:prod

watch:
	npm run watch

test:
	npm run test

clean:
	rm -rf dist

local: install watch
