export default {
  jenkins: {
    password: '2zxx8b4Pba7u',
    username: 'jmccown'
  },
  jira: {
    username: 'jmccown@cbinsights.com',
    password: 'Dashah7992'
  },
  monitor: {
    tests: [
      'api/selenium-grid-dev',
      'api/selenium-grid-staging',
      'cbi-site/selenium-grid-dev',
      'cbi-site/selenium-grid-staging'
    ],
    builds: [
      'cbi-site/develop',
      'cbi-site/release',
      'cbi-site/master',
      'cbi-api/develop',
      'cbi-api/release',
      // 'cbi-api/master',
      'cbi/develop',
      'cbi/release',
      'cbi/master'
    ]
  }
};
