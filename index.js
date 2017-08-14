const bitbar = require('bitbar');
const JenkinsFetcher = require('cbiJenkins');
const path = require('path');
const config = require('./config');

const { sep: Separator } = bitbar;
const jobStore = {
  tests: config.monitor.tests.map(t => ({
    name: t,
    friendlyName: `${t.split('/').join(' ')} test`,
    jenkinsName: `tests/integration/${t}`
  })),
  builds: config.monitor.builds.map(t => ({
    name: t,
    friendlyName: `${t.split('/').join(' ')} build`,
    jenkinsName: t
  }))
};

const jenkUsername = process.env.JENKINS_USERNAME;
const jenkPassword = process.env.JENKINS_PASSWORD;

const JenkinsFetch = new JenkinsFetcher({
  dir: path.join(process.env.HOME, 'jenkinsCache'),
  username: jenkUsername,
  password: jenkPassword
});

const allTests = jobStore.tests.map(j => j.jenkinsName);
const allBuilds = jobStore.builds.map(j => j.jenkinsName);
const allJenkins = [...allTests, ...allBuilds];

const tryFormatReport = jobReport => {
  try {
    return formatJobReport(jobReport);
  } catch (e) {
    return {
      text: `Unable to get job`
    };
  }
};

const formatCmdArr = cmdArr => {
  const result = {};
  result.bash = cmdArr[0];
  cmdArr.slice(1).forEach((par, i) => {
    result[`param${i + 1}`] = `${par}`;
  });
  return result;
};

const formatCmd = cmd => formatCmdArr(cmd.split(' '));

const lastBuildFailed = ({ isError, buildHistory }) => {
  if (isError) {
    return false;
  }
  if (buildHistory[0].building !== true) {
    return buildHistory[0].result !== 'SUCCESS';
  } else {
    return buildHistory[1].result !== 'SUCCESS';
  }
};

const formatJobReport = jobReport => {
  const isBuilding = jobReport.buildHistory[0].building === true;
  const color = jobReport.buildHistory[isBuilding ? 1 : 0].result === 'SUCCESS'
    ? 'green'
    : 'red';
  const text = `${jobReport.name}${isBuilding ? ' 🚧' : ''}`;
  return {
    text,
    color,
    submenu: [
      isBuilding
        ? {
            text: 'Stream Current Logs',
            ...formatCmd(
              `JENKINS_URL="https://${jenkUsername}:${jenkPassword}@jenkins.cbinsights.com" && nestor console ${jobReport.jenkinsName
                .split('/')
                .join('/job/')}`
            ),
            terminal: true,
            size: 16
          }
        : {
            text: 'Build Now',
            ...formatCmd(`curl -X POST ${jobReport.buildNowUrl}`),
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
          size: 10
        }))
      }
    ]
  };
};

const makeTitle = reports => {
  if (reports.some(r => r.isError)) {
    return ':warning:';
  } else if (reports.some(lastBuildFailed)) {
    return ':fire:';
  }
  return ':thumbsup:';
};

Promise.all(
  allJenkins.map(j =>
    JenkinsFetch.getJobInfo(j).catch(err => ({
      error: true,
      err
    }))
  )
)
  .then(jenkinsReports => {
    const title = makeTitle(jenkinsReports);
    const aboveTheFold = {
      text: title,
      color: bitbar.darkMode ? 'white' : 'red',
      dropdown: false
    };
    return bitbar([
      aboveTheFold,
      Separator,
      { text: 'Monitored Builds', size: '15' },
      ...jenkinsReports.map(tryFormatReport).filter(a => a)
    ]);
  })
  .catch(console.log);
