(function(e,t){"use strict";t.jqEbonyOptions={opacity:.7,zIndex:99999,escapeCloses:!0,clickCloses:!0,clickCloseArea:null,callbackClose:null,callbackOpen:null,animationSpeed:0,color:[0,0,0]};var n=function(e,n){this.layout=null,this.element=n,this.options=t.extend(t.jqEbonyOptions,e||{})};n.prototype={getLayout:function(){return this.layout},getIndexZ:function(){return parseInt(t("body").data("jqEbony")||this.getOptions().zIndex,10)},getOptions:function(){return this.options},getElement:function(){return this.element},setIndexZ:function(e){return t("body").data("jqEbony",e),this},setLayout:function(e){return this.layout=e,this},hasLayout:function(){return!!this.layout},open:function(){if(this.hasLayout())return this;this.setLayout(this.getDefaultLayout()),this._setListeners(),this.getElement().wrapAll(this.getLayout()),this._transform().setIndexZ(this.getIndexZ()+1);var e=this;return this.getElement().parent().fadeIn(this.getOptions().animationSpeed,function(){e.getElement().css("z-index",e.getIndexZ()).fadeIn(e.getOptions().animationSpeed,function(){typeof e.getOptions().callbackOpen=="function"&&e.getOptions().callbackOpen.call(e)})}),this},close:function(){if(!this.hasLayout())return this;var e=this;return this.getElement().parent().fadeOut(this.getOptions().animationSpeed,function(){e.getElement().unwrap(),e._revert(),e.setLayout(null),typeof e.getOptions().callbackClose=="function"&&e.getOptions().callbackClose.call(e)}),this},getDefaultLayout:function(){var e=[];return e.push(this.getOptions().color),e.push(this.getOptions().opacity),t("<div />").addClass("jqEbony").css({display:"none",position:"fixed",right:0,top:0,left:0,bottom:0,overflow:"auto","z-index":this.getIndexZ(),background:"rgba("+e.join(",")+")"})},_setListeners:function(){var n=this;this.options.escapeCloses&&(t(e).one("keyup.jqEbony",function(e){if((e.keyCode||e.which)===27)return e.stopImmediatePropagation(),n.close()}),t._data(e,"events").keyup.unshift(t._data(e,"events").keyup.pop()));if(this.options.clickCloses){var r=this.getElement().parent();this.getOptions().clickCloseArea!==null&&(r=t(this.getOptions().clickCloseArea)),this.getElement().bind("click.jqEbony",function(e){t(">*",r).each(function(){if(e.target!==this&&t(e.target).closest("html",this).length)return n.close()})})}return this},_transform:function(){var e=this.getElement(),n=t("body"),r=t("html"),i={outerWidth:n.outerWidth(!0),marginRight:parseInt(t("body").css("margin-right"),10),scrollTop:r.scrollTop()};return e.data("jqEbony",this),this.getLayout().data("jqEbonyData",{element:{position:e.css("position"),display:e.css("display"),visibility:e.css("visibility")},html:{overflow:t("html").css("overflow-y")},body:{"margin-right":t("body").css("margin-right")}}),r.css("overflow","hidden"),n.css("margin-right",n.outerWidth(!0)-i.outerWidth+i.marginRight),r.scrollTop(i.scrollTop),this},_revert:function(){this.setIndexZ(this.getIndexZ()-1);if(!this.getLayout().data("jqEbonyData"))return this;var e=this.getLayout(),n=t("html").scrollTop();return t("div.jqEbony").length||(t("body").css(e.data("jqEbonyData").body),t("html").css(e.data("jqEbonyData").html).scrollTop(n)),this.getElement().css(e.data("jqEbonyData").element).removeData("jqEbonyData").removeData("jqEbony"),this}},t.fn.jqEbony=function(e){return this.data("jqEbony")||new n(e,t(this))}})(document,jQuery);