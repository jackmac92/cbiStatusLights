import bitbar from 'bitbar';
import { getFormattedJobReports } from 'cbiJenkins';
import { getManyServers } from 'cbiServerUtils';
import config from './config';

const { sep: Separator } = bitbar;
const jobStore = [
  ...config.monitor.tests.map(t => ({
    name: t,
    jenkinsName: `tests/integration/${t}`
  })),
  ...config.monitor.builds.map(t => ({
    name: t,
    jenkinsName: t
  }))
];

const setupSshActions = (envs, servers) =>
  getManyServers(envs, servers).then(serverMap =>
    Object.keys(serverMap).map(server => ({
      text: server,
      submenu: envs.map(env => ({
        text: `${env} servers`,
        submenu: serverMap[server][env].map(ip => ({
          text: `ssh to ${ip}`,
          bash: 'ssh',
          param1: ip,
          terminal: true
        }))
      }))
    }))
  );
const DEFAULT_ENVS = ['dev', 'staging', 'prod'];
const DEFAULT_SERVERS = ['api', 'cbi-site', 'test-runner'];

Promise.all([
  getFormattedJobReports(jobStore),
  setupSshActions(DEFAULT_ENVS, DEFAULT_SERVERS)
])
  .then(results => {
    const [reports, sshStuff] = results;
    const { err: jenkinsFailures, items: jenkinsReports } = reports;
    let title;
    if (jenkinsFailures) {
      title = `:bangbang: ${jenkinsFailures}`;
    } else {
      title = ':thumbsup:';
    }
    const aboveTheFold = {
      text: title,
      color: bitbar.darkMode ? 'white' : 'red',
      dropdown: false
    };

    return bitbar([
      aboveTheFold,
      Separator,
      { text: 'Monitored Builds', size: '15' },
      ...jenkinsReports,
      Separator,
      { text: 'SSH To Servers', size: '15' },
      ...sshStuff
    ]);
  })
  .catch(console.log);
