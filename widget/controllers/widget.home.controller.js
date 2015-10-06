'use strict';

(function (angular) {
  angular.module('eventsManualPluginWidget')
    .controller('WidgetHomeCtrl', ['$scope', 'TAG_NAMES', 'LAYOUTS', 'DataStore', 'PAGINATION', 'Buildfire',
      function ($scope, TAG_NAMES, LAYOUTS, DataStore, PAGINATION, Buildfire) {
        var WidgetHome = this;
        WidgetHome.data = null;
        WidgetHome.events = [];
        WidgetHome.busy = false;
        $scope.dt = new Date();
        var searchOptions = {
          skip: 0,
          limit: PAGINATION.eventsCount, // the plus one is to check if there are any more
          sort:{"startDate":1 }
        };
        var currentDate = new Date();
        var formattedDate= moment(currentDate).format("MMM")+" "+currentDate.getFullYear()+", "+currentDate.getDate();
        var timeStampinMiliSec = +new Date("'"+formattedDate+"'");
        /*
         * Fetch user's data from datastore
         */
        WidgetHome.getEvent = function()
        {
          formattedDate= moment($scope.dt).format("MMM")+" "+$scope.dt.getFullYear()+", "+$scope.dt.getDate();
          timeStampinMiliSec = +new Date("'"+formattedDate+"'");
          WidgetHome.events={};
          searchOptions.skip=0;
          WidgetHome.busy =false;
          WidgetHome.loadMore();
        }
        var init = function () {
          var success = function (result) {
              WidgetHome.data = result.data;
              if (!WidgetHome.data.content)
                WidgetHome.data.content = {};
              if (!WidgetHome.data.design)
                WidgetHome.data.design = {};
              if (!WidgetHome.data.design.itemDetailsLayout) {
                WidgetHome.data.design.itemDetailsLayout = LAYOUTS.itemDetailsLayout[0].name;
              }
            }
            , error = function (err) {
              if (err && err.code !== STATUS_CODE.NOT_FOUND) {
                console.error('Error while getting data', err);
              }
            };

          DataStore.get(TAG_NAMES.EVENTS_MANUAL_INFO).then(success, error);
        };

        init();
        $scope.getDayClass = function (date, mode) {

          var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
          var currentDay = new Date('2015-09-15T18:30:00.000Z').setHours(0, 0, 0, 0);
          if (dayToCheck === currentDay) {
            return 'eventDate';
          }
        };

        var getManualEvents = function () {
          Buildfire.spinner.show();
          var successEvents = function (result) {
            Buildfire.spinner.hide();
            WidgetHome.events = WidgetHome.events.length ? WidgetHome.events.concat(result) : result;
            searchOptions.skip = searchOptions.skip + PAGINATION.eventsCount;
            if (result.length == PAGINATION.eventsCount) {
              WidgetHome.busy = false;
            }

          }, errorEvents = function () {
            Buildfire.spinner.hide();
            console.log("Error fetching events");
          };

          searchOptions.filter = {"$or": [{"data.startDate": {"$gt":timeStampinMiliSec }},{"data.startDate": {"$eq":timeStampinMiliSec }}]};
          DataStore.search(searchOptions, TAG_NAMES.EVENTS_MANUAL).then(successEvents, errorEvents);
        };

        WidgetHome.loadMore = function () {
          if (WidgetHome.busy) return;
          WidgetHome.busy = true;
          getManualEvents();
        };
      }])
})(window.angular);
