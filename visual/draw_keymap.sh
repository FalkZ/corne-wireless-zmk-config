~/.local/bin/keymap parse -c 10 -z ./config/corne.keymap >./visual/corne_keymap.yaml
deno run --allow-read --allow-write ./visual/transformKeymap.ts
~/.local/bin/keymap draw ./visual/transformed_keymap.yaml >./visual/keymap.svg