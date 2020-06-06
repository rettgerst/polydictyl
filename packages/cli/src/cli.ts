import { program } from 'commander';

import dictate from './dictate';
import dictateRss from './dictateRss';

program.command('dictate <input>').action(dictate);
program.command('dictate-rss <input>').action(dictateRss);

program.parse(process.argv);
