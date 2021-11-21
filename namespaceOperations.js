const { homedir, EOL } = require('os');
const util = require('util');
// const defaultConfigPath = `${homedir()}/.midnightServiceBus.config`;

class NamespaceOperations {
/**
 *
 * @param {*} fs the Node.js `fs` module, e.g. `require('fs');`
 * @param {*} childProcess the Node.js `child_process` module, e.g. `require('child_process');`
 * @param {*} defaultConfigPath string: path to user's config file
 */
  constructor(fs, childProcess, defaultConfigPath = `${homedir()}/.midnightServiceBus.config`) {
    this.readFile = util.promisify(fs.readFile);
    this.writeFile = util.promisify(fs.writeFile);
    this.exec = util.promisify(childProcess.exec);
    this.defaultConfigPath = defaultConfigPath;
  }

  static viewNamespaces = (namespaces, active) => {
    // replace a logger via dependency injection
    console.log(namespaces
      .sort((a, b) => (`${a.resourceGroup}${a.namespace}` < `${b.resourceGroup}${b.namespace}` ? -1 : 1))
      .map((x) => {
        const Reset = '\x1b[0m';
        let formatted = '';
        if (x.resourceGroup === active.resourceGroup && x.namespace === active.namespace) {
          const Bright = '\x1b[1m';
          const FgMagenta = '\x1b[35m';
          formatted = `${Bright}${FgMagenta}${x.resourceGroup}${Reset}/${Bright}${FgMagenta}${x.namespace}${Reset}`;
        } else {
          formatted = `${x.resourceGroup}/${x.namespace}`;
        }
        return formatted;
      })
      .join(EOL));
  };

  getNamespaces = async () => {
    const command = "az servicebus namespace list -o tsv --query '[].{resourceGroup:resourceGroup, name:name}'";
    let namespaces = [];
    const { stdout } = await this.exec(command);
    namespaces = stdout
      .split(EOL)
      .filter((x) => x !== '')
      .map((x) => ({
        resourceGroup: x.split('\t')[0],
        namespace: x.split('\t')[1],
      }));
    return namespaces;
  };

  getActive = async () => {
    const data = await this.readFile(this.defaultConfigPath);
    return JSON.parse(data.toString()).active;
  };

  setActive = async (resourceGroup, namespace) => {
    const data = {
      active: {
        resourceGroup,
        namespace,
      },
    };

    await this.writeFile(this.defaultConfigPath, JSON.stringify(data));
  };

  List = async () => {
    const [namespaces, active] = await Promise.all([this.getNamespaces(), this.getActive()]);
    NamespaceOperations.viewNamespaces(namespaces, active);
  };

  Set = async (namespace, options) => {
    const namespaces = await this.getNamespaces();
    const { resourceGroup } = options;

    const namespaceNotFound = namespaces.map((x) => `${x.resourceGroup}/${x.namespace}`).includes(`${resourceGroup}/${namespace}`) === false;

    if (namespaceNotFound) {
      console.error('"%s" "%s" not found in current azure subscription.', resourceGroup, namespace);
      return;
    }
    await this.setActive(resourceGroup, namespace);
    console.log(`Active rg/namespace set to '${resourceGroup}/${namespace}'`);
  };
}

module.exports = {
  NamespaceOperations,
};
