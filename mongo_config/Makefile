customizations = $(wildcard customizations/*.js)
config = config.js

mongorc.js: ${config} ${customizations}
	cat $^ > $@

install: mongorc.js
	@echo "INSTALLATION"
	@echo "Copying mongorc.js..."

	cp "$(CURDIR)/mongorc.js" "$(subst $(notdir $(CURDIR)),,$(CURDIR))/mongorc.js"

	rm "$(CURDIR)/mongorc.js"
