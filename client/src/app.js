'use strict';

import 'ramda';
import 'moment';

import angular from 'angular';

import 'angular-animate';
import 'angular-cookies';
import 'angular-messages';
import 'angular-sanitize';
import 'angular-ui-bootstrap';
import uiRouter from 'angular-ui-router';
import 'angular-ui-validate';
import 'angular-resource';

// Our modules
import lbServices from './lb-services';

import '../less/style.less';

import CONSTANTS from 'server_shared/db-tables-types';

console.log(CONSTANTS);

function appConfig($urlRouterProvider) {
  'ngInject';
  $urlRouterProvider.otherwise('/');
}

angular
  .module('app', [
    lbServices,
    uiRouter
  ])
  .config(appConfig);
