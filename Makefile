NODE_MODULES ?= ./node_modules
JS_SENTINAL ?= $(NODE_MODULES)/sentinal

$(JS_SENTINAL): package.json
	rm -rf $(NODE_MODULES)
	npm install
	touch $(JS_SENTINAL)

runserver: $(JS_SENTINAL)
	npm run serve

build: $(JS_SENTINAL)
	npm run build

clean:
	rm -rf node_modules
