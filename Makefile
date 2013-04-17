REPO 		?= dderl

all: deps compile

compile: 
	rebar compile

deps:
	rebar get-deps

clean:
	rebar clean

generate: compile
	(cd rel && rebar generate target_dir=dev overlay_vars=vars/dev_vars.config)

rel: deps compile generate

rel_bikram: deps compile
	(cd rel && rebar generate target_dir=bikram overlay_vars=vars/bikram_vars.config)

rel_all: rel rel_lu rel_zh

relclean:
	rm -rf rel/bikram

APPS = kernel stdlib sasl erts ssl tools os_mon runtime_tools crypto inets \
	   xmerl webtool snmp public_key mnesia eunit syntax_tools compiler

COMBO_PLT = $(HOME)/.$(REPO)_combo_dialyzer_plt

check_plt: compile
	dialyzer --check_plt --plt $(COMBO_PLT) --apps $(APPS) \
		deps/*/ebin apps/*/ebin

build_plt: compile
	dialyzer --build_plt --output_plt $(COMBO_PLT) --apps $(APPS) \
		deps/*/ebin apps/*/ebin

dialyzer: compile
	@echo
	@echo Use "'make check_plt'" to check PLT prior to using this target.
	@echo Use "'make build_plt'" to build PLT prior to using this target.
	@echo
	@sleep 1
	dialyzer -Wno_return --plt $(COMBO_PLT) deps/*/ebin apps/*/ebin
