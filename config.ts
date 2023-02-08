import fs from 'fs';
import toml from 'toml';

let config = toml.parse(fs.readFileSync('config-instance.toml').toString());

export default config;