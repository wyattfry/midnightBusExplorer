#!/usr/bin/env node

const childProcess = require('child_process');
const fs = require('fs');

const { Command } = require('commander');

// const QueueOperations = require('./queueOperations');

const { NamespaceOperations } = require('./namespaceOperations');

async function main() {
  const program = new Command();
  program
    .version('0.0.2')
    .description('Terminal tool for operation on azure service busses');

  // ----- Namespace Operations -----
  const nsCommand = program.command('ns')
    .description('Manage service bus namespaces');

  const nsOps = new NamespaceOperations(fs, childProcess);

  nsCommand
    .command('list')
    .description('List service bus namespaces i.e. resourceGroup/namespace')
    .option('-g, --resource-group <name>', 'limit listing to the given resource group')
    .action((resourceGroup) => nsOps.List(resourceGroup));

  nsCommand
    .command('set')
    .requiredOption('-g, --resource-group <name>', 'the namespace\'s resource group')
    .argument('<name>', 'the namespace name, e.g. "us-dev-01"')
    .description('Set your "active" namespace')
    .action((name, resourceGroup) => nsOps.Set(name, resourceGroup));

  // ----- Queue Operations -----
  const queueCommand = program.command('queue')
    .description('Manage service bus queues');

  queueCommand
    .command('list')
    .description('List service bus queues')
    .action(() => console.log('TODO list queues here'));

  queueCommand
    .command('monitor')
    .description('Monitor messages in a service bus queue')
    .action(() => console.log('TODO monitor queues here'));

  queueCommand
    .command('send')
    .description('Send a message to a service bus queue')
    .argument('<queue_name>', 'name of the queue')
    .argument('<file>', 'path of a json file containing the message body')
    .action(() => console.log('TODO send message here'));

  queueCommand
    .command('peek')
    .description('Peek service bus queues')
    .argument('<queue_name>', 'name of the queue')
    .option('-c, --message-count', 'count of messages to peek', 10)
    .option('-o, --message-offset', 'where to start from in the sub queue index', 0)
    .option('-s, --subqueue-name', 'Sub queue name you wish to peek', 'deadletter')
    .option('-f, --output-file', 'if provided with a filepath Will write subqueue contents to a specified file')
    .option('-r, --use-resend-format', 'format file output in a way consumable by queue-message-send', false)
    .option('-g, --filter-subject <pattern>', 'only return messages that contain the provided filter string')
    .action(() => console.log('TODO peek queues here'));

  program.parse();
}

main().catch((err) => {
  console.log('Error occurred: ', err);
  process.exit(1);
});
