/*global ko:true*/
(function(){
  "use strict";

  var RequestParameter = function() {
    var self = this;

    self.name = ko.observable();
    self.value = ko.observable();
  };

  var RequestHeader = function() {
    var self = this;

    self.name = ko.observable();
    self.value = ko.observable();
  };

  var CurlBuilder = function() {
    var self = this;

    self.requestTypes = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    // observables
    self.uri = ko.observable('');
    self.requestType = ko.observable();
    self.rawBody = ko.observable('');

    self.headers = ko.observableArray();
    self.newHeaderName = ko.observable('');
    self.newHeaderValue = ko.observable('');

    self.requestParameters = ko.observableArray();
    self.useRequestParameters = ko.observable('yes');
    self.requestParameters = ko.observableArray();
    self.newParameterName = ko.observable('');
    self.newParameterValue = ko.observable('');

    self.useBasicAuth = ko.observable(false);
    self.basicAuthUser = ko.observable('');
    self.basicAuthPassword = ko.observable('');

    // actions
    self.addParameter = function() {
      var rParam = new RequestParameter();
      rParam.name(self.newParameterName());
      rParam.value(self.newParameterValue());
      self.newParameterName('');
      self.newParameterValue('');
      self.requestParameters.push(rParam);
    };
    self.removeRequestParameter = function(param) {
      self.requestParameters.remove(param);
    };

    self.addHeader = function() {
      var rHeader = new RequestHeader();
      rHeader.name(self.newHeaderName());
      rHeader.value(self.newHeaderValue());
      self.newHeaderName('');
      self.newHeaderValue('');
      self.headers.push(rHeader);
    };
    self.removeHeader = function(param) {
      self.headers.remove(param);
    };

    // computed observables
    self.enabledParams = ko.computed(function() {
      return self.useRequestParameters() === 'yes';
    });
    self.enabledRawBody = ko.computed(function() {
      return !self.enabledParams();
    });
    self.canAddParameter = ko.computed(function(){
      if (self.newParameterName().length < 1 || self.newParameterValue().length < 1) {
        return false;
      }
      return true;
    });
    self.canAddHeader = ko.computed(function(){
      if (self.newHeaderName().length < 1 || self.newHeaderValue().length < 1) {
        return false;
      }
      return true;
    });
    self.curlRequest = ko.computed(function(){
      // TODO break this up
      var i;
      var curlRequest = ['curl'];
      curlRequest.push(' -X ' + self.requestType());
      if (self.enabledParams()) {
        for(i=0; i<self.requestParameters().length; i++) {
          curlRequest.push(' -d '+self.requestParameters()[i].name()+'='+self.requestParameters()[i].value()); // TODO quoting issues?
        }
      } else if(self.rawBody().length > 0) {
        curlRequest.push(' -d '+self.rawBody());
      }
      for(i=0; i<self.headers().length; i++) {
        curlRequest.push(' -H "'+self.headers()[i].name()+': '+self.headers()[i].value()+'"'); // TODO quoting issues?
      }
      if (self.useBasicAuth()) {
        curlRequest.push(' --user '+self.basicAuthUser()+':'+self.basicAuthPassword());
      }
      curlRequest.push(' "' + self.uri() + '"'); // TODO quoting issues?
      return curlRequest.join(' ');
    });
  };

  ko.applyBindings(new CurlBuilder());

}());
