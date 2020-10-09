const yargs = require('yargs');
const inquirer = require('inquirer');
const compose = require('lodash/fp/compose');

const botTypes = require('./types');

const promptConfig = {
  type: 'list',
  name: 'botType',
  message: 'Which bot should be spawned?',
  choices: Object.keys(botTypes)
};

main();
async function main() {
  const botType = await getBotType();
  if (!botType) {
    return;
  }

  if (!Object.keys(botTypes).includes(botType)) {
    return;
  }

  const { base, mixins, props } = botTypes[botType];
  const BotTypeComposition = compose(...mixins)(base);
  const botInstance = new BotTypeComposition(props);
  botInstance.initConnection();
}

async function getBotType() {
  const { argv } = yargs.help().alias('help', 'h');
  if (argv && argv.type) {
    return argv.type;
  }

  if (argv && argv.t) {
    return argv.t;
  }

  const answer = await inquirer.prompt([promptConfig]);
  const { botType } = answer;
  return botType;
}
