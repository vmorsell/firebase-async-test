.PHONY: deploy
deploy:
	cd firebase && firebase deploy

.PHONY: login
login:
	cd firebase && firebase login

