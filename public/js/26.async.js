webpackJsonp([26],{1234:function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0}),t.queryCurrent=t.query=void 0;var u=r(184),a=n(u),s=r(321),c=n(s),o=(t.query=function(){var e=(0,c.default)(a.default.mark(function e(){return a.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,f.default)("/api/users"));case 1:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}(),t.queryCurrent=function(){var e=(0,c.default)(a.default.mark(function e(){return a.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",(0,f.default)("/api/currentUser"));case 1:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}(),r(322)),f=n(o)},736:function(e,t,r){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var u=r(8),a=n(u),s=r(184),c=n(s),o=r(1234);t.default={namespace:"user",state:{list:[],loading:!1,currentUser:{}},effects:{fetch:c.default.mark(function e(t,r){var n,u=r.call,a=r.put;return c.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,a({type:"changeLoading",payload:!0});case 2:return e.next=4,u(o.query);case 4:return n=e.sent,e.next=7,a({type:"save",payload:n});case 7:return e.next=9,a({type:"changeLoading",payload:!1});case 9:case"end":return e.stop()}},e,this)}),fetchCurrent:c.default.mark(function e(t,r){var n,u=r.call,a=r.put;return c.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,u(o.queryCurrent);case 2:return n=e.sent,e.next=5,a({type:"saveCurrentUser",payload:n});case 5:case"end":return e.stop()}},e,this)})},reducers:{save:function(e,t){return(0,a.default)({},e,{list:t.payload})},changeLoading:function(e,t){return(0,a.default)({},e,{loading:t.payload})},saveCurrentUser:function(e,t){return(0,a.default)({},e,{currentUser:t.payload})},changeNotifyCount:function(e,t){return(0,a.default)({},e,{currentUser:(0,a.default)({},e.currentUser,{notifyCount:t.payload})})}}},e.exports=t.default}});