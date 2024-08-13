pipx run keymap-drawer parse -c 10 -z ./config/corne.keymap >./visual/corne_keymap.yaml
deno run --allow-read --allow-write ./visual/transformKeymap.ts
pipx run keymap-drawer draw ./visual/transformed_keymap.yaml >./visual/keymap.svg
deno run -A --unstable ./visual/preview.ts