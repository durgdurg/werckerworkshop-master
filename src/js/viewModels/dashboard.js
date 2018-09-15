/**
 * Copyright (c) 2014, 2017, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojknockout', 'ojs/ojfilepicker', 'ojs/ojprogress', 'ojs/ojchart'],
 function(oj, ko, $) {
  
    function DashboardViewModel() {


      var self = this;
      // Below are a subset of the ViewModel methods invoked by the ojModule binding
      // Please reference the ojModule jsDoc for additional available methods.

      self.uploading = ko.observable(false);
      self.progressValue = ko.observable(-1);
      self.multiple = ko.observable(true);
      self.resultData = ko.observable("No Result");
      self.faces = ko.observableArray([]);
      self.multipleStr = ko.pureComputed(function() {
        return self.multiple() ? "multiple" : "single";
      }, self);

      self.acceptStr = ko.observable("image/*");
      self.acceptArr = ko.pureComputed(function() {
        var accept = self.acceptStr();
        return accept ? accept.split(",") : [];
      }, self);

      self.fileNames = ko.observableArray([]);
      self.clickedButton = ko.observable("(None clicked yet)");
      self.buttonClick = function(event){
        self.uploading(true);        
        emotionsAPI(self.imageFile().src)
        return true;
      }      

      var FileModel= function (name, src) {
        var self = this;
        this.name = name;
        this.src= src ;
      };
     
      var FaceModel= function (height, width, left, top, rank, anger,contempt,disgust,fear,happiness,neutral,sadness,surprise) {
        var parentself = self;
        var self = this;
        this.height = height;
        this.width = width;
        this.left = left;
        this.top = top;
        this.rank = rank;
        this.anger = anger;
        this.contempt = contempt;
        this.disgust = disgust;
        this.fear = fear;
        this.happiness = happiness;
        this.neutral = neutral;
        this.sadness = sadness;
        this.surprise = surprise;
        

        self.showData = function(place) {
          var pieSeries2 = [{name: "anger", items: [anger]},
          {name: "contempt", items: [contempt]},
          {name: "disgust", items: [disgust]},
          {name: "fear", items: [fear]},
          {name: "happiness", items: [happiness]},
          {name: "neutral", items: [neutral]},
          {name: "sadness", items: [sadness]},
          {name: "surprise", items: [surprise]},
        ];
     
        window.pie(pieSeries2);
      }
        
      };      

      self.pieSeriesValue = ko.observableArray();
      window.pie = self.pieSeriesValue;
      self.imageFile = ko.observable();
      self.selectListener = function(event) {

        var f = event.detail.files[0];
          var reader = new FileReader();          
          // Closure to capture the file information.
          reader.onload = (function(theFile) {
              return function(e) { 
                  self.faces([]);                          
                  self.imageFile(new FileModel(escape(theFile.name),e.target.result));
                  var $el = $("#imageContainer");
                  img = new Image();
                  img.onload = function () {

                    var scale = Math.min(
                      600 / this.width
                    );
                      $el.css({
                        transform: "scale(" + scale + ")"
                      });
                      self.uploading(true);        
                      emotionsAPI(self.imageFile().src)
                      return true;
                  };
                  img.src = e.target.result;
                 
                };                            
          })(f);
          // Read in the image file as a data URL.
          reader.readAsDataURL(f);
        }      

     
        /**
       * Optional ViewModel method invoked when this ViewModel is about to be
       * used for the View transition.  The application can put data fetch logic
       * here that can return a Promise which will delay the handleAttached function
       * call below until the Promise is resolved.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @return {Promise|undefined} - If the callback returns a Promise, the next phase (attaching DOM) will be delayed until
       * the promise is resolved
       */
      self.handleActivated = function(info) {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {boolean} info.fromCache - A boolean indicating whether the module was retrieved from cache.
       */
      self.handleAttached = function(info) {
        // Implement if needed
      };


      /**
       * Optional ViewModel method invoked after the bindings are applied on this View. 
       * If the current View is retrieved from cache, the bindings will not be re-applied
       * and this callback will not be invoked.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       */
      self.handleBindingsApplied = function(info) {
        // Implement if needed
      };

      /*
       * Optional ViewModel method invoked after the View is removed from the
       * document DOM.
       * @param {Object} info - An object with the following key-value pairs:
       * @param {Node} info.element - DOM element or where the binding is attached. This may be a 'virtual' element (comment node).
       * @param {Function} info.valueAccessor - The binding's value accessor.
       * @param {Array} info.cachedNodes - An Array containing cached nodes for the View if the cache is enabled.
       */
      self.handleDetached = function(info) {
        // Implement if needed
      };

      function emotionsAPI(file) {
        
          $.ajax({
              method: 'POST',
              url: 'http://35.226.87.151/',
              data: '{ "Url":"' + file + '"}',
              headers: { 'Content-Type': 'application/json'}
          })
          .then(function (response) {
              self.uploading(false);
              console.log(response)
              var facedata = JSON.parse(response);
              self.resultData(facedata);

              facedata.sort(function (a, b) {
                  return parseFloat(b.scores.happiness) - parseFloat(a.scores.happiness);
              });

              for (var i = 0; i < facedata.length; i++) { 
                var r = facedata[i].faceRectangle;   
                var s = facedata[i].scores;    
                self.faces.push(new FaceModel(r.height + "px",r.width + "px",r.left + "px", r.top + "px",i + 1, s.anger, s.contempt,s.disgust, s.fear, s.happiness,s.neutral, s.sadness,s.surprise));                
              }             
  
              /* facedata.sort(function (a, b) {
                  return parseFloat(b.scores.happiness) - parseFloat(a.scores.happiness);
              });
              
              for (var i = 0; i < facedata.length; i++) {
  
                  var img = new Image();
                  createfunc(i, img);
  
              }
              function createfunc(i, img) {
                  img.onload = function () {
                      crop(i);
                  }
                  img.src = document.getElementById("myImage").src;
                  function crop(person) {
                      var canvas = document.createElement('canvas');
                      var ctx = canvas.getContext("2d");
                      var h = facedata[person].faceRectangle.height;
                      var l = facedata[person].faceRectangle.left;
                      var t = facedata[person].faceRectangle.top;
                      var w = facedata[person].faceRectangle.width;
                      // this takes a 105x105px crop from img at x=149/y=4
                      // and copies that crop to the canvas
                      ctx.drawImage(img, l - w, t, w * 3, h * 3, 0, 0, 300, 300);
                      // this uses the canvas as the src for the cropped img element
                      self.results.add(canvas.toDataURL(), facedata[person].scores);
  
                  }
              } */
          })
      };  

    }

    

    /*
     * Returns a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.  Return an instance of the ViewModel if
     * only one instance of the ViewModel is needed.
     */
    return new DashboardViewModel();


  }
);
