all: $(patsubst scss/%.scss,css/%.css,$(wildcard scss/*.scss))

css/%.css: scss/%.scss
	scss $< $@

.PHONY : all
