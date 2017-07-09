all: $(patsubst scss/%.scss,css/%.css,$(wildcard scss/*.scss))

css/%.css: scss/%.scss
	scss $< $@


.PHONY : all watch

watch:
	scss --watch scss:css
