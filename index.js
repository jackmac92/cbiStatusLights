import bitbar from 'bitbar';
import { getJobInfo } from 'cbiJenkins';
import { getManyServers } from 'cbiServerUtils';
import config from './config';

const { sep: Separator } = bitbar;
const jobStore = {
  tests: config.monitor.tests.map(t => ({
    name: t,
    jenkinsName: `tests/integration/${t}`
  })),
  builds: config.monitor.builds.map(t => ({
    name: t,
    jenkinsName: t
  }))
};

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

const getJenkinsTests = Promise.all(
  jobStore.tests.map(j => j.jenkinsName).map(getJobInfo)
);

const getJenkinsBuilds = Promise.all(
  jobStore.builds.map(j => j.jenkinsName).map(getJobInfo)
);

const formatJobReport = jobReport => ({
  text: jobReport.name,
  color: jobReport.buildHistory[0].result === 'SUCCESS' ? 'green' : 'red',
  submenu: [
    // { text: 'current build' },
    {
      text: 'Build Now',
      bash: 'curl',
      param1: '-X',
      param2: 'POST',
      param3: jobReport.buildNowUrl,
      terminal: false,
      color: 'blue'
    },
    {
      text: 'Last Failure',
      href: jobReport.lastFailedBuild.url,
      color: 'red'
    },
    {
      text: 'Last Successful Build',
      href: jobReport.lastSuccessfulBuild.url,
      color: 'green'
    },
    {
      text: 'Full History',
      submenu: jobReport.buildHistory.map(b => ({
        text: b.fullDisplayName,
        href: b.url,
        color: b.result === 'SUCCESS' ? 'green' : 'red',
        size: 8
      }))
    }
  ]
});

// Promise.all([getJenkins, setupSshActions(DEFAULT_ENVS, DEFAULT_SERVERS)])
//   .then(results => {
//     const [jenkinsReports, sshStuff] = results;
//     const title = jenkinsReports
//       .filter(j => j.healthReport.score < 90)
//       .map(j => j.name)
//       .join('|');
//     const aboveTheFold = {
//       text: title.length === 0 ? ':thumbsup:' : title,
//       color: bitbar.darkMode ? 'white' : 'red',
//       dropdown: false
//     };
//     const formattedJenkinsReports = [];
//     jenkinsReports.forEach(r => {
//       try {
//         formattedJenkinsReports.push(formatJobReport(r));
//       } catch (e) {
//         // Just want to ignore
//       }
//     });

//     return bitbar([
//       aboveTheFold,
//       Separator,
//       { text: 'Monitored Builds', size: '15' },
//       formattedJenkinsReports,
//       Separator,
//       { text: 'SSH To Servers', size: '15' },
//       ...sshStuff
//     ]);
//   })
//   .catch(console.log);
getJenkinsBuilds.then(results => {
  console.log(Object.keys(results[0]));
  console.log(results[0].buildHistory);
});

